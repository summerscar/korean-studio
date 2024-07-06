import { keystoneContext } from "@/../keystone/context";
import { auth } from "auth";
import { createYoga } from "graphql-yoga";
import type { NextApiRequest, NextApiResponse } from "next";

// Use Keystone API to create GraphQL handler
const { handleRequest } = createYoga<{
	req: NextApiRequest;
	res: NextApiResponse;
}>({
	graphqlEndpoint: "/api/graphql",
	schema: keystoneContext.graphql.schema,
	context: async () => keystoneContext.withSession(await auth()),
	fetchAPI: { Response },
});

/** https://nextjs.org/docs/app/building-your-application/routing/route-handlers#supported-http-methods */
export {
	handleRequest as GET,
	handleRequest as POST,
	handleRequest as OPTIONS,
};
