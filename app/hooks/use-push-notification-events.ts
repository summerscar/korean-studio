import { useEffect } from "react";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type NotificationEventCallback = (payload: any) => void;

export function usePushNotificationEvents(
	onPushReceived?: NotificationEventCallback,
	onNotificationClicked?: NotificationEventCallback,
) {
	useEffect(() => {
		const broadcastChannel = new BroadcastChannel("push-notifications");

		const handleMessage = (event: MessageEvent) => {
			const { type, payload } = event.data;

			switch (type) {
				case "PUSH_RECEIVED":
					onPushReceived?.(payload);
					break;
				case "NOTIFICATION_CLICKED":
					onNotificationClicked?.(payload);
					break;
			}
		};

		broadcastChannel.addEventListener("message", handleMessage);

		return () => {
			broadcastChannel.removeEventListener("message", handleMessage);
			broadcastChannel.close();
		};
	}, [onPushReceived, onNotificationClicked]);
}
