import type { DocPathParams } from "@/types";
import { DocsCategory } from "./_components/category";

const Category = ({ params }: { params: DocPathParams }) => {
	return <DocsCategory doc_path={params.doc_path} />;
};
export default Category;
