import { getAllDicts, getFavOrDictList } from "@/actions/user-dict-action";
import { filterAndSortDictList } from "@/actions/user-dict-utils";
import { HomeStatus } from "@/components/home-status";
import { Dicts } from "@/types/dict";
import { auth } from "auth";

export default async function HomePage(props: {
	searchParams: Promise<{ dict?: string }>;
}) {
	const session = await auth();
	const { dict: searchParamsDict } = await props.searchParams;

	const dictList = filterAndSortDictList(await getAllDicts(), session);

	const isLocalDict = Dicts.local === searchParamsDict;

	const targetDictId = searchParamsDict
		? searchParamsDict
		: dictList.find((item) => item.intlKey === Dicts.popular)?.id;

	if (!targetDictId) throw new Error("Can't find content");

	const isUserDict = !!dictList
		.filter((dict) => dict.createdBy.id === session?.user?.id)
		.find((item) => item.id === targetDictId);

	const dict =
		searchParamsDict === Dicts.local
			? []
			: await getFavOrDictList(targetDictId);

	const dictId = searchParamsDict === Dicts.local ? Dicts.local : targetDictId;

	return (
		<main className="w-full flex flex-col items-center justify-center relative">
			<HomeStatus
				isLocalDict={isLocalDict}
				isUserDict={isUserDict}
				dictId={dictId}
				dict={dict}
				dictList={dictList}
			/>
		</main>
	);
}
