import type { AnnotationItem } from "@/types/annotation";
import clsx from "clsx";
import { Link } from "next-view-transitions";

const Annotations = ({
	annotations,
	className,
}: {
	annotations: (AnnotationItem & {
		articleId: { id: string; title: string; createdAt: string };
	})[];
	className?: string;
}) => {
	return (
		<div className={clsx("flex flex-col gap-4", className)}>
			{annotations.map((annotation) => (
				<div
					key={annotation.id}
					className="p-4 bg-slate-200/20 rounded-lg backdrop-blur-md shadow"
				>
					<div className="flex gap-3 flex-col sm:flex-row">
						<p className="font-bold sm:w-1/4 sm:shrink-0">{annotation.text}</p>
						<p className="whitespace-pre-wrap">{annotation.content}</p>
					</div>
					<div className="flex gap-2 pt-4 justify-between text-xs text-gray-500">
						<p className="flex-auto mobile:w-44 truncate sm:mr-8">
							{/* TODO: dialog or tooltip */}
							{/* Consider using a modal or tooltip to display article preview   */}
							<Link
								target="_blank"
								href={`/article/${annotation.articleId.id}`}
							>
								{annotation.articleId.title}
							</Link>
						</p>
						<p className="justify-items-end flex-none">
							{new Date(annotation.createdAt!).toLocaleString()}
						</p>
					</div>
				</div>
			))}
		</div>
	);
};

export default Annotations;
