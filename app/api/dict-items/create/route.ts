import { addWordsToUserDictAction } from "@/actions/user-dict-action";

const POST = async (request: Request) => {
	try {
		const { userId, dictId, words } = await request.json();
		if (!dictId || !Array.isArray(words) || !userId) {
			return new Response("Body is invalid", { status: 500 });
		}
		await addWordsToUserDictAction(dictId, words, userId);
		console.log(
			"[POST][/api/dict-items/create]:",
			`userId: ${userId} dictId: ${dictId} words: ${words}`,
		);
		return new Response("OK", { status: 200 });
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	} catch (error: any) {
		return new Response(error.message, { status: 500 });
	}
};

export { POST };
