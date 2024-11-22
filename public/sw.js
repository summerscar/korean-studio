// 创建广播频道
const broadcastChannel = new BroadcastChannel("push-notifications");

self.addEventListener("push", (event) => {
	const options = event.data.json();
	// 广播通知数据到所有打开的窗口
	broadcastChannel.postMessage({
		type: "PUSH_RECEIVED",
		payload: options,
	});
	if (!options?.data?.notification) return;
	event.waitUntil(
		self.registration.showNotification(options.title, {
			body: options.body,
			icon: options.icon || "/icon",
			badge: options.badge || "/icon",
			data: options.data,
			...options,
		}),
	);
});

self.addEventListener("notificationclick", (event) => {
	event.notification.close();
	const data = event.notification.data;

	// 广播通知点击事件
	broadcastChannel.postMessage({
		type: "NOTIFICATION_CLICKED",
		payload: data,
	});

	event.waitUntil(
		clients.matchAll({ type: "window" }).then((clientList) => {
			if (data?.url) {
				return clients.openWindow(data.url);
			}
			if (clientList.length > 0) {
				return clientList[0].focus();
			}
			return clients.openWindow("/");
		}),
	);
});
