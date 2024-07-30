import { DEFAULT_DICT, type Dict } from "@/types/dict";
import type { Dicts } from "@/types/dict";
import { getBaseURL } from "@/utils/get-base-url";
import { GraphQLClient } from "graphql-request";

const parseURL = (url: string) =>
	url.startsWith("http") ? url : `${getBaseURL()}${url}`;

/** client api */
export const client = () => new GraphQLClient(parseURL("/api/graphql"));

/** server api */
const createFetch =
	(type: "static" | "dynamic" = "static") =>
	(...args: Parameters<typeof fetch>) =>
		fetch(typeof args[0] === "string" ? parseURL(args[0]) : args[0], {
			...(args[1] || {}),
			cache: type ? "force-cache" : "no-store",
		}).then((res) => res.json());

// biome-ignore lint/correctness/noUnusedVariables: <explanation>
const staticFetch = createFetch("static");
const dynamicFetch = createFetch("dynamic");

export const fetchDict = async (
	target: keyof typeof Dicts = DEFAULT_DICT,
): Promise<Dict> => {
	return dynamicFetch(`/dicts/${target}.json`);
};
