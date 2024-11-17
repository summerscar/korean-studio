import { refreshDictAction } from "@/actions/user-dict-action";
import { usePushNotificationEvents } from "@/hooks/use-push-notification-events";
import { createToast } from "@/hooks/use-toast";
import { useMemoizedFn } from "ahooks";
import { useTranslations } from "next-intl";

const useNewNotification = (dictId: string) => {
	const tHome = useTranslations("Home");
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const refreshCurrentDict = useMemoizedFn(async (payload: any) => {
		console.log("[useNewNotification]:", payload);
		if (payload.data.dictId === dictId) {
			createToast({ type: "info", message: tHome("newWordDetected") });
			await refreshDictAction(dictId);
		}
	});

	usePushNotificationEvents(refreshCurrentDict);
};

export { useNewNotification };
