export default function TopikLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className="w-10/12 lg:w-3/4 xl:w-[1024px] mx-auto py-6">
			{children}
		</div>
	);
}
