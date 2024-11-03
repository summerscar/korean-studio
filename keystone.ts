import { createAuth } from "@keystone-6/auth";
import { config } from "@keystone-6/core";
import { statelessSessions } from "@keystone-6/core/session";
import { config as envConfig } from "dotenv";
import { authConfig, lists } from "./keystone/schema";
const { withAuth } = createAuth(authConfig);
envConfig({ path: ["./.env", "./.env.local"] });

const session = statelessSessions({
	secret: process.env.AUTH_SECRET,
	maxAge: 60 * 60 * 24 * 30,
});
const _start = session.start;
session.start = function (...args) {
	if (!args[0].context?.res)
		return Promise.resolve("hooks.session.start from nextauth.js");
	return _start.call(this, ...args);
};

export default withAuth(
	config({
		server: {
			port: 4000,
		},
		db: {
			provider: "postgresql",
			url: process.env.POSTGRES_URL!,
			enableLogging: false,
			prismaClientPath: "node_modules/.prisma/client",
		},
		lists,
		session: session,
		ui: {
			// the following api routes are required for nextauth.js
			publicPages: [
				"/api/auth/csrf",
				"/api/auth/signin",
				"/api/auth/callback",
				"/api/auth/session",
				"/api/auth/providers",
				"/api/auth/signout",
				"/api/auth/error",

				// each provider will need a separate callback and signin page listed here
				"/api/auth/signin/github",
				"/api/auth/callback/github",
			],

			// adding page middleware ensures that users are redirected to the signin page if they are not signed in.
			// pageMiddleware: async ({ wasAccessAllowed }) => {
			// 	if (wasAccessAllowed) return;
			// 	return {
			// 		kind: "redirect",
			// 		to: "/api/auth/signin",
			// 	};
			// },
			isAccessAllowed: (context) => !!context.session?.data?.isAdmin,
		},
	}),
);
