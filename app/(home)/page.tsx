import { HomeStatus } from "@/components/home-status";
import { fetchDict } from "@/utils/api";

export default async function HomePage() {
	const dict = await fetchDict();
	return (
		<main className="w-full flex flex-col items-center justify-center">
			<HomeStatus dict={dict} />
		</main>
	);
}
