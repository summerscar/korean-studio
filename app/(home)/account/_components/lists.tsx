"use client";
import { getDictList } from "@/actions/user-dict-action";
import { useServerActionState } from "@/hooks/use-server-action-state";
import type { Dict, UserDicts } from "@/types/dict";
import clsx from "clsx";
import { useSearchParams } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { WordsList } from "./words";

const WordLists = ({ dicts }: { dicts: UserDicts }) => {
	const tabId = useSearchParams().get("dict") || dicts[0].id || "";
	const [dict, setDict] = useState<Dict>([]);
	useActionState;
	const [pending, fetchDicts] = useServerActionState(async (dictId: string) => {
		if (!dictId) return;
		const data = await getDictList(dictId);
		setDict(data);
	});

	useEffect(() => {
		fetchDicts(tabId);
	}, [fetchDicts, tabId]);

	return (
		<div>
			<div role="tablist" className="tabs tabs-lifted overflow-auto my-4">
				{dicts.map((dict) => (
					<div
						className={clsx(
							"tab text-nowrap [--tab-bg:#ffffff40]",
							tabId === dict.id && "tab-active",
						)}
						key={dict.id}
						onClick={() => {
							window.history.pushState(null, "", `/account?dict=${dict.id}`);
						}}
					>
						{dict.name}
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
