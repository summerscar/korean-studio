import type { createAuth } from "@keystone-6/auth";
import { list } from "@keystone-6/core";
import { allowAll } from "@keystone-6/core/access";
import { checkbox, password, text, timestamp } from "@keystone-6/core/fields";
import type { Lists } from ".keystone/types";

export const authConfig = {
	listKey: "User",
	identityField: "email",
	secretField: "password",
	// Additional options
	sessionData: "id name email isAdmin",
	initFirstItem: {
		fields: ["name", "email", "password"],
		itemData: { isAdmin: true },
		skipKeystoneWelcome: false,
	},
} satisfies Parameters<typeof createAuth>[0];

export const lists = {
	User: list({
		access: allowAll,
		fields: {
			name: text({ validation: { isRequired: true } }),
			email: text({ validation: { isRequired: true }, isIndexed: "unique" }),
			password: password(),
			isAdmin: checkbox(),
			createdAt: timestamp({
				defaultValue: { kind: "now" },
			}),
		},
	}),
} satisfies Lists;
