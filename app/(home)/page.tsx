import {
	createCachedDictList,
	getAllDicts,
	getDictList,
} from "@/actions/user-dict-action";
import { HomeStatus } from "@/components/home-status";
import { type Dict, Dicts, type UserDicts, dictNameList } from "@/types/dict";

import { fetchDict } from "@/utils/api";
import { auth } from "auth";

export default async function HomePage(props: {
	searchParams: Promise<{ dict?: string }>;
}) {
	const session = await auth();
	const { dict: searchParamsDict } = await props.searchParams;

	const dictList = (await getAllDicts()).filter(
		(dict) => dict.public || dict.createdBy.id === session?.user?.id,
	);

	const isLocalDict = Dicts.local === searchParamsDict;

	const targetDictId = searchParamsDict
		? searchParamsDict
		: dictList.find((item) => item.intlKey === Dicts.popular)?.id;

	const isUserDict = !!dictList
		.filter((dict) => dict.createdBy.id === session?.user?.id)
		.find((item) => item.id === targetDictId);

	const dict =
		searchParamsDict === Dicts.local
			? []
			: await createCachedDictList(targetDictId!)(targetDictId!, session);

	const dictId = searchParamsDict === Dicts.local ? Dicts.local : targetDictId;

	return (
		<main className="w-full flex flex-col items-center justify-center">
			<HomeStatus
				isLocalDict={isLocalDict}
				isUserDict={isUserDict}
				dictId={dictId!}
				dict={dict}
				dictList={dictList}
			/>
		</main>
	);
}
