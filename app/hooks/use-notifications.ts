"use client";

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useWebPush } from "./use-web-push";

export function useNotifications() {
	const [permission, setPermission] =
		useState<NotificationPermission>("default");
	const { subscribe } = useWebPush();
	const { status, data: session } = useSession();
	const lastSubscriptionTime = useRef<number>(0);
	const subscriptionPromise = useRef<ReturnType<typeof subscribe> | null>(null);

	useEffect(() => {
		// 检查通知权限
		if ("Notification" in window) {
			setPermission(Notification.permission);
		}
	}, []);

	const handleSubscription = useCallback(async () => {
		const now = Date.now();
		// 如果距离上次订阅不到1小时，跳过
		if (now - lastSubscriptionTime.current < 60 * 60 * 1000) {
			return;
		}

		try {
			// 如果已经有一个订阅请求在进行中，直接返回该Promise
			if (subscriptionPromise.current) {
				return subscriptionPromise.current;
			}

			// 创建新的订阅请求
			subscriptionPromise.current = subscribe();
			const result = await subscriptionPromise.current;
			lastSubscriptionTime.current = now;
			return result;
		} catch (error) {
			console.error("Failed to subscribe:", error);
		} finally {
			// 清除订阅Promise引用
			subscriptionPromise.current = null;
		}
	}, [subscribe]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		// 当用户登录且已经授予通知权限时，更新订阅
		if (status === "authenticated" && permission === "granted") {
			handleSubscription();
		}
	}, [status, permission, session?.user?.email]);

	const requestPermission = async () => {
		if (!("Notification" in window)) {
			console.error("This browser does not support notifications");
			return;
		}

		try {
			const permission = await Notification.requestPermission();
			setPermission(permission);

			if (permission === "granted") {
				// 订阅推送服务
				await handleSubscription();
			}
		} catch (error) {
			console.error("Error requesting notification permission:", error);
		}
	};

	return {
		permission,
		requestPermission,
	};
}
