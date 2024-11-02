"use client";

import type { FileItem } from "@/utils/list-docs";
import { usePathname } from "next/navigation";
import type { PropsWithChildren } from "react";

const CategoryParentClient = ({
	list,
	children,
}: PropsWithChildren<{ list: FileItem[] }>) => {
	const pathname = usePathname();
	const curFileName = decodeURIComponent(pathname).split("/").pop();
	const isOpen = !!list.find((item) => item.fileName === curFileName);

	return <details open={isOpen}>{children}</details>;
};

export { CategoryParentClient };
