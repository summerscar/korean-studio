import KoreanIcon from "@/assets/svg/korean-bg.svg?url";
import Image from "next/image";
export const HomeBGIcon = () => {
	return (
		<div className="absolute right-10 top-0 -z-10 blur-xl">
			<Image src={KoreanIcon} alt="korea" width={300} height={300} priority />
		</div>
	);
};
