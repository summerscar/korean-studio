"use server";

import { SignJWT } from "jose";

const getSecret = () => {
	const secret = process.env.MASTRA_JWT_SECRET;
	if (!secret) {
		throw new Error("MASTRA_JWT_SECRET is not configured");
	}
	return new TextEncoder().encode(secret);
};

export const getMastraTokenAction = async () => {
	const token = await new SignJWT({})
		.setProtectedHeader({ alg: "HS256" })
		.setIssuedAt()
		.setExpirationTime("5m")
		.sign(getSecret());

	return token;
};
