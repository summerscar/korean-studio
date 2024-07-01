import { list } from "@keystone-6/core";
import { allowAll } from "@keystone-6/core/access";
import { text, timestamp } from "@keystone-6/core/fields";
import type { Lists } from ".keystone/types";

export const lists = {
	User: list({
		access: allowAll,
		fields: {
			username: text({ validation: { isRequired: true } }),
			email: text({ validation: { isRequired: true }, isIndexed: "unique" }),
			createdAt: timestamp({
				defaultValue: { kind: "now" },
			}),
		},
	}),
} satisfies Lists;
