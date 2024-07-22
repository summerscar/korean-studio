import { DocsCategory } from "@/components/docs-category";
import type { LevelParams } from "@/types";

const Category = ({ params }: { params: LevelParams }) => {
	return <DocsCategory level={params.level} />;
};
export default Category;
