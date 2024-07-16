const isServer = typeof window === "undefined";
const getIsServer = () => typeof window === "undefined";
export { isServer, getIsServer };
