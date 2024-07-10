import type { Dict } from "@/types/dict";
import type { dicts } from "@/utils/config";
import { timeOut } from "@/utils/time-out";
import { GraphQLClient } from "graphql-request";

const parseURL = (url: string) =>
	url.startsWith("http")
		? url
		: `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}${url}`;

/** client api */
export const client = new GraphQLClient(parseURL("/api/graphql"));

/** server api */
const createFetch =
	(type: "static" | "dynamic" = "static") =>
	(...args: Parameters<typeof fetch>) =>
		fetch(typeof args[0] === "string" ? parseURL(args[0]) : args[0], {
			...(args[1] || {}),
			cache: type ? "force-cache" : "no-store",
		}).then((res) => res.json());

const staticFetch = createFetch("static");
// biome-ignore lint/correctness/noUnusedVariables: <explanation>
const dynamicFetch = createFetch("dynamic");

export const fetchDict = async (
	target: keyof typeof dicts = "kr-popular",
): Promise<Dict> => {
	return timeOut(2000).then(() => staticFetch(`/dicts/${target}.json`));
};
