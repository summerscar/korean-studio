import { HomeStatus } from "@/components/home-status";
import { Dicts, dictNameList } from "@/types/dict";

import { fetchDict } from "@/utils/api";

export default async function HomePage(props: {
	searchParams: Promise<{ dict?: string }>;
}) {
	const searchParams = await props.searchParams;
	const targetDict =
		searchParams &&
		dictNameList.includes(searchParams.dict as unknown as Dicts) &&
		searchParams.dict !== Dicts.user
			? (searchParams.dict as unknown as Dicts)
			: Dicts.popular;

	const dict = await fetchDict(targetDict);
	return (
		<main className="w-full flex flex-col items-center justify-center">
			<HomeStatus dict={dict} />
		</main>
	);
}
