"use server";
import Base64 from "crypto-js/enc-base64";
import HmacMD5 from "crypto-js/hmac-md5";

const url = "https://papago.naver.com/apis/n2mt/translate";

export const papagoTranslateAction = async (
	text: string,
	locale = "zh-CN",
): Promise<TranslateResult> => {
	const deviceId = uuid();
	const body = {
		deviceId,
		locale,
		dict: true,
		dictDisplay: 30,
		honorific: false,
		instant: false,
		paging: false,
		source: "ko",
		target: locale,
		text,
		usageAgreed: false,
	};
	const headers = {
		Accept: "application/json",
		"Accept-Language": "zh-CN",
		"device-type": "pc",
		"x-apigw-partnerid": "papago",
		"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
		"User-Agent":
			"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
		Referer: "https://papago.naver.com/",
		Origin: "https://papago.naver.com",
		...authorization(url, deviceId),
	};

	const response = await fetch(url, {
		method: "POST",
		headers: headers,
		// @ts-ignore
		body: new URLSearchParams(body),
		mode: "no-cors",
	});
	if (response.status !== 200) {
		throw new Error((await response.text()) || response.statusText);
	}
	const result = await response.json();
	result.text = text;
	return result;
};

function uuid() {
	let e = new Date().getTime();
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (a) => {
		const t = ((e + 16 * Math.random()) % 16) | 0;
		// biome-ignore lint/style/noCommaOperator: <explanation>
		return (e = Math.floor(e / 16)), ("x" === a ? t : (3 & t) | 8).toString(16);
	});
}

function authorization(url: string, uuid: string) {
	const t = uuid;
	const n = new Date().getTime();
	return {
		Authorization: `PPG ${t}:${HmacMD5(
			`${t}\n${url.split("?")[0]}\n${n}`,
			"v1.8.11_52b4eb3fe0",
		).toString(Base64)}`,
		Timestamp: n.toString(),
	};
}

interface Meaning {
	meaning: string;
	examples: Example[];
	originalMeaning: string;
}

interface Po {
	type: string | null;
	meanings: Meaning[];
}

interface Example {
	text: string;
	translatedText: string;
}

interface Dict {
	items?: Item[];
	examples: Example[];
	isWordType: boolean;
}

interface PhoneticSign {
	type: null;
	sign: string;
}

interface Item {
	entry: string;
	subEntry?: string | null;
	matchType: string;
	hanjaEntry: string | null;
	phoneticSigns: PhoneticSign[];
	pos: Po[];
	source: string;
	url: string;
	mUrl: string;
	expDicTypeForm: string;
	locale: string;
	gdid: string;
	expEntrySuperscript: string;
}

interface TarDict {
	items: Item[];
	examples: Example[];
	isWordType: boolean;
}

interface Message {
	tlitResult: TlitResult[];
}

interface TlitSrc {
	message: Message;
}

interface TlitResult {
	token: string;
	phoneme: string;
}

interface Tlit {
	message: Message;
}

interface Nbest {
	lang: string;
	prob: number;
}

interface LangDetection {
	nbests: Nbest[];
}

export interface TranslateResult {
	text: string;
	dict: Dict;
	tarDict: TarDict;
	delay: number;
	delaySmt: number;
	srcLangType: string;
	tarLangType: string;
	translatedText: string;
	engineType: string;
	tlitSrc: TlitSrc;
	tlit: Tlit;
	langDetection: LangDetection;
}
