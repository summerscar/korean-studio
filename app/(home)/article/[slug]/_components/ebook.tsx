"use client";
import CloseIcon from "@/assets/svg/close.svg";
import ExitFullscreenIcon from "@/assets/svg/exit-full-screen.svg";
import FullscreenIcon from "@/assets/svg/full-screen.svg";
import NextIcon from "@/assets/svg/next.svg";
import PrevIcon from "@/assets/svg/prev.svg";
import { timeOut } from "@/utils/time-out";
import { useClickAway, useFullscreen, useMemoizedFn } from "ahooks";
import clsx from "clsx";
import type { Book, Contents, Location, NavItem, Rendition } from "epubjs";
import type Section from "epubjs/types/section";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const debug = false;

const EBookRender = dynamic(
	() => import("./ebook-render").then((mod) => mod.EBookRender),
	{
		ssr: false,
	},
);

const EBook = ({
	bookTitle,
	bookURL,
	bookId,
}: {
	bookTitle: string;
	bookId: string;
	bookURL: string;
}) => {
	const [book, setBook] = useState<Book | null>(null);
	const [rendition, setRendition] = useState<Rendition | null>(null);
	const [spines, setSpines] = useState<Section[]>([]);
	const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
	const sectionId = useSearchParams().get("section") || "0";

	const [isLoading, setIsLoading] = useState(true);
	const [tableOfContents, setTableOfContents] = useState<NavItem[]>([]);
	const [showTOC, setShowTOC] = useState(false);
	const [clonedDoms, setClonedDoms] = useState<HTMLElement | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const [scrollLeft, setScrollLeft] = useState(0);
	const wrapperRef = useRef<HTMLDivElement>(null);
	const tocWrapperRef = useRef<HTMLDivElement>(null);
	const initPromiseRef = useRef<Promise<void> | null>(null);
	const ebookRenderContainerRef = useRef<HTMLDivElement>(null);
	const [isFullScreen, { enterFullscreen, exitFullscreen }] = useFullscreen(
		wrapperRef,
		{
			onEnter: () => {
				setTimeout(() => {
					rendition?.resize(window.innerWidth, window.innerHeight);
				}, 100);
			},
			onExit: () => {
				setTimeout(() => {
					rendition?.resize(
						wrapperRef.current!.clientWidth,
						wrapperRef.current!.clientHeight,
					);
				}, 100);
			},
		},
	);

	const onRender = useMemoizedFn((contents: Contents) => {
		contents.document
			.querySelectorAll("p:not([data-paragraph-index])")
			.forEach((p, index) => {
				p.setAttribute("data-paragraph-index", `${index}`);
			});
		(async () => {
			await timeOut(16);
			await Promise.all(
				[...contents.document.querySelectorAll("img")].map(async (img) => {
					await timeOut(16);
					const rect = img.getBoundingClientRect();
					img.style.width = `${rect.width}px`;
					img.style.height = `${rect.height}px`;
				}),
			);
			const clonedBody = contents.document.body.cloneNode(true);
			const wrapper = document.createElement("div");
			wrapper.setAttribute(
				"style",
				contents.document.body.getAttribute("style") || "",
			);
			const scrollLeft =
				containerRef.current?.querySelector(".epub-container")?.scrollLeft || 0;

			Object.assign(wrapper.style, {
				overflowY: "visible",
				transform: `translateX(-${scrollLeft}px)`,
			});
			[...clonedBody.childNodes].forEach((node) => {
				wrapper.appendChild(node);
			});
			setClonedDoms(wrapper);
		})();
	});

	useEffect(() => {
		if (initPromiseRef.current) return;

		initPromiseRef.current = (async () => {
			if (bookURL && containerRef.current) {
				await import("jszip").then((m) => m.default);
				const ePub = await import("epubjs").then((m) => m.default);
				const newBook = ePub(bookURL);

				const newRendition = newBook.renderTo(containerRef.current, {
					width: "100%",
					height: "600px",
					flow: "paginated",
					spread: "always",
					allowScriptedContent: true,
				});

				setBook(newBook);
				setRendition(newRendition);
				window.book = newBook;
				// Optional: Add navigation methods

				newBook.ready.then(async () => {
					const spines: Section[] = [];
					newBook.spine.each((item: Section) => spines.push(item));

					const urlSection = new URLSearchParams(window.location.search).get(
						"section",
					);
					const sectionURL = spines.find(
						(item) => item.idref === urlSection,
					)?.href;
					sectionURL && newRendition.display(sectionURL);

					setSpines(spines);
					setIsLoading(false);
					console.log("Book is ready", newRendition);
				});

				newRendition.hooks.render.register(onRender);

				newRendition.display();
				// Fetch and set table of contents
				const toc = await newBook.loaded.navigation;
				setTableOfContents(toc.toc);
			}
		})();
		initPromiseRef.current.then(() => {
			initPromiseRef.current = null;
		});
	}, [bookURL, onRender]);

	const updateScrollLeft = () => {
		const scrollLeft =
			containerRef.current?.querySelector(".epub-container")?.scrollLeft;
		setScrollLeft(scrollLeft || 0);
	};

	const onRelocated = useMemoizedFn((location: Location) => {
		setCurrentLocation(location);
		setTimeout(() => {
			updateScrollLeft();
		}, 16);
	});

	useEffect(() => {
		if (!ebookRenderContainerRef.current?.firstChild) return;
		(
			ebookRenderContainerRef.current.firstChild as HTMLDivElement
		).style.transform = `translateX(-${scrollLeft}px)`;
	}, [scrollLeft]);

	const handleSectionChange = useMemoizedFn((location: Location) => {
		const idref = spines.find(
			(item) => item.href === location.start.href,
		)?.idref;

		if (idref) {
			history.replaceState({}, "", `/article/${bookId}?section=${idref}`);
		}
	});

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		currentLocation && handleSectionChange(currentLocation);
	}, [currentLocation?.start.href, handleSectionChange]);

	useEffect(() => {
		if (rendition) {
			rendition.on("relocated", onRelocated);
			return () => {
				rendition.off("relocated", onRelocated);
			};
		}
	}, [rendition, onRelocated]);

	const handleNextPage = () => {
		if (rendition) {
			rendition.next();
		}
	};

	const handlePrevPage = () => {
		if (rendition) {
			rendition.prev();
		}
	};

	const handleTOCItemClick = async (href: string) => {
		if (rendition) {
			await rendition.display(href);
		}
	};

	const changeFontSize = (fontSize: string) => () => {
		rendition?.themes.fontSize(fontSize);
		onThemeChange();
	};
	const onThemeChange = () => {
		if (!rendition) return;
		const contents = rendition.getContents() as unknown as Contents[];
		onRender(contents[0]);
	};

	const clean = useMemoizedFn(() => {
		rendition?.destroy();
		book?.destroy();
	});

	useClickAway(() => setShowTOC(false), tocWrapperRef);

	useEffect(() => clean, [clean]);

	return (
		<div ref={wrapperRef}>
			<div
				className={clsx(
					"epub-reader relative h-[600px] rounded-lg overflow-hidden bg-[#F5F5DC]/80 dark:bg-[#F5F5DC]/10 drop-shadow-lg",
					isFullScreen && "h-screen",
				)}
			>
				{isLoading && (
					<div className="loading loading-spinner loading-lg absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
				)}

				<div
					ref={containerRef}
					className={clsx(
						"w-full h-full absolute left-0 top-0 z-[-1]",
						"pointer-events-none invisible opacity-0",
						debug && "pointer-events-auto opacity-50 -translate-x-0.5 z-[1]",
					)}
				/>
				{clonedDoms && (
					<EBookRender
						dom={clonedDoms}
						bookId={bookId}
						sectionId={sectionId}
						containerRef={ebookRenderContainerRef}
					/>
				)}
				{/* Table of Contents Sidebar */}
				{tableOfContents.length > 0 && !showTOC && (
					<div className="absolute left-0 top-0 z-10">
						<button
							type="button"
							onClick={() => setShowTOC(!showTOC)}
							className="btn btn-ghost btn-md text-lg text-base-content"
						>
							{"☰"}
						</button>
					</div>
				)}
				{showTOC && tableOfContents.length > 0 && (
					<div
						ref={tocWrapperRef}
						className="w-72 h-full overflow-y-auto bg-[#F5F5DC] dark:bg-gray-800 shadow-lg absolute left-0 top-0 z-[1]"
					>
						<div className="sticky top-0 bg-[#F5F5DC] dark:dark:bg-gray-800 p-4 shadow-md">
							<h2 className="text-xl font-bold mb-4">
								{bookTitle}
								<button
									type="button"
									onClick={() => setShowTOC(!showTOC)}
									className="btn btn-ghost btn-xs float-right"
								>
									<CloseIcon className="size-4" />
								</button>
							</h2>
							<div className="flex gap-2">
								<button
									type="button"
									onClick={changeFontSize("14px")}
									className="btn btn-ghost btn-xs"
								>
									<span className="text-sm">한</span>
								</button>
								<button
									type="button"
									onClick={changeFontSize("16px")}
									className="btn btn-ghost btn-xs"
								>
									<span className="text-base">한</span>
								</button>
								<button
									type="button"
									onClick={changeFontSize("18px")}
									className="btn btn-ghost btn-xs"
								>
									<span className="text-lg">한</span>
								</button>
							</div>
						</div>
						<div className="px-4">
							<TOCItems
								items={tableOfContents}
								onTOCItemClick={handleTOCItemClick}
							/>
						</div>
					</div>
				)}
				<PrevIcon
					className="absolute left-1 top-1/2 -translate-y-1/2 w-8 h-8 cursor-pointer"
					onClick={handlePrevPage}
				/>
				<NextIcon
					className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 cursor-pointer"
					onClick={handleNextPage}
				/>
				{isFullScreen ? (
					<ExitFullscreenIcon
						className="absolute right-2 top-2 size-6 cursor-pointer"
						onClick={exitFullscreen}
					/>
				) : (
					<FullscreenIcon
						className="absolute right-2 top-2 size-6 cursor-pointer"
						onClick={enterFullscreen}
					/>
				)}
				<div className="absolute bottom-2 left-1/2 -translate-x-1/2 select-none">
					<span className="text-sm text-base-content/70">
						{currentLocation
							? `${currentLocation.start.displayed.page} /
						${currentLocation.start.displayed.total}`
							: ""}
					</span>
				</div>
				<div className="absolute bottom-2 right-2 -translate-x-1/2 select-none">
					<span className="text-sm text-base-content/50">
						{spines.findIndex((s) => s.href === currentLocation?.start.href) +
							1}{" "}
						/ {spines.length}
					</span>
				</div>
			</div>
		</div>
	);
};

const TOCItems = ({
	items,
	level = 0,
	onTOCItemClick,
}: {
	items: NavItem[];
	level?: number;
	onTOCItemClick?: (href: string) => void;
}) => {
	return items.map((item) => (
		<div key={item.id} className={`pl-${level * 4}`}>
			<button
				type="button"
				onClick={() => onTOCItemClick?.(item.href)}
				className="w-full text-left hover:bg-gray-100 p-2"
			>
				{item.label}
			</button>
			{item.subitems && item.subitems.length > 0 && (
				<div>
					<TOCItems
						items={item.subitems}
						level={level + 1}
						onTOCItemClick={onTOCItemClick}
					/>
				</div>
			)}
		</div>
	));
};

export { EBook };
