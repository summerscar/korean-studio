import type { createAuth } from "@keystone-6/auth";
import { list } from "@keystone-6/core";
import { allowAll } from "@keystone-6/core/access";
import {
	checkbox,
	integer,
	json,
	password,
	relationship,
	select,
	text,
	timestamp,
} from "@keystone-6/core/fields";
import type { KeystoneContext } from "@keystone-6/core/types";
import type { Session as NextAuthSession } from "next-auth";
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

type KeyStoneSession = {
	data: {
		id: string;
		isAdmin: boolean;
	};
};

type Session = NextAuthSession | KeyStoneSession;

const isFromNextAuth = (session: Session) => {
	return (session as NextAuthSession)?.user?.id !== undefined;
};

const getUserFromNextAuth = async (
	ctx: KeystoneContext<TypeInfo>,
	session: Session,
) => {
	const id = (session as NextAuthSession).user?.id;

	const user = await ctx.sudo().db.User.findOne({
		where: { id },
	});
	return user;
};
const hasSession = async ({
	session,
	context,
	// listKey,
	// operation,
}: {
	session?: Session;
	context: KeystoneContext<TypeInfo>;
	listKey: string;
	operation: string;
}) => {
	if (!session) {
		// console.log(`[keystone][${operation}][${listKey}]: -----no session-----`);
		return false;
	}
	// console.log(`[keystone][${operation}][${listKey}]: start...`, session);
	if (isFromNextAuth(session)) {
		const user = await getUserFromNextAuth(context, session);
		console.log("[keystone][from next.js][query]", JSON.stringify(user));
	}
	// console.log(`[keystone][${operation}][${listKey}]: end...`);
	return true;
};

const isAdmin = ({ session }: { session?: Session }) =>
	Boolean((session as KeyStoneSession)?.data?.isAdmin);

