import dynamic from "next/dynamic";

const DynamicWordCards = dynamic(
	() =>
		import("@/components/home-status/word-cards").then((mod) => mod.WordCards),
	{
		ssr: false,
		loading: () => (
			<div className="animate-pulse w-60 h-80 bg-gray-200 rounded-2xl flex items-center justify-center">
				<span className="loading loading-ring loading-lg" />
			</div>
		),
	},
);

const DynamicDrawer = dynamic(
	() => import("@/components/home-drawer").then((mod) => mod.HomeDrawer),
	{
		ssr: false,
	},
);

export { DynamicWordCards, DynamicDrawer };
