import { addWordsToUserDictAction } from "@/actions/user-dict-action";

const POST = async (request: Request) => {
	const { userId, dictId, words } = await request.json();
	if (!dictId || !Array.isArray(words) || !userId) {
		return new Response("Body is invalid", { status: 500 });
	}
	await addWordsToUserDictAction(dictId, words, userId);
	return new Response("OK", { status: 200 });
};

export { POST };
