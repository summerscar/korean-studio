import type { createAuth } from "@keystone-6/auth";
import { list } from "@keystone-6/core";
import { allOperations, allowAll } from "@keystone-6/core/access";
import {
	checkbox,
	integer,
	json,
	password,
	select,
	text,
	timestamp,
} from "@keystone-6/core/fields";
import type { KeystoneContext } from "@keystone-6/core/types";
import type { Session } from "next-auth";
import type { Lists, TypeInfo } from ".keystone/types";

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

const isFromNextAuth = (session: any) => {
	return session?.user?.id !== undefined;
};

const getUserFromNextAuth = async (
	ctx: KeystoneContext<TypeInfo>,
	session: Session,
) => {
	const id = session.user?.id;

	const user = await ctx.sudo().query.User.findOne({
		where: { id },
		query: "id name email isAdmin",
	});
	return user;
};

export const lists = {
	User: list({
		access: {
			operation: {
				...allOperations(allowAll),
				// hint: unconditionally returning `true` is equivalent to using allowAll for this operation
				query: async ({ session, context, listKey, operation }) => {
					console.log("-----no session-----");
					if (!session) return false;
					console.log(`[keystone][${operation}][${listKey}]: start...`);
					if (isFromNextAuth(session)) {
						const user = await getUserFromNextAuth(context, session);
						console.log(
							"[keystone][from next.js][query]",
							JSON.stringify(user),
						);
					}
					console.log(`[keystone][${operation}][${listKey}]: end...`);
					return true;
				},
			},
		},

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
	Topik: list({
		access: allowAll,
		fields: {
			no: integer({ validation: { isRequired: true } }),
			year: integer({ validation: { isRequired: true } }),
			level: select({
				type: "enum",
				options: [
					{ label: "TOPIK I", value: "TOPIK_I" },
					{ label: "TOPIK II", value: "TOPIK_II" },
				],
				validation: { isRequired: true },
			}),
			questionNumber: integer({ validation: { isRequired: true } }),
			questionType: select({
				type: "enum",
				options: [
					{ label: "听力", value: "LISTENING" },
					{ label: "阅读", value: "READING" },
					{ label: "写作", value: "WRITING" },
				],
				validation: { isRequired: true },
			}),
			questionContent: text({ validation: { isRequired: true } }),
			options: json(),
			correctAnswer: text({ validation: { isRequired: true } }),
			explanation: text(),
		},
	}),
} satisfies Lists;
