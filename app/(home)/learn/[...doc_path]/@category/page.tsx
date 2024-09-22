import { DocsCategory } from "@/components/docs-category";
import type { DocPathParams } from "@/types";

const Category = ({ params }: { params: DocPathParams }) => {
	return <DocsCategory doc_path={params.doc_path} />;
};
export default Category;
