const isDev =
	process.env.NODE_ENV !== "production" || !!process.env.NEXT_PUBLIC_DEBUG;
const isProd = process.env.NODE_ENV === "production";
export { isDev, isProd };
