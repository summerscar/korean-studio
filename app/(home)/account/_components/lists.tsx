"use client";
import { getFavOrDictList } from "@/actions/user-dict-action";
import { useServerActionState } from "@/hooks/use-server-action-state";
import { useUser } from "@/hooks/use-user";
import type { Dict, Dicts, UserDicts } from "@/types/dict";
import clsx from "clsx";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { WordsList } from "./words";

const WordLists = ({ dicts }: { dicts: UserDicts }) => {
	const tabId = useSearchParams().get("dict") || dicts[0]?.id || "";
	const [dict, setDict] = useState<Dict>([]);
	const tDict = useTranslations("Dict");
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

	return (
		<div className="[--tab-active-bg:#ffffff40]">
			<div role="tablist" className="tabs tabs-lifted overflow-auto mt-4">
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
				loading={pending}
				dict={dict}
				dictInfo={dicts.find((dict) => dict.id === tabId)}
				onUpdate={() => fetchDicts(tabId)}
			/>
		</div>
	);
};

export { WordLists };
