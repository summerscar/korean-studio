import { DEFAULT_DICT, type Dict } from "@/types/dict";
import type { Dicts } from "@/types/dict";
import { getBaseURL } from "@/utils/get-base-url";
import { GraphQLClient } from "graphql-request";

const parseURL = (url: string) =>
	url.startsWith("http") ? url : `${getBaseURL()}${url}`;

/** client api */
export const client = new GraphQLClient(parseURL("/api/graphql"));

/** server api */
export const fetchDict = async (
	target: Dicts = DEFAULT_DICT,
): Promise<Dict> => {
	return await (
		await fetch(parseURL(`/dicts/${target}.json`), {
			next: { revalidate: 24 * 60 * 60 },
		})
	).json();
};
