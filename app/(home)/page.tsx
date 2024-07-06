import Home from "@/components/home";
import { fetchDict } from "@/utils/api";

export default function HomePage() {
	return (
		<main className="w-full flex flex-col items-center justify-center">
			<Home dictPromise={fetchDict()} />
		</main>
	);
}
