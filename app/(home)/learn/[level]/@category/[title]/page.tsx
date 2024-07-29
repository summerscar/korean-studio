import { DocsCategory } from "@/components/docs-category";
import type { DocsTitleParams, LevelParams } from "@/types";

const Category = ({ params }: { params: LevelParams & DocsTitleParams }) => {
	return <DocsCategory level={params.level} title={params.title} />;
};
export default Category;
