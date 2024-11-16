import { keystoneContext } from "@/../keystone/context";
import webpush from "web-push";

export type NotificationPayload = {
	title: string;
	body: string;
	data?: {
		url?: string;
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		[key: string]: any;
	};
};

export async function sendNotificationToUser(
	userId: string,
	payload: NotificationPayload,
) {
	try {
		// 查找用户的推送订阅
		const subscriptions = await keystoneContext.db.PushSubscription.findMany({
			where: {
				user: {
					id: { equals: userId },
				},
				lastUsed: {
					gt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7天内活跃的订阅
				},
			},
		});

		if (subscriptions.length === 0) {
			return { success: false, reason: "no-subscriptions" };
		}

		const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
		const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY!;

		webpush.setVapidDetails(
			"mailto:test@example.com", // 替换为你的联系邮箱
			vapidPublicKey,
			vapidPrivateKey,
		);

		// 并行发送所有通知
		const results = await Promise.all(
			subscriptions.map(async (subscription) => {
				try {
					await webpush.sendNotification(
						{
							endpoint: subscription.endpoint,
							keys: subscription.keys as { p256dh: string; auth: string },
						},
						JSON.stringify(payload),
					);
					return { success: true, subscriptionId: subscription.id };
				} catch (error) {
					console.error("Failed to send notification:", error);
					// 如果发送失败，删除过期的订阅
					// biome-ignore lint/suspicious/noExplicitAny: <explanation>
					if ((error as any).statusCode === 410) {
						await keystoneContext.db.PushSubscription.deleteOne({
							where: { id: subscription.id },
						});
					}
					return {
						success: false,
						subscriptionId: subscription.id,
						error: error instanceof Error ? error.message : String(error),
					};
				}
			}),
		);

		const successCount = results.filter((r) => r.success).length;
		return {
			success: successCount > 0,
			results,
			successCount,
			totalCount: subscriptions.length,
		};
	} catch (error) {
		console.error("Error sending notification:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : String(error),
		};
	}
}
