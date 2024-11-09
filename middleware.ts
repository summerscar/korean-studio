/** https://nextjs.org/docs/app/building-your-application/routing/middleware#cors */
import { type NextRequest, NextResponse } from "next/server";

const allowedOrigins = ["https://papago.naver.com"];

const corsOptions = {
	"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export function middleware(request: NextRequest) {
	// Check the origin from the request
	const origin = request.headers.get("origin") ?? "";
	const isAllowedOrigin = allowedOrigins.includes(origin);

	console.log(
		"[middleware] [origin]:",
		request.headers.get("origin"),
		"[method]:",
		request.method,
		"[isAllowedOrigin]",
		isAllowedOrigin,
	);

	// Handle preflighted requests
	const isPreflight = request.method === "OPTIONS";

	if (isPreflight) {
		const preflightHeaders = {
			...(isAllowedOrigin && {
				"Access-Control-Allow-Origin": origin,
				"Access-Control-Allow-Private-Network": "true",
			}),
			...corsOptions,
		};
		return NextResponse.json({}, { headers: preflightHeaders });
	}

	// Handle simple requests
	const response = NextResponse.next();

	if (isAllowedOrigin) {
		response.headers.set("Access-Control-Allow-Origin", origin);
	}

	Object.entries(corsOptions).forEach(([key, value]) => {
		response.headers.set(key, value);
	});

	return response;
}

export const config = {
	matcher: "/api/:path*",
};