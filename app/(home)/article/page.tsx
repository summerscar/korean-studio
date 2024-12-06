"use client";
import { useCallback, useEffect, useState } from "react";

interface SubtitleCue {
	startTime: string;
	endTime: string;
	text: string;
}

interface SubtitleData {
	[key: string]: SubtitleCue[];
}

const LANGUAGES = {
	ko: {
		label: "Korean",
		filename: "现在拨打的电话.S01E01.第.1.集.WEBRip.Netflix.ko[cc].vtt.json",
	},
	"zh-Hans": {
		label: "Chinese",
		filename: "现在拨打的电话.S01E01.第.1.集.WEBRip.Netflix.zh-Hans.vtt.json",
	},
	en: {
		label: "English",
		filename: "现在拨打的电话.S01E01.第.1.集.WEBRip.Netflix.en[cc].vtt.json",
	},
	ja: {
		label: "Japanese",
		filename: "现在拨打的电话.S01E01.第.1.集.WEBRip.Netflix.ja.vtt.json",
	},
} as const;

type Language = keyof typeof LANGUAGES;

// Group subtitles into scenes based on time gaps
function groupSubtitlesIntoScenes(subtitles: SubtitleCue[]): SubtitleCue[][] {
	const scenes: SubtitleCue[][] = [];
	let currentScene: SubtitleCue[] = [];

	subtitles.forEach((subtitle, index) => {
		if (index === 0) {
			currentScene.push(subtitle);
			return;
		}

		const currentTime = parseTimeToSeconds(subtitle.startTime);
		const prevTime = parseTimeToSeconds(subtitles[index - 1].endTime);

		// If gap is more than 3 seconds, start a new scene
		if (currentTime - prevTime > 3) {
			if (currentScene.length > 0) {
				scenes.push(currentScene);
			}
			currentScene = [subtitle];
		} else {
			currentScene.push(subtitle);
		}
	});

	if (currentScene.length > 0) {
		scenes.push(currentScene);
	}

	return scenes;
}

export default function ArticlePage() {
	const [subtitles, setSubtitles] = useState<SubtitleData>({});
	const [selectedLanguage, setSelectedLanguage] = useState<Language>("zh-Hans");
	const [viewMode, setViewMode] = useState<"side-by-side" | "vertical">(
		"side-by-side",
	);

	useEffect(() => {
		const loadSubtitles = async () => {
			try {
				const subtitleData: SubtitleData = {};

				for (const [lang, config] of Object.entries(LANGUAGES)) {
					try {
						const response = await fetch(`/subtitle-text/${config.filename}`);
						const data = await response.json();
						subtitleData[lang] = data;
					} catch (error) {
						console.error(`Error loading ${lang} subtitles:`, error);
						subtitleData[lang] = [];
					}
				}

				setSubtitles(subtitleData);
			} catch (error) {
				console.error("Error loading subtitles:", error);
			}
		};

		loadSubtitles();
	}, []);

	const handleLanguageChange = useCallback((lang: Language) => {
		setSelectedLanguage(lang);
	}, []);

	if (!subtitles.ko?.length) {
		return <div className="p-4">Loading subtitles...</div>;
	}

	const findClosestSubtitle = (
		koIndex: number,
		targetLang: Language,
	): SubtitleCue | null => {
		const koSubtitle = subtitles.ko[koIndex];
		const targetSubtitles = subtitles[targetLang];
		if (!targetSubtitles?.length) return null;

		const koTime = parseTimeToSeconds(koSubtitle.startTime);
		let closestIndex = 0;
		let minDiff = Number.POSITIVE_INFINITY;

		targetSubtitles.forEach((sub, index) => {
			const targetTime = parseTimeToSeconds(sub.startTime);
			const diff = Math.abs(targetTime - koTime);
			if (diff < minDiff) {
				minDiff = diff;
				closestIndex = index;
			}
		});

		return minDiff <= 2 ? targetSubtitles[closestIndex] : null;
	};

	const scenes = groupSubtitlesIntoScenes(subtitles.ko);

	return (
		<div className="container mx-auto px-4 py-8 max-w-5xl">
			<div className="mb-8 flex justify-between items-center flex-wrap gap-y-2">
				<div className="flex space-x-2">
					<button
						type="button"
						onClick={() => setViewMode("side-by-side")}
						className={`px-4 py-2 rounded ${
							viewMode === "side-by-side"
								? "bg-blue-500 text-white"
								: "bg-gray-200 text-gray-700 hover:bg-gray-300"
						}`}
					>
						Side by Side
					</button>
					<button
						type="button"
						onClick={() => setViewMode("vertical")}
						className={`px-4 py-2 rounded ${
							viewMode === "vertical"
								? "bg-blue-500 text-white"
								: "bg-gray-200 text-gray-700 hover:bg-gray-300"
						}`}
					>
						Vertical
					</button>
				</div>
				<div className="flex space-x-2">
					{Object.entries(LANGUAGES).map(
						([lang, config]) =>
							lang !== "ko" && (
								<button
									type="button"
									key={lang}
									onClick={() => handleLanguageChange(lang as Language)}
									className={`px-4 py-2 rounded ${
										selectedLanguage === lang
											? "bg-blue-500 text-white"
											: "bg-gray-200 text-gray-700 hover:bg-gray-300"
									}`}
								>
									{config.label}
								</button>
							),
					)}
				</div>
			</div>

			<article className="prose prose-lg max-w-none">
				{scenes.map((scene, sceneIndex) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
					<section key={sceneIndex} className="mb-12">
						{scene.map((cue, index) => {
							const matchingSubtitle = findClosestSubtitle(
								subtitles.ko.indexOf(cue),
								selectedLanguage,
							);

							return (
								<div
									// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
									key={index}
									className={`mb-4 ${
										viewMode === "side-by-side"
											? "grid grid-cols-2 gap-6 items-start"
											: "space-y-2"
									}`}
								>
									<p className="text-lg leading-relaxed text-gray-900 m-0">
										{cue.text}
									</p>
									{matchingSubtitle && (
										<p
											className={`text-base text-gray-600 m-0 ${
												viewMode === "vertical" ? "" : ""
											}`}
										>
											<span
												// biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
												dangerouslySetInnerHTML={{
													__html: matchingSubtitle.text,
												}}
											/>
										</p>
									)}
								</div>
							);
						})}
						<div className="text-left">
							<span className="text-sm text-gray-400">
								{scene[0].startTime} → {scene[scene.length - 1].endTime}
							</span>
						</div>
					</section>
				))}
			</article>
		</div>
	);
}

function parseTimeToSeconds(timestamp: string): number {
	const [hours, minutes, seconds] = timestamp.split(":").map(Number);
	return hours * 3600 + minutes * 60 + seconds;
}
