export default function Loading() {
	return (
		<div className="flex w-full flex-col gap-6">
			<div className="skeleton h-12 w-40" />
			<div className="skeleton h-8 w-1/3" />
			<div className="skeleton h-4 w-1/2" />
			<div className="skeleton h-4 w-3/4" />
			<div className="skeleton h-4 w-2/3" />
			<div className="skeleton h-4 w-1/2" />
		</div>
	);
}
