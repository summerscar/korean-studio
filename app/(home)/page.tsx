import { HomeStatus } from "@/components/home-status";
import { Dict, Dicts, dictNameList } from "@/types/dict";

import { fetchDict } from "@/utils/api";

export default async function HomePage(props: {
	searchParams: Promise<{ dict?: string }>;
}) {
	const searchParams = await props.searchParams;
	const searchParamsDict = searchParams.dict as unknown as Dicts;

	/** 本地字典仍然返回默认字典 */
	const targetDict =
		searchParams && dictNameList.includes(searchParamsDict)
			? searchParamsDict
			: Dicts.popular;

	const dict =
		searchParams.dict === Dicts.user ? [] : await fetchDict(targetDict);
	return (
		<main className="w-full flex flex-col items-center justify-center">
			<HomeStatus dictName={searchParamsDict} dict={dict} />
		</main>
	);
}
