"use client";
import { generateWordsAction } from "@/actions/generate-word-action";
import {
	addWordsToUserDictAction,
	createDictAction,
	importDictItemToUserDict,
} from "@/actions/user-dict-action";
import AddIcon from "@/assets/svg/add.svg";
import DownloadIcon from "@/assets/svg/download.svg";
import FileImportIcon from "@/assets/svg/file-import.svg";
import SettingIcon from "@/assets/svg/setting.svg";
import ShuffleIcon from "@/assets/svg/shuffle.svg";
import { signIn } from "next-auth/react";

import { callModal } from "@/components/modal";
import {
	createErrorToast,
	createLoadingToast,
	createSuccessToast,
} from "@/hooks/use-toast";
import { useUser } from "@/hooks/use-user";
import type { HomeSetting } from "@/types";
import { type Dict, Dicts, type UserDicts } from "@/types/dict";
import { downloadFile } from "@/utils/download-file";
import { importJSONFile } from "@/utils/import-json-file";
import {
	addLocalDict,
	downLoadLocalDict,
	importLocalDict,
} from "@/utils/local-dict";
import { serverActionTimeOut } from "@/utils/time-out";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

const DictMenu = ({
	dict,
	dictId,
	dictList,
	onShuffle,
	onDictUpdate,
	onSettingChange,
	setting,
	isUserDict,
	isLocalDict,
	isFavDict,
}: {
	dict: Dict;
	dictId: string;
	dictList: UserDicts;
	onShuffle?: () => void;
	onDictUpdate?: () => void;
	onSettingChange?: (val: Partial<HomeSetting>) => void;
	setting: HomeSetting;
	isUserDict: boolean;
	isLocalDict: boolean;
	isFavDict: boolean;
}) => {
	const { isLogin, isAdmin } = useUser();
	const tHome = useTranslations("Home");
	const router = useRouter();
	const tDict = useTranslations("Dict");
	const [isPending, startTransition] = useTransition();

	const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		if (e.target.value === "_create") {
			createDict();
			return;
		}
		startTransition(() => {
			router.push(`/?dict=${e.target.value}`);
		});
	};

	const createWord = async () => {
		const word = (await callModal({
			type: "dialog",
			title: `✨ ${tHome("generateWord")}`,
			message: `${tHome("createWord")}`,
		})) as string | undefined;
		if (word) {
			const removeInfoToast = createLoadingToast(tHome("generating"));

			try {
				const words = word.split(/[,，、]+/).map((_) => _.trim());
				if (isLocalDict) {
					const result = await generateWordsAction(words);
					addLocalDict(...result);
				} else {
					await addWordsToUserDictAction(dictId, words);
					await serverActionTimeOut();
				}
				onDictUpdate?.();
				createSuccessToast(tHome("generated"));
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			} catch (error: any) {
				console.error(`[createWord][${word}]:\n`, error);
				createErrorToast(tHome("generateError"));
			} finally {
				removeInfoToast();
			}
		}
	};

	const handleImport = async () => {
		if (isLocalDict) {
			importLocalDict(onDictUpdate);
		} else {
			const fileString = await importJSONFile();
			const cancel = createLoadingToast(tHome("importing"));
			await importDictItemToUserDict(dictId, fileString as string);
			await serverActionTimeOut();
			cancel();
			createSuccessToast(tHome("imported"));
		}
	};

	const createDict = async () => {
		if (!isLogin) {
			signIn();
			return;
		}
		const dictName = (await await callModal({
			type: "dialog",
			title: `${tHome("createWordList")}`,
		})) as string | undefined;
		if (dictName) {
			const removeInfoToast = createLoadingToast(tHome("creating"));
			const res = await createDictAction(dictName);
			router.push(`/?dict=${res.id}`);
			await serverActionTimeOut();
			removeInfoToast();
			createSuccessToast(tHome("created"));
		}
	};

	const handleDownload = async () => {
		if (isLocalDict) {
			downLoadLocalDict();
		} else {
			const currentUserDict = dictList.find((item) => item.id === dictId);
			if (!currentUserDict) return;
			downloadFile(
				JSON.stringify(
					dict.map(({ id, ...rest }) => ({ ...rest })),
					null,
					2,
				),
				`${currentUserDict.name || "dict"}.json`,
			);
		}
	};

	const canEdit =
		(isAdmin || isUserDict || dictId === Dicts.local) && !isFavDict;
	return (
		<div className="sticky top-2 z-10 bg-base-200 rounded-xl mb-3 shadow-md flex justify-between items-center p-1 max-w-full">
			<div className="pl-1 sm:pl-3 flex items-center *:mx-1 *:inline-block *:cursor-pointer *:select-none">
				<ShuffleIcon
					width={20}
					height={20}
					viewBox="0 0 24 24"
					className="cursor-pointer inline-block"
					onClick={onShuffle}
				/>
				<div className="dropdown dropdown-hover">
					<SettingIcon
						tabIndex={0}
						role="button"
						width={20}
						height={20}
						viewBox="0 0 24 24"
					/>
					<div
						/* biome-ignore lint/a11y/noNoninteractiveTabindex: <explanation> */
						tabIndex={0}
						className="dropdown-content !cursor-auto bg-base-100 rounded-box z-[1] w-44 p-4 shadow flex flex-col gap-3"
					>
						<div className="flex justify-between items-center gap-2">
							<label htmlFor="muteAudio" className="cursor-pointer flex-auto">
								{tHome("enableAudio")}
							</label>
							<input
								id="muteAudio"
								type="checkbox"
								className="toggle toggle-sm"
								checked={setting.enableAudio}
								onChange={(e) =>
									onSettingChange?.({ enableAudio: e.target.checked })
								}
							/>
						</div>
						<div className="flex justify-between items-center gap-2">
							<label htmlFor="autoVoice" className="cursor-pointer flex-auto">
								{tHome("autoVoice")}
							</label>
							<input
								id="autoVoice"
								type="checkbox"
								className="toggle toggle-sm"
								checked={setting.autoVoice}
								onChange={(e) =>
									onSettingChange?.({ autoVoice: e.target.checked })
								}
							/>
						</div>
						<div className="flex justify-between items-center gap-2">
							<label htmlFor="hideMeaning" className="cursor-pointer flex-auto">
								{tHome("showMeaning")}
							</label>
							<input
								id="hideMeaning"
								type="checkbox"
								className="toggle toggle-sm"
								checked={setting.showMeaning}
								onChange={(e) =>
									onSettingChange?.({
										showMeaning: e.target.checked,
									})
								}
							/>
						</div>
						<div className="flex justify-between items-center gap-2">
							<label
								htmlFor="additionalMeaning"
								className="cursor-pointer flex-auto"
							>
								{tHome("additionalMeaning")}
							</label>
							<input
								id="additionalMeaning"
								type="checkbox"
								className="toggle toggle-sm"
								checked={setting.additionalMeaning}
								onChange={(e) =>
									onSettingChange?.({
										additionalMeaning: e.target.checked,
									})
								}
							/>
						</div>
					</div>
				</div>
				<DownloadIcon className="size-6" onClick={handleDownload} />
				{canEdit && (
					<>
						<FileImportIcon className="size-6" onClick={handleImport} />
						<AddIcon className="size-6" onClick={createWord} />
					</>
				)}
			</div>
			<select
				className={`select select-bordered w-24 sm:w-32 select-sm ${isPending ? "opacity-50" : ""}`}
				value={dictId}
				onChange={onChange}
				disabled={isPending}
			>
				{dictList.map((dict) => (
					<option key={dict.id} value={dict.id}>
						{dict.intlKey && !isAdmin
							? tDict(dict.intlKey as Dicts)
							: dict.name}
					</option>
				))}
				<option value="_local">{tDict(Dicts.local)}</option>
				<option value="_create">✨ {tHome("createNewDict")}</option>
			</select>
			{isPending && (
				<div className="absolute right-2 top-1/2 -translate-y-1/2 flex">
					<div className="loading loading-spinner loading-xs" />
				</div>
			)}
		</div>
	);
};

export { DictMenu };
