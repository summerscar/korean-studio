"use client";
import { removeArticleAction } from "@/actions/article-actions";
import TrashIcon from "@/assets/svg/trash.svg";
import { useUser } from "@/hooks/use-user";

const ArticleRemove = ({ id }: { id: string }) => {
	const { isAdmin } = useUser();

	const remove = () => {
		if (confirm("")) {
			removeArticleAction(id);
		}
	};

	if (!isAdmin) return null;
	return (
		<button
			className="btn btn-circle btn-sm absolute -right-1 -top-1 shadow"
			onClick={remove}
			type="button"
		>
			<TrashIcon />
		</button>
	);
};

export { ArticleRemove };
