import { keystoneContext } from "@/../keystone/context";
import { createFavListAction } from "@/actions/user-dict-action";
import { authenticateUserWithPassword } from "@/utils/db";
import { signInSchema } from "@/utils/zod";
import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
class InvalidLoginError extends CredentialsSignin {
	code = "Invalid identifier or password";
}

console.log("[next-auth][NEXTAUTH_URL]", process.env.NEXTAUTH_URL);

export const { handlers, signIn, signOut, auth } = NextAuth({
	session: {
		maxAge: 60 * 60 * 24 * 30,
	},
	providers: [
		GitHub,
		Google,
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
		async signIn({ user, account }) {
			if (["github", "google"].includes(account?.provider || "")) {
				// console.log("[signIn][oauth][user]");
				const sudoContext = keystoneContext.sudo();
				const targetUser = await sudoContext.db.User.findOne({
					where: { email: user.email },
				});
				if (!targetUser) {
					const res = await sudoContext.db.User.createOne({
						data: {
							name: user.name,
							email: user.email,
						},
					});
					// 创建用户默认创建 favList
					await createFavListAction(user.name!, res.id);
					console.log("[signIn][oauth][createdUser]:", `[${user.email}]`);
				}
			}
			return true;
		},
		async jwt({ token, user }) {
			// console.log("[jwt][user]", JSON.stringify(user));
			// console.log("[jwt][token]", JSON.stringify(token));
			// console.log("[jwt][profile]", JSON.stringify(profile));

			const sudoContext = keystoneContext.sudo();
			// OAuth 登录后首次生成 JWT 时

			const targetUser = await sudoContext.db.User.findOne({
				where: { email: user?.email || token?.email },
			});
			if (!targetUser) {
				throw new InvalidLoginError();
			}
			token.isAdmin = targetUser.isAdmin;
			token.id = targetUser.id;
			token.name = targetUser.name;
			token.email = targetUser.email;

			return token;
		},
		session({ session, token }) {
			// console.log("[session][session]", JSON.stringify(session));
			// console.log("[session][token]", JSON.stringify(token));
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			(session.user as any).isAdmin = token.isAdmin as boolean;
			session.user.id = token.id as string;
			session.user.name = token.name;
			session.user.email = token.email as string;
			return session;
		},
	},
	pages: {
		error: "/error",
	},
});
