// import type { Context } from ".keystone/types";
import { createAuth } from "@keystone-6/auth";
import { config, list } from "@keystone-6/core";
import { statelessSessions } from "@keystone-6/core/session";
import { authConfig, lists } from "./keystone/schema";

const { withAuth } = createAuth(authConfig);

const session = statelessSessions({
	secret: "-- SESSION SECRET; KOREAN STUDIO --",
	maxAge: 60 * 60 * 24 * 30,
});

export default withAuth(
	config({
		server: {
			port: 4000,
		},
		db: {
			provider: "sqlite",
			url: `file:${process.cwd()}/keystone.db`, // next.js requires an absolute path for sqlite
			onConnect: async () => {
				// await seedDemoData(context);
			},
			prismaClientPath: "node_modules/.prisma/client",
		},
		lists,
		session,
		ui: {
			isAccessAllowed: (context) => !!context.session?.data?.isAdmin,
		},
	}),
);
