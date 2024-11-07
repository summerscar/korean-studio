"use client";
/**
 * https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading#skipping-ssr
 * ssr: false option will only work for client components, move it into client components ensure the client code-splitting working properly.
 */
import dynamic from "next/dynamic";

const Search = dynamic(() => import("./search").then((mod) => mod.Search), {
	ssr: false,
});

const DynamicSearch = () => <Search />;

export { DynamicSearch };
