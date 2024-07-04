import { keystoneContext } from "@/../keystone/context";
import { createYoga } from "graphql-yoga";
import type { NextApiRequest, NextApiResponse } from "next";

// Use Keystone API to create GraphQL handler
const { handleRequest } = createYoga<{
	req: NextApiRequest;
	res: NextApiResponse;
}>({
	graphqlEndpoint: "/api/graphql",
	schema: keystoneContext.graphql.schema,
	/*
    `keystoneContext` object doesn't have user's session information.
    You need an authenticated context to CRUD data behind access control.
    keystoneContext.withRequest(req, res) automatically unwraps the session cookie
    in the request object and gives you a `context` object with session info
    and an elevated sudo context to bypass access control if needed (context.sudo()).
  */
	context: ({ req, res }) => keystoneContext.withRequest(req, res),
	fetchAPI: { Response },
});

/** https://nextjs.org/docs/app/building-your-application/routing/route-handlers#supported-http-methods */
export {
	handleRequest as GET,
	handleRequest as POST,
	handleRequest as OPTIONS,
};
