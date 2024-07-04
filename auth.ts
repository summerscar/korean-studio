import { authenticateUserWithPassword } from "@/utils/api";
import { signInSchema } from "@/utils/zod";
import { keystoneContext } from "keystone/context";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
	session: {
		maxAge: 60 * 60 * 24 * 30,
	},
	providers: [
		Credentials({
			// You can specify which fields should be submitted, by adding keys to the `credentials` object.
			// e.g. domain, username, password, 2FA token, etc.
			credentials: {
				email: {},
				password: {},
			},
			authorize: async (credentials) => {
				const { email, password } = await signInSchema.parseAsync(credentials);
				let user = null;
				try {
					user = await authenticateUserWithPassword(email, password);
				} catch (error) {
					error instanceof Error &&
						console.error(
							"[error] [authenticateUserWithPassword]:",
							error.message,
						);
				}

				console.log(
					"[success] [authenticateUserWithPassword]:",
					JSON.stringify(user),
				);

				if (!user) {
					// No user found, so this is their first attempt to login
					// meaning this is also the place you could do registration
					// throw new Error("Login failed.");
				}

				// return user object with the their profile data
				return user;
			},
		}),
	],
	callbacks: {},
});
