const siteInfoAction = async () => {
	return {
		AI: process.env.AI,
		AI_MODEL: process.env.GPT_MODEL,
		COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA,
	};
};

export { siteInfoAction };
