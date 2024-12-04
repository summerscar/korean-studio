import type { HomeSetting } from "@/types";
import { HOME_SETTING_KEY } from "@/utils/config";
import { useMount } from "ahooks";
import { useState } from "react";

const useHomeSetting = () => {
	const [setting, setSetting] = useState<HomeSetting>({
		autoVoice: false,
		showMeaning: true,
		enableAudio: true,
		additionalMeaning: false,
	});
	useMount(() => {
		const settingStr = localStorage.getItem(HOME_SETTING_KEY);
		if (settingStr) {
			const newSetting = JSON.parse(settingStr);
			setSetting(newSetting);
		}
	});

	const onSettingChange = (newVal: Partial<typeof setting>) => {
		setSetting((val) => {
			const newSetting = { ...val, ...newVal };
			localStorage.setItem(HOME_SETTING_KEY, JSON.stringify(newSetting));
			return newSetting;
		});
	};
	return {
		setting,
		onSettingChange,
		setSetting,
	};
};

export { useHomeSetting };
