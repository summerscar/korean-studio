import { getUserDicts } from "@/actions/user-dict-action";
import { HomeStatus } from "@/components/home-status";
import { type Dict, Dicts, type UserDicts, dictNameList } from "@/types/dict";

import { fetchDict } from "@/utils/api";

export default async function HomePage(props: {
	searchParams: Promise<{ dict?: string }>;
}) {
	const userDicts = await getUserDicts();
	const searchParams = await props.searchParams;
	const searchParamsDict = (searchParams.dict ||
		Dicts.popular) as unknown as string;

	const isLocalDict = Dicts.local === searchParamsDict;
	let dict: Dict;
	let targetUserDict: UserDicts[0] | undefined;
	if (
		(targetUserDict = userDicts.find((item) => item.id === searchParamsDict))
	) {
		dict = targetUserDict.list as unknown as Dict;
	} else {
		const targetDict = dictNameList.includes(searchParamsDict as Dicts)
			? (searchParamsDict as Dicts)
			: Dicts.popular;
		dict = isLocalDict ? [] : await fetchDict(targetDict);
	}

	return (
		<main className="w-full flex flex-col items-center justify-center">
			<HomeStatus
				isLocalDict={isLocalDict}
				isUserDict={!!targetUserDict}
				dictName={searchParamsDict as Dicts}
				dict={dict}
				userDicts={userDicts}
			/>
		</main>
	);
}
