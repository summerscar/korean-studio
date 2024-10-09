"use server";
import { DEFAULT_COOKIE_CONFIG } from "@/utils/config";
import { cookies } from "next/headers";
import type { TopikLevelType } from ".keystone/types";

const TopikTestStatusKey = "topik-test-status";

const TestTimeout = 2 * 60 * 60 * 1000;

const startTestAction = async (level: TopikLevelType, no: string) => {
	// TODO: if login, save to user profile
	const cookie = cookies();
	const status = JSON.parse(
		cookie.get(TopikTestStatusKey)?.value || JSON.stringify({}),
	);
	status[`${level}-${no}`] = new Date().getTime();
	cookie.set(TopikTestStatusKey, JSON.stringify(status), DEFAULT_COOKIE_CONFIG);
};

const cancelTestAction = async (level: TopikLevelType, no: string) => {
	// TODO: if login, save to user profile
	const cookie = cookies();
	const status = JSON.parse(
		cookie.get(TopikTestStatusKey)?.value || JSON.stringify({}),
	);
	delete status[`${level}-${no}`];
	cookie.set(TopikTestStatusKey, JSON.stringify(status), DEFAULT_COOKIE_CONFIG);
};

const isTestStart = async (level: TopikLevelType, no: string) => {
	const cookie = cookies();
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

export { startTestAction, cancelTestAction, isTestStart };