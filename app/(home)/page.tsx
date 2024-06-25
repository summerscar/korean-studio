"use client";
import krPopular from "@/assets/dicts/kr-popular.json";
import { HomeInput } from "@/components/home-input";
import { HomeStatus } from "@/components/home-status";
import { useLatest } from "ahooks";
import { useState } from "react";

export default function Home() {
	const [inputKeys, setInputKeys] = useState<Record<string, boolean>>({});

	return (
		<main className="w-full flex flex-col items-center justify-center">
			<HomeStatus dict={krPopular} inputKeys={inputKeys} />
			<HomeInput onInput={setInputKeys} />
		</main>
	);
}
