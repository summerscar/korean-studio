import krPopular from "@/assets/dicts/kr-popular.json";
import { HomeInput } from "@/components/home-input";
import { HomeStatus } from "@/components/home-status";

export default function Home() {
	return (
		<main className="w-full flex flex-col items-center justify-center">
			<HomeStatus dict={krPopular} />
			<HomeInput />
		</main>
	);
}
