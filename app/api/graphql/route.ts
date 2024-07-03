import { createYoga } from "graphql-yoga";
import type { NextApiRequest, NextApiResponse } from "next";
import { keystoneContext } from "../../../keystone/context";

/*
  An example of how to setup your own yoga graphql server
  using the generated Keystone GraphQL schema.
*/
export const config = {
	api: {
		// Disable body parsing (required for file uploads)
		bodyParser: false,
	},
};

// Use Keystone API to create GraphQL handler
const handler = createYoga<{
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
});

/** https://nextjs.org/docs/app/building-your-application/routing/route-handlers#supported-http-methods */
export {
	handler as GET,
	handler as POST,
	handler as PUT,
	handler as DELETE,
	handler as PATCH,
	handler as OPTIONS,
	handler as HEAD,
};
