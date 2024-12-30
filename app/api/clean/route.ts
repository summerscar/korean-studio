import { clearCacheAction } from "@/actions/clear-cache-actions";

const GET = async () => {
	await clearCacheAction("/");
	return new Response("OK", { status: 200 });
};

export { GET };
