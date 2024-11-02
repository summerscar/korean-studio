import MenuIcon from "@/assets/svg/menu.svg";
import type { DocPathParams, Levels } from "@/types";
import { getServerI18n } from "@/utils/i18n";
import { type FileItem, type SubDirItem, listAllDocs } from "@/utils/list-docs";
import {
	CategoryActiveClient,
	MobileCategoryHeader,
} from "./category-active-client";
import { CategoryParentClient } from "./category-parent-client";

const DocsCategory = async ({ level }: Pick<DocPathParams, "level">) => {
	const docs = await listAllDocs(level);
	const t = await getServerI18n("Header");

	const buildTree = (docs: (FileItem | SubDirItem)[], path: string[] = []) => {
		return docs.map((doc) => {
			if ("children" in doc) {
				return (
					<li key={doc.title}>
						<CategoryParentClient list={doc.children as FileItem[]}>
							<summary>{doc.title}</summary>
							<ul>{buildTree(doc.children, [...path, doc.title])}</ul>
						</CategoryParentClient>
					</li>
				);
			}

			return (
				<li key={doc.title}>
					<CategoryActiveClient
						doc={doc}
						href={`/${path.join("/")}/${doc.fileName}`}
						className="flex"
					>
						{doc.title}
					</CategoryActiveClient>
				</li>
			);
		});
	};
	return (
		<nav className="self-start w-full sm:w-52 mobile:backdrop-blur-lg mobile:z-10 mobile:shadow-md flex-none sticky top-[--header-height] max-h-[calc(100dvh-var(--header-height))] overflow-auto">
			{/* mobile header */}
			<div className="block sm:hidden mobile:shadow-md p-3 sticky top-0 backdrop-blur-lg z-10">
				<label htmlFor="category-drawer">
					<MenuIcon className="inline-block h-6 w-6" />
					<span className="pl-3">
						<MobileCategoryHeader level={t(level)} key={level} />
					</span>
				</label>
			</div>
			<input
				id="category-drawer"
				type="checkbox"
				className="drawer-toggle peer"
			/>
			{/* mobile end */}
			<ul className="menu peer-checked:mobile:h-[calc(65vh-var(--header-height))] peer-checked:py-2 peer-checked:overflow-auto mobile:py-0 mobile:h-0 mobile:flex-nowrap mobile:transition-all mobile:duration-500 mobile:overflow-hidden">
				<li>
					<CategoryActiveClient className="flex" href={`/learn/${level}`}>
						{/* TODO: i18n */}
						介绍
					</CategoryActiveClient>
				</li>
				{buildTree(docs, ["learn", level])}
			</ul>
		</nav>
	);
};
export { DocsCategory };
