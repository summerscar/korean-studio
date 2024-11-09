"use client";
import { getDictList } from "@/actions/user-dict-action";
import type { Dict, UserDicts } from "@/types/dict";
import { useMemoizedFn } from "ahooks";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { WordsList } from "./words";

const WordLists = ({ dicts }: { dicts: UserDicts }) => {
	const [tabId, setTabId] = useState(dicts[0].id || "");
	const [tabsDict, setTabsDict] = useState<Record<string, Dict>>({});

	const fetchDicts = useMemoizedFn(async (dictId: string) => {
		const data = await getDictList(dictId);
		setTabsDict((val) => ({
			...val,
			[dictId]: data,
		}));
	});

	useEffect(() => {
		if (tabsDict[tabId]) return;
		fetchDicts(tabId);
	}, [fetchDicts, tabId, tabsDict]);

	return (
		<div>
			<div role="tablist" className="tabs tabs-lifted overflow-auto py-4">
				{dicts.map((dict) => (
					<div
						className={clsx(
							"tab text-nowrap [--tab-bg:#ffffff40]",
							tabId === dict.id && "tab-active",
						)}
						key={dict.id}
						onClick={() => setTabId(dict.id)}
					>
						{dict.name}
					</div>
				))}
			</div>
			<WordsList
				dict={tabsDict[tabId] || []}
				dictInfo={dicts.find((dict) => dict.id === tabId)}
				onUpdate={() => fetchDicts(tabId)}
			/>
		</div>
	);
};

export { WordLists };
