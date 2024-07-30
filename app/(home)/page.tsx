import { HomeStatus } from "@/components/home-status";
import type { Dicts } from "@/types/dict";

import { fetchDict } from "@/utils/api";

export default async function HomePage({
	searchParams,
}: { searchParams: { dict?: Dicts } }) {
	const targetDict = searchParams.dict;
	const dict = await fetchDict(targetDict);
	return (
		<main className="w-full flex flex-col items-center justify-center">
			<HomeStatus dict={dict} />
		</main>
	);
}
