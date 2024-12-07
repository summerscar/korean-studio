import { SITES_LANGUAGE } from "./site";

interface SubtitleCue {
	startTime: string;
	endTime: string;
	text: string;
}

type SubtitleCues = SubtitleCue[];

type SubtitleData = Partial<Record<SubtitleLanguage, SubtitleCue[]>>;

type SubtitleLanguage = "ko" | "zh-Hans" | "en" | "ja";

export const mapSubtitleLanguageToSiteLanguage: Record<
	SubtitleLanguage,
	SITES_LANGUAGE
> = {
	"zh-Hans": SITES_LANGUAGE.zhCN,
	en: SITES_LANGUAGE.en,
	ja: SITES_LANGUAGE.ja,
	ko: SITES_LANGUAGE.zhCN,
};

type SubtitleFiles = Record<
	SubtitleLanguage,
	{
		filename: string;
		label: string;
	}
>;

type SubtitleEpisode = {
	title: string;
	subtitles: SubtitleFiles;
};

type SubtitleSeries = SubtitleEpisode[];

export type {
	SubtitleCue,
	SubtitleCues,
	SubtitleData,
	SubtitleFiles,
	SubtitleLanguage,
	SubtitleSeries,
	SubtitleEpisode,
};
