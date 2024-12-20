"use client";
import { mapForLocale } from "@/components/footer/i18n-switcher";
import { useSelectToSearch } from "@/hooks/use-select-to-search";
import {
	type SubtitleCue,
	type SubtitleCues,
	type SubtitleData,
	type SubtitleLanguage,
	type SubtitleSeries,
	mapSubtitleLanguageToSiteLanguage,
} from "@/types/article";
import type { SITES_LANGUAGE } from "@/types/site";
import { notoKR } from "@/utils/fonts";
import { isDev } from "@/utils/is-dev";
import { generateSentenceSuggestionPrompt } from "@/utils/prompts";
import { timeOut } from "@/utils/time-out";
import { useDebounce, useMemoizedFn, useMount, useUpdateEffect } from "ahooks";
import clsx from "clsx";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { type RefObject, memo, useEffect, useMemo, useState } from "react";

// Group subtitles into scenes based on time gaps
function groupSubtitlesIntoScenes(subtitles: SubtitleCue[]): SubtitleCue[][] {
	const scenes: SubtitleCue[][] = [];
	let currentScene: SubtitleCue[] = [];

	// If gap is more than 3 seconds, start a new scene
	const sceneGap = 5;

	subtitles.forEach((subtitle, index) => {
		if (index === 0) {
			currentScene.push(subtitle);
			return;
		}

		const currentTime = parseTimeToSeconds(subtitle.startTime);
		const prevTime = parseTimeToSeconds(subtitles[index - 1].endTime);

		if (currentTime - prevTime > sceneGap) {
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

const loading = (
	<div className="w-full flex justify-center items-center">
		<span>Loading...</span>
	</div>
);

export function ArticleMovie({
	defaultSubtitleCues,
	subtitleSeries,
}: {
	defaultSubtitleCues: SubtitleCues;
	subtitleSeries: SubtitleSeries;
}) {
	const locale = useLocale() as SITES_LANGUAGE;
	const tArticle = useTranslations("Article");
	const epIndex = Number.parseInt(useSearchParams().get("ep") || "0");
	const [subtitles, setSubtitles] = useState<SubtitleData>({
		ko: defaultSubtitleCues,
	});
	const [activeScene, setActiveScene] = useState(0);
	const [isDrawerOpen, setIsDrawerOpen] = useState(true);
	const [selectedLanguage, setSelectedLanguage] = useState<SubtitleLanguage>(
		Object.entries(mapSubtitleLanguageToSiteLanguage).find(
			([_, lang]) => lang === locale,
		)?.[0] as SubtitleLanguage,
	);
	const deferredSelectedLanguage = useDebounce(selectedLanguage, { wait: 50 });
	const [viewMode, setViewMode] = useState<"side-by-side" | "vertical">(
		"side-by-side",
	);

	const [containerRef, panel] = useSelectToSearch({
		prompt: generateSentenceSuggestionPrompt,
		showAdd: true,
	});

	useMount(async () => {
		await timeOut(500);
		loadSubtitles(selectedLanguage);
	});

	useUpdateEffect(() => {
		setSubtitles({});
		loadSubtitles("ko");
		loadSubtitles(selectedLanguage);
	}, [epIndex]);

	const subtitleEpisode = subtitleSeries[epIndex];
	const subtitleFiles = subtitleEpisode.subtitles;

	const loadSubtitles = useMemoizedFn(async (lang: SubtitleLanguage) => {
		try {
			const subtitleData: SubtitleData = {};
			try {
				isDev && console.log("loading...", subtitleFiles[lang].filename);
				const response = await fetch(
					`/subtitle-text/${subtitleFiles[lang].filename}`,
				);
				const data = await response.json();
				subtitleData[lang] = data;
			} catch (error) {
				console.error(`Error loading ${lang} subtitles:`, error);
				subtitleData[lang] = [];
			}

			setSubtitles((prev) => ({ ...prev, ...subtitleData }));
		} catch (error) {
			console.error("Error loading subtitles:", error);
		}
	});

	const handleLanguageChange = useMemoizedFn((lang: SubtitleLanguage) => {
		setSelectedLanguage(lang);
		!subtitles[lang] && loadSubtitles(lang);
	});

	const scenes = useMemo(() => {
		return groupSubtitlesIntoScenes(subtitles.ko || []);
	}, [subtitles.ko]);

	useEffect(() => {
		if (scenes.length === 0) {
			return;
		}
		const observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					const id = entry.target.getAttribute("id");
					if (id) {
						setActiveScene(Number(id.split("-")[1]));
					}
				}
			});
		});
		scenes.forEach((_, sceneIndex) => {
			const id = `scene-${sceneIndex}`;
			const el = document.getElementById(id);
			if (el) {
				observer.observe(el);
			}
		});

		return () => {
			scenes.forEach((_, sceneIndex) => {
				const id = `scene-${sceneIndex}`;
				const el = document.getElementById(id);
				if (el) {
					observer.unobserve(el);
				}
				observer.disconnect();
			});
		};
	}, [scenes]);

	return (
		<div className="relative">
			<div
				className={`before-backdrop-shadow fixed z-30 transition-all duration-300 ease-in-out ${
					isDrawerOpen ? "" : "translate-x-full"
				} top-24 right-1 w-64 bg-white/10 dark:bg-base-300 rounded-lg before:rounded-lg before:overflow-hidden shadow-lg p-4 flex flex-col max-h-[80vh]`}
			>
				<button
					type="button"
					onClick={() => {
						setIsDrawerOpen((prev) => !prev);
					}}
					className="left-0 top-1/2 -translate-x-full absolute p-2 bg-white/10 dark:bg-base-300 backdrop-blur-lg rounded-lg shadow-md rounded-r-none transition-colors"
					aria-label={isDrawerOpen ? "Close toolbar" : "Open toolbar"}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth={1.5}
						stroke="currentColor"
						className="size-4"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d={
								isDrawerOpen
									? "M8.25 4.5l7.5 7.5-7.5 7.5"
									: "M15.75 19.5L8.25 12l7.5-7.5"
							}
						/>
						<title>{isDrawerOpen ? "Close toolbar" : "Open toolbar"}</title>
					</svg>
				</button>
				<div className="space-y-4">
					<div className="space-y-2">
						<div className="font-semibold mb-2">{tArticle("viewMode")}</div>
						<div className="flex flex-col space-y-2">
							<button
								type="button"
								onClick={() => setViewMode("side-by-side")}
								className={`btn ${
									viewMode === "side-by-side"
										? "bg-slate-300/80 border-slate-300/80"
										: ""
								}`}
							>
								{tArticle("sideBySide")}
							</button>
							<button
								type="button"
								onClick={() => setViewMode("vertical")}
								className={`btn ${viewMode === "vertical" ? "bg-slate-300/80 border-slate-300/80" : ""}`}
							>
								{tArticle("vertical")}
							</button>
						</div>
					</div>

					<div className="space-y-2">
						<div className="font-semibold mb-2">{tArticle("translation")}</div>
						<div className="flex flex-wrap gap-2">
							{Object.entries(subtitleFiles)
								.sort((a) =>
									mapSubtitleLanguageToSiteLanguage[
										a[0] as SubtitleLanguage
									] === locale
										? -1
										: 1,
								)
								.map(
									([lang]) =>
										lang !== "ko" && (
											<button
												type="button"
												key={lang}
												onClick={() =>
													handleLanguageChange(lang as SubtitleLanguage)
												}
												className={`btn btn-sm ${
													selectedLanguage === lang
														? "bg-slate-300/80 border-slate-300/80"
														: ""
												}`}
											>
												{
													mapForLocale[
														mapSubtitleLanguageToSiteLanguage[
															lang as SubtitleLanguage
														]
													]
												}
											</button>
										),
								)}
						</div>
					</div>
				</div>

				<div className="mt-4 flex flex-col min-h-0">
					<div className="font-semibold mb-2">{tArticle("scene")}</div>
					<nav className="space-y-1 overflow-y-auto flex-1">
						{scenes.map((scene, index) => (
							<a
								// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
								key={index}
								href={`#scene-${index}`}
								className={clsx(
									"block px-3 py-2 text-sm rounded hover:bg-slate-300/80 dark:hover:bg-base-100",
									activeScene === index && "bg-slate-300/80 dark:bg-base-100",
								)}
							>
								{tArticle("scene")} {index + 1}
								<span className="text-xs text-gray-500 block">
									{scene[0].startTime} → {scene[scene.length - 1].endTime}
								</span>
							</a>
						))}
					</nav>
				</div>
			</div>

			{!subtitles.ko ? (
				loading
			) : (
				<ArticleRender
					ref={containerRef as RefObject<HTMLDivElement | null>}
					scenes={scenes}
					subtitles={subtitles}
					selectedLanguage={deferredSelectedLanguage}
					viewMode={viewMode}
				/>
			)}
			{panel}
		</div>
	);
}

