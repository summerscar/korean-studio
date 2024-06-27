import { config, list } from "@keystone-6/core";
import { allowAll } from "@keystone-6/core/access";
import { text } from "@keystone-6/core/fields";
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
	lists: {
		User: list({
			access: allowAll,
			fields: {
				name: text({ validation: { isRequired: true } }),
				email: text({ validation: { isRequired: true }, isIndexed: "unique" }),
			},
		}),
	},
});
