import { addWordsToUserDictAction } from "@/actions/user-dict-action";
import { sendNotificationToUser } from "@/utils/push-notification";

const POST = async (request: Request) => {
	try {
		const { userId, dictId, words, notification } = await request.json();
		if (!dictId || !Array.isArray(words) || !userId) {
			return new Response("Body is invalid", { status: 500 });
		}

		await addWordsToUserDictAction(dictId, words, userId);
		console.log(
			"[POST][/api/dict-items/create]:",
			`userId: ${userId} dictId: ${dictId} words: ${words}`,
		);

		// 发送通知
		const notificationResult = await sendNotificationToUser(
			{
				title: "单词已添加到词单",
				body: `成功添加了【${words.join(", ")}】单词`,
				data: {
					url: `/?dict=${dictId}`,
					dictId,
					notification,
				},
			},
			[userId],
		);

		return new Response(
			JSON.stringify({
				success: true,
				notification: notificationResult,
			}),
			{
				status: 200,
				headers: {
					"Content-Type": "application/json",
				},
			},
		);
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	} catch (error: any) {
		console.error("Error in /api/dict-items/create:", error);
		return new Response(error.message, { status: 500 });
	}
};

export { POST };