function parseTimeToSeconds(timestamp: string): number {
	const [hours, minutes, seconds] = timestamp.split(":").map(Number);
	return hours * 3600 + minutes * 60 + seconds;
}

const ArticleRender = memo(
	({
		scenes,
		subtitles,
		selectedLanguage,
		viewMode,
		ref,
	}: {
		scenes: SubtitleCue[][];
		subtitles: SubtitleData;
		selectedLanguage: SubtitleLanguage;
		viewMode: "side-by-side" | "vertical";
		ref: React.RefObject<HTMLDivElement | null>;
	}) => {
		const tArticle = useTranslations("Article");
		const findClosestSubtitle = (
			koIndex: number,
			targetLang: SubtitleLanguage,
		): SubtitleCue | null => {
			const koSubtitle = subtitles.ko![koIndex];
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

			return minDiff <= 1 ? targetSubtitles[closestIndex] : null;
		};

		return (
			<article className="prose prose-lg max-w-none" ref={ref}>
				{scenes.map((scene, sceneIndex) => (
					<section
						// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
						key={sceneIndex}
						className="mb-12 [scroll-margin-top:var(--header-height)]"
						id={`scene-${sceneIndex}`}
					>
						{scene.map((cue, index) => {
							const matchingSubtitle = findClosestSubtitle(
								subtitles.ko!.indexOf(cue),
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
									<p
										className="text-lg leading-relaxed m-0"
										style={{ fontFamily: notoKR.style.fontFamily }}
										lang="ko"
									>
										{cue.text}
									</p>
									{sceneIndex === 0 && !subtitles[selectedLanguage] && loading}
									{matchingSubtitle && (
										<p
											className={`text-base m-0 text-base-content/70 ${
												viewMode === "vertical" ? "" : ""
											}`}
										>
											<span
												// biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
												dangerouslySetInnerHTML={{
													__html: matchingSubtitle.text,
												}}
												lang={selectedLanguage}
											/>
										</p>
									)}
								</div>
							);
						})}
						<div className="text-left">
							<span className="text-sm text-base-content/40">
								{tArticle("scene")}
								{sceneIndex + 1} {scene[0].startTime} →{" "}
								{scene[scene.length - 1].endTime}
							</span>
						</div>
					</section>
				))}
			</article>
		);
	},
);
