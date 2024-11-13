import { getBaseURL } from "@/utils/get-base-url";
import { GraphQLClient } from "graphql-request";

const parseURL = (url: string) =>
	url.startsWith("http") ? url : `${getBaseURL()}${url}`;

/** client api */
export const client = new GraphQLClient(parseURL("/api/graphql"));
