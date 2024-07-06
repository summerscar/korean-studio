"use client";
import { HomeInput } from "@/components/home-input";
import { HomeStatus } from "@/components/home-status";
import type { Dict } from "@/types/dict";
import { use, useState } from "react";

export default function Home({ dictPromise }: { dictPromise: Promise<Dict> }) {
	const [inputKeys, setInputKeys] = useState<Record<string, boolean>>({});
	const dict = use(dictPromise);

	return (
		<>
			<HomeStatus dict={dict} inputKeys={inputKeys} />
			<HomeInput onInput={setInputKeys} />
		</>
	);
}
