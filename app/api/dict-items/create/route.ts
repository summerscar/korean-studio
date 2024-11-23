import { addWordsToUserDictAction } from "@/actions/user-dict-action";
import { DEFAULT_SITE_LANGUAGE } from "@/utils/config";
import { sendNotificationToUser } from "@/utils/push-notification";

const getMessages = async (locale: string) => {
	try {
		return (await import(`../../../../messages/${locale}.json`)).default;
	} catch (e) {
		console.warn(`[getMessages] Fallback to ${DEFAULT_SITE_LANGUAGE}:`, e);
		return (await import(`../../../../messages/${DEFAULT_SITE_LANGUAGE}.json`))
			.default;
	}
};

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

		const messages = await getMessages(locale);

		await addWordsToUserDictAction(dictId, words, userId);
		console.log(
			"[POST][/api/dict-items/create]:",
			`userId: ${userId} dictId: ${dictId} words: ${words} locale: ${locale} notification: ${notification}`,
		);

		// 发送通知
		const notificationResult = await sendNotificationToUser(
			{
				title: messages.Notification.addWordSuccess,
				body: messages.Notification.addWordContent.replace(
					"{word}",
					words.join(", "),
				),
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
