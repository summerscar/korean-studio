import { authenticateUserWithPassword } from "@/utils/api";
import { getKeystoneContext } from "@/utils/db";
import { signInSchema } from "@/utils/zod";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
	providers: [
		Credentials({
			// You can specify which fields should be submitted, by adding keys to the `credentials` object.
			// e.g. domain, username, password, 2FA token, etc.
			credentials: {
				email: {},
				password: {},
			},
			authorize: async (credentials) => {
				console.log("credentials", credentials);
				const { email, password } = await signInSchema.parseAsync(credentials);

				let user = null;
				try {
					user = (await authenticateUserWithPassword(email, password)) as any;
				} catch (error) {
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
					throw new Error("User not found.");
				}

				// return user object with the their profile data
				return user;
			},
		}),
	],
});
