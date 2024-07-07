import type { Dict } from "@/types/dict";
import type { dicts } from "@/utils/config";
import { timeOut } from "@/utils/time-out";
import { GraphQLClient } from "graphql-request";

const parseURL = (url: string) =>
	`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}${url}`;

export const client = new GraphQLClient(parseURL("/api/graphql"));

export const fetchDict = async (
	target: keyof typeof dicts = "kr-popular",
): Promise<Dict> => {
	return timeOut(2000).then(() =>
		fetch(parseURL(`/dicts/${target}.json`)).then((res) => res.json()),
	);
};
