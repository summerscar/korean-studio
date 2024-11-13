"use client";

import { useUser } from "@/hooks/use-user";
import { usePrevious } from "ahooks";
import type { Session } from "next-auth";
import { signIn } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const CheckClientSession = ({
	serverSession,
}: { serverSession: Session | null }) => {
	const { isLogin } = useUser();
	const prevIsLogin = usePrevious(isLogin);
	const pathName = usePathname();

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (!isLogin && prevIsLogin && serverSession) {
			signIn();
		}
	}, [pathName, isLogin, serverSession, prevIsLogin]);
	return null;
};

export { CheckClientSession };
