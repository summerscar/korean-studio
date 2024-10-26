import MenuIcon from "@/assets/svg/menu.svg";
import type { DocPathParams, Levels } from "@/types";
import { getServerI18n } from "@/utils/i18n";
import { type FileItem, type SubDirItem, listAllDocs } from "@/utils/list-docs";
import clsx from "clsx";
import Link from "next/link";

const DocsCategory = async ({ doc_path }: DocPathParams) => {
	const level = doc_path[0] as Levels;
	const docs = await listAllDocs(level);
	const t = await getServerI18n("Header");

	const formattedTitle =
		doc_path.length > 1 ? decodeURIComponent(doc_path?.pop() || "") : "";

	const buildTree = (docs: (FileItem | SubDirItem)[], path: string[] = []) => {
		return docs.map((doc) => {
			if ("children" in doc) {
				const isOpen = doc.children.find(
					(child) => child.title === formattedTitle,
				);
				return (
					<li key={doc.title}>
						<details open={!!isOpen}>
							<summary className="font-bold">{doc.title}</summary>
							<ul>{buildTree(doc.children, [...path, doc.title])}</ul>
						</details>
					</li>
				);
			}
			const docFileTitle = doc.file.replace(/\.mdx?/, "");
			return (
				<li key={doc.title}>
					<Link
						href={`/${path.join("/")}/${docFileTitle}`}
						className={clsx("flex", {
							active: formattedTitle === docFileTitle,
						})}
					>
						{doc.title}
					</Link>
				</li>
			);
		});
	};
	return (
		<nav className="self-start w-full sm:w-52 mobile:backdrop-blur-lg mobile:z-10 mobile:shadow-md flex-none sticky top-[--header-height] max-h-[calc(100vh-var(--header-height))] overflow-auto">
			<div className="block sm:hidden mobile:shadow-md p-3 sticky top-0 backdrop-blur-lg z-10">
				<label htmlFor="category-drawer">
					<MenuIcon className="inline-block h-6 w-6" />
					<span className="pl-3">
						{doc_path
							.map((p, index) =>
								index === 0 ? t(p as Levels) : decodeURIComponent(p),
							)
							.join(" / ")}
					</span>
				</label>
			</div>
			<input
				id="category-drawer"
				type="checkbox"
				className="drawer-toggle peer"
			/>
			<ul className="menu peer-checked:mobile:h-[calc(75vh-var(--header-height))] peer-checked:py-[unset] peer-checked:overflow-auto mobile:py-0 mobile:h-0 mobile:flex-nowrap mobile:transition-all mobile:duration-500 mobile:overflow-hidden">
				<li>
					<Link
						className={clsx("flex", { active: !formattedTitle })}
						href={`/learn/${level}`}
					>
						{/* TODO: i18n */}
						介绍
					</Link>
				</li>
				{buildTree(docs, ["learn", level])}
			</ul>
		</nav>
	);
};
export { DocsCategory };
