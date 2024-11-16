import { keystoneContext } from "@/../keystone/context";
import { auth } from "auth";
import { NextResponse } from "next/server";
import webpush from "web-push";

// 配置 web-push
webpush.setVapidDetails(
	"mailto:summerscar1996@gmail.com",
	process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
	process.env.VAPID_PRIVATE_KEY!,
);

export async function POST(request: Request) {
	try {
		const { payload, userIds } = await request.json();
		const session = await auth();

		if (!session?.user?.email) {
			return NextResponse.json(
				{ success: false, error: "Unauthorized" },
				{ status: 401 },
			);
		}

		// 构建查询条件
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		const where: any = {};
		if (userIds && userIds.length > 0) {
			where.user = { id: { in: userIds } };
		}

		// 获取符合条件的所有活跃订阅
		const subscriptions = await keystoneContext
			.sudo()
			.db.PushSubscription.findMany({
				where,
			});

		if (subscriptions.length === 0) {
			return NextResponse.json(
				{ success: false, error: "No active subscriptions found" },
				{ status: 404 },
			);
		}

		// 向所有订阅者发送推送
		const results = await Promise.allSettled(
			subscriptions.map(async (subscription) => {
				try {
					await webpush.sendNotification(
						{
							endpoint: subscription.endpoint,
							keys: subscription.keys as {
								p256dh: string;
								auth: string;
							},
						},
						JSON.stringify({
							...payload,
							userId: subscription.userId,
						}),
					);

					// 更新最后使用时间
					await keystoneContext.sudo().db.PushSubscription.updateOne({
						where: { id: subscription.id },
						data: { lastUsed: new Date().toISOString() },
					});

					return { success: true, userId: subscription.userId };
				} catch (error) {
					console.error(
						`Error sending notification to user ${subscription.userId}:`,
						error,
					);

					// 如果发送失败（订阅已过期）
					await keystoneContext.sudo().db.PushSubscription.deleteOne({
						where: { id: subscription.id },
					});

					return {
						success: false,
						userId: subscription.userId,
						error: error instanceof Error ? error.message : "Unknown error",
					};
				}
			}),
		);

		// 统计发送结果
		const successCount = results.filter(
			(result) => result.status === "fulfilled" && result.value.success,
		).length;
		const failureCount = results.length - successCount;

		return NextResponse.json({
			success: true,
			stats: {
				total: results.length,
				success: successCount,
				failure: failureCount,
			},
			results: results.map((result) => {
				if (result.status === "fulfilled") {
					return result.value;
				}
				return {
					success: false,
					error: result.reason,
				};
			}),
		});
	} catch (error) {
		console.error("Error sending push notifications:", error);
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}

/*
// 发送给所有用户
fetch("/api/push/send", {
	method: "POST",
	headers: {
		"Content-Type": "application/json",
	},
	body: JSON.stringify({
		payload: {
			title: "全局通知",
			body: "这是发送给所有用户的通知",
		},
	}),
});

// 发送给特定用户
 fetch('/api/push/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    userIds: ['user1', 'user2'],
    payload: {
      title: '个人通知',
      body: '这是发送给特定用户的通知',
    },
  }),
}); */

/* {
  success: true,
  stats: {
    total: 3,
    success: 2,
    failure: 1
  },
  results: [
    { success: true, userId: 'user1' },
    { success: true, userId: 'user2' },
    { success: false, userId: 'user3', error: 'Subscription expired' }
  ]
} */
