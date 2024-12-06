"use client";
import { getFavOrDictList } from "@/actions/user-dict-action";
import { isFavDict } from "@/actions/user-dict-utils";
import { useServerActionState } from "@/hooks/use-server-action-state";
import { useUser } from "@/hooks/use-user";
import type { Dict, Dicts, UserDicts } from "@/types/dict";
import clsx from "clsx";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { type CSSProperties, useEffect, useState } from "react";
import { WordsList } from "./words";

const WordLists = ({ dicts }: { dicts: UserDicts }) => {
	const tabId = useSearchParams().get("dict") || dicts[0]?.id || "";
	const [dict, setDict] = useState<Dict>([]);
	const tDict = useTranslations("Dict");
	const isFavList = isFavDict(dicts.find((dict) => dict.id === tabId));
	const { isAdmin } = useUser();
	const [pending, fetchDicts] = useServerActionState(async (dictId: string) => {
		if (!dictId) return;
		const data = await getFavOrDictList(dictId);
		setDict(data);
	});

	useEffect(() => {
		setDict([]);
		fetchDicts(tabId);
	}, [fetchDicts, tabId]);

	const dictInfo = dicts.find((dict) => dict.id === tabId);

	const style = dictInfo?.poster
		? ({
				"--dict-bg": `url('${dictInfo.poster}')`,
			} as CSSProperties)
		: undefined;

	return (
		<div className="[--tab-active-bg:#ffffff40] relative" role="tabpanel">
			<div
				style={style}
				className="absolute top-0 left-0 w-full h-full [background-image:var(--dict-bg)] bg-cover bg-center bg-no-repeat opacity-50 blur z-[-1]"
			/>
			<div
				role="tablist"
				className="tabs tabs-lifted overflow-auto mt-4 scrollbar-hide"
			>
				{dicts.map((dict) => (
					<div
						className={clsx(
							"tab text-nowrap [--tab-bg:var(--tab-active-bg)]",
							tabId === dict.id && "tab-active",
						)}
						key={dict.id}
						onClick={() => {
							window.history.pushState(null, "", `/account?dict=${dict.id}`);
						}}
					>
						{dict.intlKey && !isAdmin
							? tDict(dict.intlKey as Dicts)
							: dict.name}
					</div>
				))}
			</div>
			<WordsList
				isFavDict={isFavList}
				loading={pending}
				dict={dict}
				dictInfo={dictInfo}
				onUpdate={() => fetchDicts(tabId)}
			/>
		</div>
	);
};

export { WordLists };
