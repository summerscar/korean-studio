"use client";
import CloseIcon from "@/assets/svg/close.svg";
import ExitFullscreenIcon from "@/assets/svg/exit-full-screen.svg";
import FullscreenIcon from "@/assets/svg/full-screen.svg";
import NextIcon from "@/assets/svg/next.svg";
import PrevIcon from "@/assets/svg/prev.svg";
import { SelectToSearch } from "@/hooks/use-select-to-search";
import { isServer } from "@/utils/is-server";
import { useEventListener, useMemoizedFn } from "ahooks";
import clsx from "clsx";
import type { Book, Contents, Location, NavItem, Rendition } from "epubjs";
import { useEffect, useRef, useState } from "react";

const EBook = ({
	bookTitle,
	bookURL,
}: {
	bookTitle: string;
	bookId: string;
	bookURL: string;
}) => {
	const [book, setBook] = useState<Book | null>(null);
	const [rendition, setRendition] = useState<Rendition | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [tableOfContents, setTableOfContents] = useState<NavItem[]>([]);
	const [showTOC, setShowTOC] = useState(false);
	const [clonedDoms, setClonedDoms] = useState<HTMLElement | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const [scrollLeft, setScrollLeft] = useState(0);
	const wrapperRef = useRef<HTMLDivElement>(null);
	const [isFullScreen, setIsFullScreen] = useState(false);
	const initPromiseRef = useRef<Promise<void> | null>(null);

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
					setIsLoading(false);
					console.log("Book is ready", newRendition);
				});

				newRendition.hooks.content.register((contents: Contents) => {
					contents.document.querySelectorAll("p").forEach((p, index) => {
						p.setAttribute("data-paragraph-index", `${index}`);
					});
					const clonedBody = contents.document.body.cloneNode(true);
					const wrapper = document.createElement("div");
					wrapper.setAttribute(
						"style",
						contents.document.body.getAttribute("style") || "",
					);
					wrapper.classList.add("overflow-hidden");
					[...clonedBody.childNodes].forEach((node) => {
						wrapper.appendChild(node);
					});
					setClonedDoms(wrapper);
				});

				newRendition.display();
				// Fetch and set table of contents
				const toc = await newBook.loaded.navigation;
				setTableOfContents(toc.toc);
			}
		})();
		initPromiseRef.current.then(() => {
			initPromiseRef.current = null;
		});
	}, [bookURL]);

	useEffect(() => {
		if (rendition) {
			rendition.on("relocated", (location: Location) => {
				console.log("relocated", location);
				setTimeout(() => {
					const scrollLeft =
						containerRef.current?.querySelector(".epub-container")?.scrollLeft;

					setScrollLeft(scrollLeft || 0);
				});
			});
		}
	}, [rendition]);

	useEffect(() => {
		clonedDoms?.scrollTo(scrollLeft, 0);
	}, [scrollLeft, clonedDoms]);

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

	const onFullscreenChange = useMemoizedFn(() => {
		if (isFullScreen) {
			rendition?.resize(window.innerWidth, window.innerHeight);
		} else {
			rendition?.resize(
				wrapperRef.current!.clientWidth,
				wrapperRef.current!.clientHeight,
			);
		}
	});

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		onFullscreenChange();
	}, [isFullScreen, onFullscreenChange]);

	const handleFullscreen = () => {
		if (isFullScreen) {
			document.exitFullscreen();
			return;
		}
		if (wrapperRef.current) {
			wrapperRef.current.requestFullscreen();
		}
	};

	useEventListener(
		"fullscreenchange",
		() => {
			setIsFullScreen(document.fullscreenElement !== null);
		},
		{ target: isServer ? undefined : document },
	);

	const clean = useMemoizedFn(() => {
		rendition?.destroy();
		book?.destroy();
	});

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
						"w-full pointer-events-none invisible h-full opacity-0 absolute left-0 top-0 z-[-1]",
					)}
				/>
				{clonedDoms && (
					<SelectToSearch
						showAdd
						showAnnotate
						prompt="sentence"
						className="w-full h-full"
					>
						<div
							ref={(el) => {
								if (!el || clonedDoms === el.firstChild) return;
								el.innerHTML = "";
								el.appendChild(clonedDoms);
							}}
							className="w-full h-full ebook"
						/>
					</SelectToSearch>
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
					<div className="w-72 h-full overflow-y-auto p-4 bg-white/30 dark:bg-black/50 backdrop-blur-lg absolute left-0 top-0 z-[1]">
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

						<TOCItems
							items={tableOfContents}
							onTOCItemClick={handleTOCItemClick}
						/>
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
						onClick={handleFullscreen}
					/>
				) : (
					<FullscreenIcon
						className="absolute right-2 top-2 size-6 cursor-pointer"
						onClick={handleFullscreen}
					/>
				)}
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
