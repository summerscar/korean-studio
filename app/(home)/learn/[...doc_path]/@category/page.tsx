import type { DocPathParams } from "@/types";
import { DocsCategory } from "./_components/category";

const Category = async (props: { params: Promise<DocPathParams> }) => {
	const params = await props.params;
	return <DocsCategory doc_path={params.doc_path} />;
};
export default Category;
