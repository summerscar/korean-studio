"use client";
import { generateWordAction } from "@/actions/generate-word-action";
import DownloadIcon from "@/assets/svg/download.svg";
import FileImportIcon from "@/assets/svg/file-import.svg";
import ShuffleIcon from "@/assets/svg/shuffle.svg";
import { createToast } from "@/hooks/use-toast";
import { type DictItem, Dicts } from "@/types/dict";
import { addUserDict, downLoadDict, importDict } from "@/utils/user-dict";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";

const DictMenu = ({
	onShuffle,
	onUserDictUpdate,
}: {
	onShuffle?: () => void;
	onUserDictUpdate?: () => void;
}) => {
	const searchParams = useSearchParams();
	const router = useRouter();
	const tIndex = useTranslations("Dict");
	const currentDict = searchParams.get("dict") || Dicts.popular;
	const isUserDict = currentDict === Dicts.user;

	const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		router.push(`/?dict=${e.target.value}`);
	};

	const createWord = async () => {
		// TODO: intl
		const word = prompt("Enter new word", "좋아요");
		if (word) {
			const removeInfoToast = createToast({
				type: "info",
				delay: 60 * 1000 * 5,
				message: (
					<span>
						<span className="loading loading-spinner loading-sm" />{" "}
						Generating...
					</span>
				),
			});

			try {
				const result = await Promise.all(
					word
						.split(",")
						.map(
							async (w) =>
								JSON.parse((await generateWordAction(w)) || "{}") as DictItem,
						),
				);
				addUserDict(...result);
				onUserDictUpdate?.();
				createToast({
					type: "success",
					message: <span>Generated Success!</span>,
				});
			} catch (error) {
				console.error("[createWord]:\n", error);
				createToast({ type: "error", message: "Generated Failed!" });
			} finally {
				removeInfoToast();
			}
		}
	};

	const handleImport = async () => {
		importDict(onUserDictUpdate);
	};

	return (
		<div className="sticky top-2 z-10 bg-base-200 rounded-xl mb-3 shadow-md flex justify-between items-center p-1">
			<div className="pl-4 flex items-center">
				<ShuffleIcon
					width={20}
					height={20}
					viewBox="0 0 24 24"
					className="cursor-pointer inline-block"
					onClick={onShuffle}
				/>
				{isUserDict && (
					<>
						<span
							onClick={createWord}
							className="inline-block px-2 text-xl cursor-pointer"
						>
							+
						</span>
						<DownloadIcon
							width={20}
							height={20}
							onClick={downLoadDict}
							className="cursor-pointer inline-block mx-1"
						/>
						<FileImportIcon
							width={20}
							height={20}
							onClick={handleImport}
							className="cursor-pointer inline-block mx-1"
						/>
					</>
				)}
			</div>
			<select
				className="select select-bordered w-28 select-sm"
				value={currentDict}
				onChange={onChange}
			>
				{Object.values(Dicts).map((dict) => (
					<option key={dict} value={dict}>
						{tIndex(dict)}
					</option>
				))}
			</select>
		</div>
	);
};

export { DictMenu };
