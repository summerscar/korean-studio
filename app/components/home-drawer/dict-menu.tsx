"use client";
import { generateWordAction } from "@/actions/generate-word-action";
import DownloadIcon from "@/assets/svg/download.svg";
import FileImportIcon from "@/assets/svg/file-import.svg";
import SettingIcon from "@/assets/svg/setting.svg";
import ShuffleIcon from "@/assets/svg/shuffle.svg";
import { createToast } from "@/hooks/use-toast";
import type { HomeSetting } from "@/types";
import { type DictItem, Dicts } from "@/types/dict";
import { addUserDict, downLoadDict, importDict } from "@/utils/user-dict";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";

const DictMenu = ({
	onShuffle,
	onUserDictUpdate,
	onSettingChange,
	setting,
}: {
	onShuffle?: () => void;
	onUserDictUpdate?: () => void;
	onSettingChange?: (val: Partial<HomeSetting>) => void;
	setting: HomeSetting;
}) => {
	const tHome = useTranslations("Home");
	const searchParams = useSearchParams();
	const router = useRouter();
	const tIndex = useTranslations("Dict");
	const currentDict = searchParams.get("dict") || Dicts.popular;
	const isUserDict = currentDict === Dicts.user;

	const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		router.push(`/?dict=${e.target.value}`);
	};

	const createWord = async () => {
		const word = prompt(tHome("createWord"), "안녕");
		if (word) {
			const removeInfoToast = createToast({
				type: "info",
				delay: 60 * 1000 * 5,
				message: (
					<span>
						<span className="loading loading-spinner loading-sm" />{" "}
						{tHome("generating")}
					</span>
				),
			});

			try {
				const result = await Promise.all(
					word
						.split(",")
						.map((w) => w.trim())
						.map(
							async (w) =>
								JSON.parse((await generateWordAction(w)) || "{}") as DictItem,
						),
				);
				addUserDict(...result);
				onUserDictUpdate?.();
				createToast({
					type: "success",
					message: <span>{tHome("generated")}</span>,
				});
			} catch (error) {
				console.error("[createWord]:\n", error);
				createToast({ type: "error", message: tHome("generateError") });
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
			<div className="pl-3 flex items-center *:mx-1 *:inline-block *:cursor-pointer *:select-none">
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
				{isUserDict && (
					<>
						<span onClick={createWord} className="text-xl">
							+
						</span>
						<DownloadIcon width={20} height={20} onClick={downLoadDict} />
						<FileImportIcon width={20} height={20} onClick={handleImport} />
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
