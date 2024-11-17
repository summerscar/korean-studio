"use client";

import { useCallback, useEffect } from "react";

const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

export function useWebPush() {
	const subscribeUserToPush = useCallback(
		async (registration: ServiceWorkerRegistration) => {
			try {
				// 检查现有订阅
				const existingSubscription =
					await registration.pushManager.getSubscription();

				// 如果已经有有效的订阅，直接使用
				if (existingSubscription) {
					// 发送订阅信息到服务器（服务器会处理重复订阅）
					await fetch("/api/push/subscribe", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify(existingSubscription),
					});
					return existingSubscription;
				}

				// 如果没有订阅，创建新的订阅
				const subscription = await registration.pushManager.subscribe({
					userVisibleOnly: true,
					applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
				});

				// 发送订阅信息到服务器
				await fetch("/api/push/subscribe", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(subscription),
				});

				return subscription;
			} catch (error) {
				console.error("Failed to subscribe to push:", error);
				throw error;
			}
		},
		[],
	);

	const registerServiceWorker = useCallback(async () => {
		try {
			const registration = await navigator.serviceWorker.register("/sw.js");
			return registration;
		} catch (error) {
			console.error("Service Worker registration failed:", error);
			throw error;
		}
	}, []);

	useEffect(() => {
		if ("serviceWorker" in navigator) {
			registerServiceWorker();
		}
	}, [registerServiceWorker]);

	const subscribe = useCallback(async () => {
		if (!("serviceWorker" in navigator)) {
			throw new Error("Service Worker not supported");
		}

		try {
			const registration = await navigator.serviceWorker.ready;
			const subscription = await subscribeUserToPush(registration);
			return subscription;
		} catch (error) {
			console.error("Failed to subscribe:", error);
			throw error;
		}
	}, [subscribeUserToPush]);

	return {
		subscribe,
		registerServiceWorker,
	};
}

// 辅助函数：将 base64 字符串转换为 Uint8Array
function urlBase64ToUint8Array(base64String: string) {
	const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding)
		.replace(/\-/g, "+")
		.replace(/_/g, "/");

	const rawData = window.atob(base64);
	const outputArray = new Uint8Array(rawData.length);

	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
}
