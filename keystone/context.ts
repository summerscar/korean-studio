import { getContext } from "@keystone-6/core/context";
import type { Session } from "next-auth";
import config from "../keystone";
import type { Context } from ".keystone/types";
import * as PrismaModule from ".prisma/client";

// Making sure multiple prisma clients are not created during hot reloading
export const keystoneContext: Context =
	globalThis.keystoneContext || getContext(config, PrismaModule);

export const KSwithSession = (session: Session | null) =>
	keystoneContext.withSession(session);

if (process.env.NODE_ENV !== "production")
	globalThis.keystoneContext = keystoneContext;

export function getPrismaClient(): Context["prisma"] {
	if (process.env.NODE_ENV === "production") {
		// 在生产环境中，确保正确初始化 Prisma 客户端
		const context = getContext(config, PrismaModule);
		return context.prisma;
	}
	// 在开发环境中，使用已存在的 context
	return keystoneContext.prisma;
}
