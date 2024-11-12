"use client";
import { generateWordsAction } from "@/actions/generate-word-action";
import {
	addWordsToUserDictAction,
	createDictAction,
	importDictItemToUserDict,
	removeDictAction,
} from "@/actions/user-dict-action";
import AddIcon from "@/assets/svg/add.svg";
import CloseIcon from "@/assets/svg/close.svg";
import DownloadIcon from "@/assets/svg/download.svg";
import FileImportIcon from "@/assets/svg/file-import.svg";
import SettingIcon from "@/assets/svg/setting.svg";
import ShuffleIcon from "@/assets/svg/shuffle.svg";
import { signIn } from "next-auth/react";

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
import { useRouter, useSearchParams } from "next/navigation";

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
}) => {
	const { isLogin, isAdmin } = useUser();
	const tHome = useTranslations("Home");
	const router = useRouter();
	const tDict = useTranslations("Dict");

	const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		if (e.target.value === "_create") {
			createDict();
			return;
		}
		router.push(`/?dict=${e.target.value}`);
	};

	const createWord = async () => {
		const word = prompt(`✨ ${tHome("createWord")}`, tHome("exampleWord"));
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
		const dictName = prompt(tHome("createWordList"));
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

	const handleRemoveDict = async () => {
		const res = confirm();
		if (!res) return;
		const removeInfoToast = createLoadingToast(tHome("removing"));
		await removeDictAction(dictId);
		router.push("/");
		await serverActionTimeOut();
		removeInfoToast();
		createSuccessToast("success");
	};
	const canEdit = isAdmin || isUserDict || dictId === Dicts.local;
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
					<SettingIcon width={20} height={20} viewBox="0 0 24 24" />
					<div className="dropdown-content !cursor-auto bg-base-100 rounded-box z-[1] w-44 p-4 shadow flex flex-col gap-3">
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
					</div>
				</div>
				{canEdit && <AddIcon className="size-6" onClick={createWord} />}
				<DownloadIcon className="size-6" onClick={handleDownload} />
				{canEdit && (
					<FileImportIcon className="size-6" onClick={handleImport} />
				)}
				{isUserDict && (
					<CloseIcon className="size-6" onClick={handleRemoveDict} />
				)}
			</div>
			<select
				className="select select-bordered w-24 sm:w-32 select-sm"
				value={dictId}
				onChange={onChange}
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
		</div>
	);
};

export { DictMenu };
