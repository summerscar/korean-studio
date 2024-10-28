"use client";
import { generateWordAction } from "@/actions/generate-word-action";
import ShuffleIcon from "@/assets/svg/shuffle.svg";
import { callToast } from "@/hooks/use-toast";
import { Dicts } from "@/types/dict";
import { addUserDict } from "@/utils/user-dict";
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
			callToast({ type: "info", message: "Generating word..." });
			const result = await generateWordAction(word);
			result && addUserDict(JSON.parse(result));
			onUserDictUpdate?.();
			callToast({ type: "success", message: "Generated Success!" });
		}
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
					<span
						onClick={createWord}
						className="inline-block px-2 text-xl cursor-pointer"
					>
						+
					</span>
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
