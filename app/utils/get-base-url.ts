export const getBaseURL = () => {
	// Client
	if (typeof window !== "undefined") {
		// This will always be accurate
		return window.location.origin;
	}

	if (process.env.NEXT_PUBLIC_VERCEL_ENV === "production")
		return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
	if (process.env.NEXT_PUBLIC_VERCEL_ENV === "preview")
		return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
	return "http://localhost:3000";
};
