"use client";

import { useNotifications } from "@/hooks/use-notifications";
import { useUser } from "@/hooks/use-user";
import { useEffect } from "react";

export function NotificationProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const { permission, requestPermission } = useNotifications();
	const { isLogin } = useUser();
	useEffect(() => {
		// 如果用户还没有设置通知权限，请求权限
		if (permission === "default" && isLogin) {
			requestPermission();
		}
	}, [permission, requestPermission, isLogin]);

	return <>{children}</>;
}
