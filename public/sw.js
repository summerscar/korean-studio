self.addEventListener("push", (event) => {
	const options = event.data.json();
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
