"use client";
import {
	addWordsToUserDictAction,
	createDictAction,
	removeDictAction,
	removeDictItemAction,
	updateDictAction,
	updateDictItemAction,
} from "@/actions/user-dict-action";
import {
	createErrorToast,
	createLoadingToast,
	createSuccessToast,
} from "@/hooks/use-toast";
import type { DictUpdateInput } from ".keystone/types";

import type { Dict, DictItem, UserDicts } from "@/types/dict";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const WordsList = ({
	dict,
	dictInfo,
	onUpdate,
	loading,
}: {
	dict: Dict;
	dictInfo?: UserDicts[0];
	onUpdate?: () => Promise<void>;
	loading?: boolean;
}) => {
	const router = useRouter();
	const tHome = useTranslations("Home");
	const [editing, setEditing] = useState<DictItem>();
	const locale = useLocale();

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		setEditing(undefined);
	}, [dictInfo?.id]);

	const onEdit = (dictItemId: string) => {
		const item = dict.find((item) => item.id === dictItemId);
		if (!item) return;
		setEditing(item);
	};
	const updateDictItem = async (data: DictItem) => {
		if (!editing) return;
		if (JSON.stringify(data) === JSON.stringify(editing)) {
			setEditing(undefined);
			return;
		}
		const cancel = createLoadingToast("updating");
		await updateDictItemAction(dictInfo!.id, editing.id!, data);
		cancel();
		createSuccessToast("updated");
		setEditing(undefined);
	};

	const updateDict = async (data: DictUpdateInput) => {
		const cancel = createLoadingToast("updating");
		await updateDictAction(dictInfo!.id, data);
		cancel();
		createSuccessToast("updated");
	};

	const handleAdd = async () => {
		const word = prompt(`✨ ${tHome("createWord")}`, tHome("exampleWord"));
		if (word) {
			const removeInfoToast = createLoadingToast(tHome("generating"));

			try {
				const words = word.split(/[,，、]+/).map((_) => _.trim());
				await addWordsToUserDictAction(dictInfo!.id, words);
				await onUpdate?.();
				createSuccessToast(tHome("generated"));
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			} catch (error: any) {
				console.error(`[createWord][${word}]:\n`, error);
				createErrorToast(tHome("generateError"));
				createErrorToast(error.message);
			} finally {
				removeInfoToast();
			}
		}
	};

	const handleRemoveDict = async () => {
		if (!confirm()) return;
		const removeInfoToast = createLoadingToast(tHome("removing"));
		await removeDictAction(dictInfo!.id);
		removeInfoToast();
		createSuccessToast(tHome("removed"));
		router.push("/account");
	};

	const handleAddDict = async () => {
		const dictName = prompt(tHome("createWordList"));
		if (dictName) {
			const removeInfoToast = createLoadingToast(tHome("creating"));
			const res = await createDictAction(dictName);
			router.push(`/account/?dict=${res.id}`);
			removeInfoToast();
			createSuccessToast(tHome("created"));
		}
	};

	const handleRemoveDictItem = async (dictItem: DictItem) => {
		if (!confirm(`Remove: [${dictItem.name}] ?`)) return;
		const cancel = createLoadingToast(tHome("removing"));
		await removeDictItemAction(dictInfo?.id!, dictItem.id!);
		await onUpdate?.();
		cancel();
		createSuccessToast(tHome("removed"));
	};

	const handleSearch = async (dictItem: DictItem) => {
		window.open(
			`https://papago.naver.com/?sk=ko&tk=${locale}&st=${dictItem.name}`,
			"mini",
			"left=150, top=150, width=400, height=600, toolbar=no, scrollbars=yes, status=no, resizable=yes",
		);
	};

	if (!dictInfo)
		return (
			<div>
				<button className="btn btn-sm" type="button" onClick={handleAddDict}>
					Create word list
				</button>
			</div>
		);

	const createActionBar = (item: DictItem) => {
		return (
			<ActionBar
				onSearch={() => handleSearch(item)}
				onEdit={() => onEdit(item.id!)}
				onRemove={() => handleRemoveDictItem(item)}
			/>
		);
	};

	return (
		<div className="bg-[--tab-active-bg]">
			<div className="text-center text-sm mb-2 flex flex-wrap justify-center gap-4 pt-2 mobile:gap-1">
				<div>
					Id: {dictInfo.id} <Link href={`/?dict=${dictInfo.id}`}>🔗</Link>
				</div>
				<div>
					name:{" "}
					<input
						key={dictInfo.id}
						onBlur={(e) => {
							if (e.target.value === dictInfo.name) return;
							updateDict({ name: e.target.value });
						}}
						defaultValue={dictInfo.name}
						type="text"
						className="input input-bordered input-xs"
					/>
				</div>
			</div>
			{editing && (
				<textarea
					ref={(el) => {
						el?.focus();
					}}
					onBlur={(e) => {
						updateDictItem(JSON.parse(e.target.value));
					}}
					className="w-full h-96 bg-white/20 rounded-lg shadow-inner"
					defaultValue={JSON.stringify(editing, null, 12)}
				/>
			)}
			{loading && !dict.length ? (
				<div className="text-center flex justify-center p-8">
					<span className="loading loading-ring loading-lg" />
				</div>
			) : (
				<div className="max-h-96 overflow-y-auto">
					<table className="table table-auto w-full table-pin-rows table-pin-cols">
						<thead>
							<tr className="*:bg-transparent bg-transparent backdrop-blur-lg">
								<th className="px-4 py-2">Name</th>
								<th className="px-4 py-2">Action</th>
								<th className="px-4 py-2">Name</th>
								<th className="px-4 py-2">Action</th>
							</tr>
						</thead>
						<tbody>
							{dict.map((item, index) =>
								index % 2 === 0 ? (
									<tr key={item.id}>
										<td className="px-4 py-2">
											{index + 1}. {item.name}
										</td>
										<td className="px-4 py-2">{createActionBar(item)}</td>
										<td className="px-4 py-2">
											{dict[index + 1]
												? `${index + 2}. ${dict[index + 1].name}`
												: ""}
										</td>
										<td className="px-4 py-2">
											{dict[index + 1] ? createActionBar(dict[index + 1]) : ""}
										</td>
									</tr>
								) : null,
							)}
						</tbody>
						<tfoot>
							<tr className="bg-transparent backdrop-blur-lg">
								<td colSpan={4}>
									<div className="flex justify-center gap-2">
										<button
											className="btn btn-outline btn-xs"
											type="button"
											onClick={handleAddDict}
										>
											Add Word List
										</button>
										<button
											className="btn btn-outline btn-xs"
											type="button"
											onClick={handleRemoveDict}
										>
											Remove Word List
										</button>
										<button
											className="btn btn-outline btn-xs"
											type="button"
											onClick={handleAdd}
										>
											Add Word
										</button>
									</div>
								</td>
							</tr>
						</tfoot>
					</table>
				</div>
			)}
		</div>
	);
};

const ActionBar = ({
	onEdit,
	onRemove,
	onSearch,
}: { onEdit?: () => void; onRemove?: () => void; onSearch?: () => void }) => {
	return (
		<div className="flex gap-3 *:cursor-pointer mobile:w-8 mobile:overflow-auto">
			<span onClick={onEdit}>🖍</span>
			<span onClick={onSearch}>🔍</span>
			<span onClick={onRemove}>❌</span>
		</div>
	);
};

export { WordsList };
