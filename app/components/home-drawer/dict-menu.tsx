"use client";
import ShuffleIcon from "@/assets/svg/shuffle.svg";
import { Dicts } from "@/types/dict";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";

const DictMenu = ({
	onShuffle,
}: {
	onShuffle?: () => void;
}) => {
	const searchParams = useSearchParams();
	const router = useRouter();
	const tIndex = useTranslations("Dict");
	const currentDict = searchParams.get("dict") || Dicts.popular;

	const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		router.push(`/?dict=${e.target.value}`);
	};

	return (
		<div className="sticky top-2 z-10 bg-base-200 rounded-xl mb-3 shadow-md flex justify-between items-center p-1">
			<div className="pl-4">
				<ShuffleIcon
					width={20}
					height={20}
					viewBox="0 0 24 24"
					className="cursor-pointer"
					onClick={onShuffle}
				/>
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
