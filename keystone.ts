import { config, list } from "@keystone-6/core";
import { lists } from "keystone/schema";
// import type { Context } from ".keystone/types";

export default config({
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
});
