import { authenticateUserWithPassword } from "@/utils/api";
import { signInSchema } from "@/utils/zod";
import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";

class InvalidLoginError extends CredentialsSignin {
	code = "Invalid identifier or password";
}

export const { handlers, signIn, signOut, auth } = NextAuth({
	session: {
		maxAge: 60 * 60 * 24 * 30,
	},
	providers: [
		Credentials({
			// You can specify which fields should be submitted, by adding keys to the `credentials` object.
			// e.g. domain, username, password, 2FA token, etc.
			credentials: {
				email: {
					label: "Email",
					type: "email",
				},
				password: {
					label: "Password",
					type: "password",
				},
			},
			authorize: async (credentials) => {
				const { email, password } = await signInSchema.parseAsync(credentials);
				let user = null;
				try {
					user = await authenticateUserWithPassword(email, password);

					console.log(
						"[success] [authenticateUserWithPassword]:",
						JSON.stringify(user),
					);
				} catch (error) {
					error instanceof Error &&
						console.error(
							"[error] [authenticateUserWithPassword]:",
							error.message,
						);
				}

				if (!user) {
					// No user found, so this is their first attempt to login
					// meaning this is also the place you could do registration
					throw new InvalidLoginError();
				}

				// return user object with the their profile data
				return user;
			},
		}),
	],
	callbacks: {
		signIn(props) {
			console.log("[signIn]", JSON.stringify(props));
			return true;
		},
		jwt({ token, user }) {
			// console.log("[jwt][user]", JSON.stringify(user));
			// console.log("[jwt][token]", JSON.stringify(token));
			if (user) {
				token.id = user.id;
			}
			return token;
		},
		session({ session, token }) {
			// console.log("[session][session]", JSON.stringify(session));
			// console.log("[session][token]", JSON.stringify(token));
			session.user.id = token.id as string;
			return session;
		},
	},
});
