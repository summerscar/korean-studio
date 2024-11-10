"use client";
import {
	addWordsToUserDictAction,
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
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useState } from "react";

const WordsList = ({
	dict,
	dictInfo,
	onUpdate,
}: { dict: Dict; dictInfo?: UserDicts[0]; onUpdate?: () => Promise<void> }) => {
	const tHome = useTranslations("Home");
	const [editing, setEditing] = useState<DictItem>();

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
	if (!dictInfo) return null;
	return (
		<div>
			<div className="text-center text-sm">
				<div>
					Id: {dictInfo.id} <Link href={`/?dict=${dictInfo.id}`}>🔗</Link>
				</div>
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
									<td className="px-4 py-2">
										<ActionBar
											dictId={dictInfo.id}
											id={item.id!}
											onUpdate={onUpdate}
											onEdit={onEdit}
										/>
									</td>
									<td className="px-4 py-2">
										{dict[index + 1]
											? `${index + 2}. ${dict[index + 1].name}`
											: ""}
									</td>
									<td className="px-4 py-2">
										{dict[index + 1] ? (
											<ActionBar
												dictId={dictInfo.id}
												id={dict[index + 1].id!}
												onUpdate={onUpdate}
												onEdit={onEdit}
											/>
										) : (
											""
										)}
									</td>
								</tr>
							) : null,
						)}
					</tbody>
					<tfoot>
						<tr className="bg-transparent backdrop-blur-lg">
							<td
								className="text-center cursor-pointer"
								colSpan={4}
								onClick={handleAdd}
							>
								Add
							</td>
						</tr>
					</tfoot>
				</table>
			</div>
		</div>
	);
};

const ActionBar = ({
	dictId,
	id,
	onUpdate,
	onEdit,
}: {
	id: string;
	dictId: string;
	onUpdate?: () => Promise<void>;
	onEdit?: (id: string) => void;
}) => {
	const tHome = useTranslations("Home");
	const handleRemove = async () => {
		const cancel = createLoadingToast(tHome("removing"));
		await removeDictItemAction(dictId, id);
		await onUpdate?.();
		cancel();
		createSuccessToast(tHome("removed"));
	};

	const handleEdit = () => {
		onEdit?.(id);
	};

	return (
		<div className="flex gap-3">
			<span className="cursor-pointer" onClick={handleEdit}>
				🖍
			</span>
			<span className="cursor-pointer" onClick={handleRemove}>
				❌
			</span>
		</div>
	);
};

export { WordsList };
