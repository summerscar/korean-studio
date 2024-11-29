"use server";
import { KSwithSession } from "@/../keystone/context";
import { DEFAULT_COOKIE_CONFIG } from "@/utils/config";
import { auth } from "auth";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import type { TopikLevelType, TopikUpdateInput } from ".keystone/types";

const TopikTestStatusKey = "topik-test-status";

const TestTimeout = 2 * 60 * 60 * 1000;

const startTestAction = async (level: TopikLevelType, no: string) => {
	// TODO: if login, save to user profile
	const cookie = await cookies();
	const status = JSON.parse(
		cookie.get(TopikTestStatusKey)?.value || JSON.stringify({}),
	);
	status[`${level}-${no}`] = new Date().getTime();
	cookie.set(TopikTestStatusKey, JSON.stringify(status), DEFAULT_COOKIE_CONFIG);
};

const cancelTestAction = async (level: TopikLevelType, no: string) => {
	// TODO: if login, save to user profile
	const cookie = await cookies();
	const status = JSON.parse(
		cookie.get(TopikTestStatusKey)?.value || JSON.stringify({}),
	);
	delete status[`${level}-${no}`];
	cookie.set(TopikTestStatusKey, JSON.stringify(status), DEFAULT_COOKIE_CONFIG);
};

const isTestStart = async (level: TopikLevelType, no: string) => {
	const cookie = await cookies();
	const status = JSON.parse(
		cookie.get(TopikTestStatusKey)?.value || JSON.stringify({}),
	);
	const testStatus = status[`${level}-${no}`];

	if (testStatus && testStatus > new Date().getTime() - TestTimeout) {
		return {
			isStart: true,
			timeLeft: TestTimeout - (new Date().getTime() - testStatus),
		};
	}
	return { isStart: false, timeLeft: 0 };
};

const updateTopikItemAction = async (
	refreshKey: string,
	id: string,
	data: TopikUpdateInput,
) => {
	const session = await auth();
	const ctx = KSwithSession(session);
	await ctx.db.Topik.updateOne({
		where: { id },
		data,
	});
	revalidateTag(refreshKey);
};

export {
	startTestAction,
	cancelTestAction,
	isTestStart,
	updateTopikItemAction,
};
