import type { Session } from "next-auth";
import { useSession } from "next-auth/react";

const useUser = () => {
	const session = useSession();
	return {
		isAdmin: isAdminBySession(session.data),
		isLogin: session.status === "authenticated",
		user: session.data?.user,
		session: session.data,
		update: session.update,
	};
};

const isAdminBySession = (session: Session | null) =>
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	(session?.user as any)?.isAdmin;

export { useUser, isAdminBySession };
