import { addWordsToUserDictAction } from "@/actions/user-dict-action";
import { DEFAULT_SITE_LANGUAGE } from "@/utils/config";
import { sendNotificationToUser } from "@/utils/push-notification";
import { getTranslations } from "next-intl/server";

const POST = async (request: Request) => {
	try {
		const {
			userId,
			dictId,
			words,
			notification,
			locale = DEFAULT_SITE_LANGUAGE,
		} = await request.json();

		if (!dictId || !Array.isArray(words) || !userId) {
			return new Response("Body is invalid", { status: 500 });
		}
		const tNotification = await getTranslations({
			locale,
			namespace: "Notification",
		});
		await addWordsToUserDictAction(dictId, words, userId);
		console.log(
			"[POST][/api/dict-items/create]:",
			`userId: ${userId} dictId: ${dictId} words: ${words} locale: ${locale} notification: ${notification}`,
		);

		// 发送通知
		const notificationResult = await sendNotificationToUser(
			{
				title: tNotification("addWordSuccess"),
				body: tNotification("addWordContent", { word: words.join(", ") }),
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
