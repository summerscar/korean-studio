import { getContext } from "@keystone-6/core/context";
import type { Session } from "next-auth";
import config from "../keystone";
import type { Context } from ".keystone/types";
import * as PrismaModule from ".prisma/client";

// Making sure multiple prisma clients are not created during hot reloading
export const keystoneContext: Context =
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	(globalThis as any).keystoneContext || getContext(config, PrismaModule);

export const KSwithSession = (session: Session | null) =>
	keystoneContext.withSession(session);

if (process.env.NODE_ENV !== "production")
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	(globalThis as any).keystoneContext = keystoneContext;
