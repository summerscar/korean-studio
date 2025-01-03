import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-cards";
import "swiper/css/virtual";

import type { Dict, DictItem } from "@/types/dict";
import type { SITES_LANGUAGE } from "@/types/site";
import clsx from "clsx";
import { memo, useRef } from "react";

import { EffectCards, Virtual } from "swiper/modules";
import { DisplayName } from "./display-name";
import { Star } from "./star";
import { WordExample } from "./word-example";
import { WordMeaning } from "./word-meaning";

const pastelColors = [
	"bg-[#FFE5E5] dark:bg-[#3D2929]", // 柔和的粉红色
	"bg-[#E5F3FF] dark:bg-[#293337]", // 淡蓝色
	"bg-[#F0FFE5] dark:bg-[#2D3729]", // 淡绿色
	"bg-[#FFE5F3] dark:bg-[#3D2935]", // 粉紫色
	"bg-[#F5E5FF] dark:bg-[#352937]", // 淡紫色
	"bg-[#FFF5E5] dark:bg-[#3D3529]", // 淡橙色
];

const noop = () => {};

const WordCards = ({
	dict,
	onChange,
	isLocalDict,
	additionalMeaning,
	locale,
	showMeaning,
	curWordIndex,
	playWordRef,
	playExampleRef,
	slideToIndexRef,
}: {
	dict: Dict;
	onChange: (index: number) => void;
	isLocalDict: boolean;
	locale: SITES_LANGUAGE;
	additionalMeaning: boolean;
	showMeaning: boolean;
	curWordIndex: number;
	playWordRef: React.RefObject<() => void>;
	playExampleRef: React.RefObject<() => void>;
	slideToIndexRef: React.RefObject<(index: number) => void>;
}) => {
	if (!dict.length) return null;

	return (
		<div className="w-screen overflow-clip">
			<Swiper
				effect={"cards"}
				grabCursor={true}
				modules={[EffectCards, Virtual]}
				className="w-60 h-80"
				initialSlide={curWordIndex}
				runCallbacksOnInit={false}
				cardsEffect={{
					perSlideRotate: 3,
					perSlideOffset: 9,
				}}
				virtual={{
					slides: dict,
					enabled: true,
					addSlidesAfter: 4,
					addSlidesBefore: 4,
					cache: false,
				}}
				onInit={(swiper) => {
					slideToIndexRef.current = (val: number) => {
						swiper.slideTo(val);
					};
				}}
				onSlideChange={(e) => {
					onChange(e.activeIndex);
				}}
			>
				{dict.map((word, i) => (
					<SwiperSlide
						key={word.id || word.name}
						virtualIndex={i}
						className={clsx(
							"w-full h-full flex items-center justify-center",
							"rounded-2xl shadow",
							"dict-theme:[background-image:var(--dict-bg)]",
							"dict-theme:bg-cover dict-theme:bg-center dict-theme:bg-no-repeat",
							"dict-theme:bg-blend-soft-light dark:dict-theme:bg-blend-multiply",
							"dict-theme:contrast-[1]",
							pastelColors[i % pastelColors.length],
						)}
					>
						{({ isActive }) => (
							<CardItem
								word={word}
								isLocalDict={isLocalDict}
								additionalMeaning={additionalMeaning}
								locale={locale}
								showMeaning={showMeaning}
								isActive={isActive}
								playWordRef={playWordRef}
								playExampleRef={playExampleRef}
							/>
						)}
					</SwiperSlide>
				))}
			</Swiper>
		</div>
	);
};

const CardItem = memo(
	({
		word,
		isLocalDict,
		additionalMeaning,
		locale,
		showMeaning,
		isActive,
		playWordRef,
		playExampleRef,
	}: {
		word: DictItem;
		isLocalDict: boolean;
		additionalMeaning: boolean;
		locale: SITES_LANGUAGE;
		showMeaning: boolean;
		isActive: boolean;
		playWordRef: React.RefObject<() => void>;
		playExampleRef: React.RefObject<() => void>;
	}) => {
		const noopRef = useRef<() => void>(noop);

		return (
			<div className="flex flex-col items-center justify-around p-2 px-5 h-full">
				<div className="flex flex-col items-center justify-between">
					<Star
						dictItem={word}
						isLocalDict={isLocalDict}
						className="absolute top-4 right-4 size-6"
					/>
					<DisplayName
						autoPlay={false}
						showStar={false}
						className="scale-75"
						currentWord={word}
						playWordRef={isActive ? playWordRef : noopRef}
						isLocalDict={isLocalDict}
					/>
					<WordMeaning
						className="text-sm"
						showMeaning={showMeaning}
						currentWord={word}
						locale={locale}
						additionalMeaning={additionalMeaning}
					/>
				</div>
				<WordExample
					className="text-sm gap-y-1"
					currentWord={word}
					locale={locale}
					additionalMeaning={additionalMeaning}
					showMeaning={showMeaning}
					playRef={isActive ? playExampleRef : noopRef}
				/>
			</div>
		);
	},
);

export { WordCards };
