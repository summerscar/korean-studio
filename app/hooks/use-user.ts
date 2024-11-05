import { useSession } from "next-auth/react";

const useUser = () => {
	const session = useSession();

	return {
		isLogin: session.status === "authenticated",
		user: session.data?.user,
		session: session,
		update: session.update,
	};
};

export { useUser };
