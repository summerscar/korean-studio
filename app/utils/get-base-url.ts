export const getBaseURL = () => {
	// Client
	if (typeof window !== "undefined") {
		// This will always be accurate
		return window.location.origin;
	}

	if (process.env.NEXT_PUBLIC_VERCEL_ENV === "production")
		return `${process.env.NEXTAUTH_URL}`;
	if (process.env.NEXT_PUBLIC_VERCEL_ENV === "preview")
		return `${process.env.NEXTAUTH_URL}`;
	return "http://localhost:3000";
};
