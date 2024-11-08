const isDev = process.env.NODE_ENV !== "production" || !!process.env.DEBUG;
const isProd = process.env.NODE_ENV === "production";
export { isDev, isProd };
