// ==UserScript==
// @name         Create word from papago
// @namespace    http://tampermonkey.net/
// @version      2024-11-09
// @description  Papago 查词结果快速创建单词到指定词单
// @author       summerscar
// @match        https://papago.naver.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=naver.com
// @require https://openuserjs.org/src/libs/sizzle/GM_config.js
// @grant              GM_getValue
// @grant              GM_setValue
// @grant              GM.getValue
// @grant              GM.setValue
// ==/UserScript==

const settings = {
	SERVER: {
		description: "Server",
		type: "text",
		defaultValue: "https://korean.app.summerscar.me",
	},
	dictId: {
		description: "Dict ID",
		type: "text",
		defaultValue: "",
	},
	userId: {
		description: "User ID",
		type: "text",
		defaultValue: "",
	},
	notification: {
		description: "Notification",
		type: "checkbox",
		defaultValue: true,
	},
};

const initConfig = () => {
	const config = {
		id: "create-word-from-papago",
		title: "Create word from papago",
		fields: Object.keys(settings)
			.map((key) => ({
				label: settings[key].description,
				id: key,
				type: settings[key].type,
				default: settings[key].defaultValue,
			}))
			.reduce((prev, cur) => Object.assign(prev, { [cur.id]: cur }), {}),
		events: {
			save() {
				this.close();
			},
		},
	};
	GM_config.init(config);
};

initConfig();

const getWord = (target) => {
	return target.parentElement.children[0].children[0].textContent;
};

const style = {
	background: "none",
	fontSize: "1rem",
};

(() => {
	const observer = new MutationObserver(() => {
		const elements = document.querySelectorAll(
			"dt[class^=dictionary_keyword___]:not(:has(button[class*=add-button]))",
		);

		// ----------------------------------
		const addButton = document.createElement("button");
		Object.assign(addButton.style, style);
		addButton.classList.add("add-button");
		addButton.textContent = "➕";
		addButton.addEventListener("click", async (e) => {
			const SERVER = GM_config.get("SERVER");
			const dictId = GM_config.get("dictId");
			const userId = GM_config.get("userId");
			const notification = GM_config.get("notification");

			if (!SERVER || !dictId || !userId) {
				GM_config.open();
				return;
			}
			const text = getWord(e.target);
			toast("Word creating", "info");
			e.target.textContent = "⏳";
			e.target.disabled = true;
			try {
				const res = await fetch(`${SERVER}/api/dict-items/create`, {
					method: "POST",
					body: JSON.stringify({ dictId, words: [text], userId, notification }),
				});
				if (res.status !== 200) {
					throw new Error((await res.text()) || res.statusText);
				}
				e.target.textContent = "✅";
				toast("Word created", "success");
			} catch (error) {
				e.target.textContent = "❌";
				toast(error.message, "error");
				console.error("[dict-items/create][error]:", error);
			} finally {
				setTimeout(() => {
					e.target.disabled = false;
					e.target.textContent = "➕";
				}, 2000);
			}
		});
		const copyButton = document.createElement("button");
		Object.assign(copyButton.style, style);
		copyButton.classList.add("copy-button");
		copyButton.textContent = "📋";
		copyButton.addEventListener("click", (e) => {
			const text = getWord(e.target);
			console.log("Current text:", text);
			navigator.clipboard.writeText(text);
			e.target.textContent = "✅";
			toast("Copied", "info");
			setTimeout(() => {
				e.target.textContent = "📋";
			}, 2000);
		});

		const settingButton = document.createElement("button");
		Object.assign(settingButton.style, style);
		settingButton.classList.add("setting-button");
		settingButton.textContent = "⚙️";
		settingButton.addEventListener("click", () => {
			GM_config.open();
		});
		// ----------------------------------

		elements.forEach((element) => {
			element.appendChild(addButton);
			element.appendChild(copyButton);
			element.appendChild(settingButton);
		});
	});
	observer.observe(document.body, {
		childList: true,
		subtree: true,
	});
})();

const toast = (message, type = "info") => {
	const toast = document.createElement("div");
	Object.assign(toast.style, {
		position: "fixed",
		bottom: "50px",
		left: "50%",
		transform: "translate(-120%, -50%)",
		padding: "1rem",
		borderRadius: "0.25rem",
		boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)",
		zIndex: "9999",
		backgroundColor:
			type === "success"
				? "green"
				: type === "error"
					? "red"
					: type === "info"
						? "white"
						: "orange",
		color: type === "info" ? "black" : "white",
	});
	toast.textContent = message;
	document.body.appendChild(toast);
	setTimeout(() => {
		toast.remove();
	}, 3000);
};
