"use client";
import { SelectToSearch } from "@/hooks/use-select-to-search";
import { useMemoizedFn } from "ahooks";
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

	useEffect(() => {
		(async () => {
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

	const clean = useMemoizedFn(() => {
		rendition?.destroy();
		book?.destroy();
	});

	useEffect(() => clean, [clean]);

	return (
		<div>
			<div className="epub-reader relative rounded-lg bg-[#F5F5DC]/80 dark:bg-[#F5F5DC]/10 drop-shadow-lg">
				{isLoading && (
					<div className="loading loading-spinner loading-lg absolute left-1/2 top-64 -translate-x-1/2 -translate-y-1/2" />
				)}

				<div
					ref={containerRef}
					className="w-full pointer-events-none invisible h-[600px] opacity-0"
				/>
				{clonedDoms && (
					<SelectToSearch
						showAdd
						showAnnotate
						prompt="sentence"
						className="absolute w-full h-full left-0 top-0"
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
							className="btn btn-ghost"
						>
							{"☰"}
						</button>
					</div>
				)}
				{showTOC && tableOfContents.length > 0 && (
					<div className="w-72 h-full overflow-y-auto border-r p-4 bg-white/30 backdrop-blur-lg absolute left-0 top-0 z-[1]">
						<h2 className="text-xl font-bold mb-4">
							{bookTitle}
							<button
								type="button"
								onClick={() => setShowTOC(!showTOC)}
								className="btn btn-ghost btn-sm float-right"
							>
								{"×"}
							</button>
						</h2>

						<TOCItems
							items={tableOfContents}
							onTOCItemClick={handleTOCItemClick}
						/>
					</div>
				)}
			</div>
			<div className="epub-controls flex justify-between p-2">
				<button onClick={handlePrevPage} type="button">
					Previous Page
				</button>
				<div className="text-center">
					{/* Page {currentPage} of {totalPages} */}
				</div>
				<button onClick={handleNextPage} type="button">
					Next Page
				</button>
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
