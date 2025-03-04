import { keystoneContext } from "@/../keystone/context";
import { auth } from "auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
	try {
		const subscription = await request.json();
		const session = await auth();

		if (!session?.user?.email) {
			return NextResponse.json(
				{ success: false, error: "Unauthorized" },
				{ status: 401 },
			);
		}

		// 查找用户
		const user = await keystoneContext.sudo().db.User.findOne({
			where: { email: session.user.email },
		});

		if (!user) {
			return NextResponse.json(
				{ success: false, error: "User not found" },
				{ status: 404 },
			);
		}

		// 检查是否已存在相同的订阅
		const existingSubscription = (
			await keystoneContext.sudo().db.PushSubscription.findMany({
				where: {
					endpoint: { equals: subscription.endpoint },
				},
			})
		)[0];

		if (existingSubscription) {
			// 如果是同一个用户的最近订阅，只更新时间戳
			if (existingSubscription.userId === user.id) {
				await keystoneContext.sudo().db.PushSubscription.updateOne({
					where: { id: existingSubscription.id },
					data: { lastUsed: new Date() },
				});
				return NextResponse.json({ success: true, updated: true });
			}

			// 如果是不同用户的相同endpoint，删除旧订阅
			await keystoneContext.sudo().db.PushSubscription.deleteOne({
				where: { id: existingSubscription.id },
			});
		}

		// 创建新的订阅
		const userAgent = request.headers.get("user-agent") || "unknown";

		// 简单解析设备信息
		const isMobile = /mobile/i.test(userAgent);
		const isTablet = /tablet|ipad/i.test(userAgent);
		const deviceType = isTablet ? "tablet" : isMobile ? "mobile" : "desktop";

		// 获取操作系统信息
		const osMatch = userAgent.match(
			/(Windows|Mac|Linux|Android|iOS)[^;)]*/,
		) || ["unknown"];
		const os = osMatch[0];

		// 获取浏览器信息
		const browserMatch = userAgent.match(
			/(Chrome|Firefox|Safari|Edge|Opera)[\/\s](\d+)/,
		) || ["unknown"];
		const browser = browserMatch[0];

		await keystoneContext.sudo().db.PushSubscription.createOne({
			data: {
				endpoint: subscription.endpoint,
				expirationTime: subscription.expirationTime,
				keys: subscription.keys,
				user: {
					connect: {
						id: user.id,
					},
				},
				lastUsed: new Date(),
				userAgent,
				deviceType,
				os,
				browser,
			},
		});

		return NextResponse.json({ success: true, created: true });
	} catch (error) {
		console.error("Error subscribing to push notifications:", error);
		return NextResponse.json(
			{ success: false, error: "Invalid subscription" },
			{ status: 400 },
		);
	}
}
