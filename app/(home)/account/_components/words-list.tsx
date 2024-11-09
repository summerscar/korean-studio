"use client";
import { getDictList, removeDictItemAction } from "@/actions/user-dict-action";
import type { Dict } from "@/types/dict";
import { useMemoizedFn } from "ahooks";
import { useEffect, useState } from "react";

const WordsList = ({ dictId }: { dictId: string }) => {
	const [dicts, setDicts] = useState<Dict>([]);

	const fetchDicts = useMemoizedFn(async () => {
		const data = await getDictList(dictId);
		setDicts(data);
	});

	useEffect(() => {
		fetchDicts();
	}, [fetchDicts]);

	return (
		<div className="max-h-96 overflow-y-auto">
			<table className="table table-auto w-full table-pin-rows table-pin-cols">
				<thead>
					<tr className="*:bg-transparent bg-transparent backdrop-blur-md">
						<th className="px-4 py-2">Name</th>
						<th className="px-4 py-2">Action</th>
						<th className="px-4 py-2">Name</th>
						<th className="px-4 py-2">Action</th>
					</tr>
				</thead>
				<tbody>
					{dicts.map((dict, index) =>
						index % 2 === 0 ? (
							<tr key={dict.id}>
								<td className="px-4 py-2">
									{index + 1}. {dict.name}
								</td>
								<td className="px-4 py-2">
									<ActionBar
										dictId={dictId}
										id={dict.id!}
										onUpdate={fetchDicts}
									/>
								</td>
								<td className="px-4 py-2">
									{dicts[index + 1]
										? `${index + 2}. ${dicts[index + 1].name}`
										: ""}
								</td>
								<td className="px-4 py-2">
									{dicts[index + 1] ? (
										<ActionBar
											dictId={dictId}
											id={dict.id!}
											onUpdate={fetchDicts}
										/>
									) : (
										""
									)}
								</td>
							</tr>
						) : null,
					)}
				</tbody>
			</table>
		</div>
	);
};

const ActionBar = ({
	dictId,
	id,
	onUpdate,
}: { id: string; dictId: string; onUpdate?: () => void }) => {
	const handleRemove = async () => {
		await removeDictItemAction(dictId, id);
		onUpdate?.();
	};

	return (
		<div>
			<span className="cursor-pointer" onClick={handleRemove}>
				❌
			</span>
		</div>
	);
};

export { WordsList };