export const lists = {
	User: list({
		access: {
			operation: {
				// hint: unconditionally returning `true` is equivalent to using allowAll for this operation
				query: hasSession,
				create: isAdmin,
				update: isAdmin,
				delete: isAdmin,
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
	PushSubscription: list({
		access: allowAll,
		fields: {
			endpoint: text({ validation: { isRequired: true }, isIndexed: "unique" }),
			expirationTime: timestamp({ validation: { isRequired: false } }),
			keys: json({
				defaultValue: {
					p256dh: "",
					auth: "",
				},
			}),
			user: relationship({ ref: "User", many: false }),
			createdAt: timestamp({ defaultValue: { kind: "now" } }),
			lastUsed: timestamp({ defaultValue: { kind: "now" } }),
			// Device information fields
			userAgent: text({ validation: { isRequired: false } }),
			deviceType: text({ validation: { isRequired: false } }),
			os: text({ validation: { isRequired: false } }),
			browser: text({ validation: { isRequired: false } }),
		},
	}),
	Topik: list({
		access: allowAll,
		fields: {
			// 届次
			no: integer({ validation: { isRequired: true }, label: "届次" }),
			year: integer({ validation: { isRequired: true }, label: "年份" }),
			level: select({
				type: "enum",
				options: [
					{ label: "TOPIK I", value: "TOPIK_I" },
					{ label: "TOPIK II", value: "TOPIK_II" },
				],
				validation: { isRequired: true },
				label: "级别",
			}),
			// 属于某个大题
			parentId: relationship({
				ref: "Topik.childrenId",
				many: false,
				label: "父大题",
			}),
			// 其他小题
			childrenId: relationship({
				ref: "Topik.parentId",
				many: true,
				label: "子小题",
			}),
			questionNumber: integer({
				validation: { isRequired: true },
				label: "题号",
			}),
			questionType: select({
				type: "enum",
				options: [
					{ label: "听力", value: "LISTENING" },
					{ label: "阅读", value: "READING" },
					{ label: "写作", value: "WRITING" },
				],
				validation: { isRequired: true },
				label: "题型",
			}),
			score: integer({
				validation: { isRequired: true },
				label: "分数",
				defaultValue: 0,
			}),
			audioURL: text({ label: "听力音频" }),
			questionStem: text({ label: "题干" }),
			questionContent: text({
				validation: {},
				label: "题目",
			}),
			options: json({
				label: "选项",
				defaultValue: [
					{
						content: "",
						isCorrect: true,
					},
					{
						content: "",
					},
					{
						content: "",
					},
					{
						content: "",
					},
				],
			}),
			explanation: text({ label: "解析" }),
			createdAt: timestamp({ defaultValue: { kind: "now" } }),
		},
	}),
	Dict: list({
		access: allowAll,
		fields: {
			name: text({ validation: { isRequired: true } }),
			public: checkbox({ defaultValue: false }),
			intlKey: text({ validation: { isRequired: false } }),
			createdAt: timestamp({ defaultValue: { kind: "now" } }),
			createdBy: relationship({ ref: "User", many: false }),
			list: relationship({ ref: "DictItem.dict", many: true }),
			poster: text({ validation: { isRequired: false } }),
			favorites: relationship({ ref: "DictItemFavorite.dict", many: true }),
		},
	}),
	DictItem: list({
		access: allowAll,
		fields: {
			name: text({ validation: { isRequired: true } }),
			trans: json({
				label: "翻译",
				defaultValue: {
					en: [""],
					"zh-CN": [""],
					"zh-TW": [""],
					ja: [""],
				},
			}),
			example: text({ label: "例句" }),
			exTrans: json({
				label: "例句翻译",
				defaultValue: {
					en: [""],
					"zh-CN": [""],
					"zh-TW": [""],
					ja: [""],
				},
			}),
			createdAt: timestamp({ defaultValue: { kind: "now" } }),
			createdBy: relationship({ ref: "User", many: false }),
			dict: relationship({ ref: "Dict.list", many: true }),
			favoriteIn: relationship({ ref: "DictItemFavorite.item", many: true }),
		},
	}),
	DictItemFavorite: list({
		access: allowAll,
		fields: {
			dict: relationship({ ref: "Dict.favorites", many: false }),
			item: relationship({ ref: "DictItem.favoriteIn", many: false }),
			favoritedAt: timestamp({ defaultValue: { kind: "now" } }),
		},
		hooks: {},
	}),
	Article: list({
		access: allowAll,
		fields: {
			title: text({ validation: { isRequired: true }, label: "标题" }),
			type: select({
				type: "enum",
				options: [
					{ label: "影视台词", value: "MOVIE" },
					{ label: "文本", value: "TEXT" },
					{ label: "电子书", value: "EPUB" },
				],
				validation: { isRequired: true },
				label: "类型",
			}),
			poster: text({ validation: { isRequired: false } }),
			description: text({ validation: { isRequired: false } }),
			subtitles: json({
				label: "字幕",
				defaultValue: [
					{
						title: "MOVIE S01E01",
						subtitles: {
							ko: {
								label: "Korean",
								filename: "",
							},
							"zh-Hans": {
								label: "Chinese",
								filename: "",
							},
							en: {
								label: "English",
								filename: "",
							},
							ja: {
								label: "Japanese",
								filename: "",
							},
						},
					},
				],
			}),
			content: text({ validation: { isRequired: false } }),
			createdAt: timestamp({ defaultValue: { kind: "now" } }),
			createdBy: relationship({ ref: "User", many: false }),
		},
	}),
	Annotation: list({
		access: allowAll,
		fields: {
			type: select({
				type: "enum",
				options: [
					{ label: "笔记", value: "NOTE" },
					{ label: "高亮", value: "HIGHLIGHT" },
				],
				validation: { isRequired: true },
				label: "类型",
			}),
			bookId: relationship({ ref: "Article", many: false }),
			chapterId: text({ validation: { isRequired: true } }),
			text: text({ validation: { isRequired: true } }),
			content: text({ validation: { isRequired: false } }),
			color: text({ validation: { isRequired: false } }),
			createdAt: timestamp({ defaultValue: { kind: "now" } }),
			createdBy: relationship({ ref: "User", many: false }),
			updatedAt: timestamp({
				defaultValue: { kind: "now" },
				db: { updatedAt: true },
			}),
			range: json({
				label: "笔记范围",
				defaultValue: {
					start: {
						paragraphIndex: 0,
						offset: 0,
					},
					end: {
						paragraphIndex: 0,
						offset: 0,
					},
				},
			}),
		},
	}),
} satisfies Lists;
