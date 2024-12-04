import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-cards";

import type { Dict } from "@/types/dict";
import type { SITES_LANGUAGE } from "@/types/site";
import clsx from "clsx";
import { useRef } from "react";
// import required modules
import { EffectCards } from "swiper/modules";
import type { Swiper as TSwiper } from "swiper/types";
import { DisplayName } from "./display-name";
import { WordExample } from "./word-example";
import { WordMeaning } from "./word-meaning";

const pastelColors = [
	"bg-[#FFE5E5]", // 柔和的粉红色
	"bg-[#E5F3FF]", // 淡蓝色
	"bg-[#F0FFE5]", // 淡绿色
	"bg-[#FFE5F3]", // 粉紫色
	"bg-[#F5E5FF]", // 淡紫色
	"bg-[#FFF5E5]", // 淡橙色
];

const noop = () => {};

const WordCards = ({
	dict,
	onChange,
	playWord,
	isWordPlaying,
	isLocalDict,
	additionalMeaning,
	locale,
	showMeaning,
	curWordIndex,
	playExampleRef,
	slideToIndexRef,
}: {
	dict: Dict;
	onChange: (index: number) => void;
	playWord: () => void;
	isWordPlaying: boolean;
	isLocalDict: boolean;
	locale: SITES_LANGUAGE;
	additionalMeaning: boolean;
	showMeaning: boolean;
	curWordIndex: number;
	playExampleRef: React.RefObject<() => void>;
	slideToIndexRef: React.RefObject<(index: number) => void>;
}) => {
	const swiperRef = useRef<TSwiper>(null);
	const noopRef = useRef<() => void>(noop);
	const getIsActive = (index: number) => {
		return index === curWordIndex;
	};

	if (swiperRef.current) {
		slideToIndexRef.current = (val: number) => {
			swiperRef.current?.slideTo(val);
		};
	}

	if (!dict.length) return null;

	return (
		<div className="w-screen overflow-clip">
			<Swiper
				effect={"cards"}
				grabCursor={true}
				modules={[EffectCards]}
				className="w-60 h-80"
				initialSlide={curWordIndex}
				onInit={(swiper) => {
					swiperRef.current = swiper;
				}}
				onSlideChange={(e) => {
					onChange(e.activeIndex);
				}}
			>
				{dict.map((word, i) => (
					<SwiperSlide
						key={word.id || word.name}
						className={clsx(
							"w-full h-full flex items-center justify-center rounded-2xl",
							pastelColors[i % pastelColors.length],
						)}
					>
						<div className="flex flex-col items-center justify-around p-2 px-5 h-full">
							<div className="flex flex-col items-center justify-between">
								<DisplayName
									className="scale-75"
									currentWord={word}
									playWord={playWord}
									isWordPlaying={isWordPlaying}
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
								playRef={getIsActive(i) ? playExampleRef : noopRef}
							/>
						</div>
					</SwiperSlide>
				))}
			</Swiper>
		</div>
	);
};

export { WordCards };
