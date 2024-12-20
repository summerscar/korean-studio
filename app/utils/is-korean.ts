const isKorean = (text: string) => {
	/**
		\uAC00-\uD7AF：韩文音节块（完整的韩文字符）
		包含了大部分常用的韩文字符
		例如：가, 나, 다, 라 等
		\u1100-\u11FF：韩文字母（谚文字母）
		包含韩文的基本字母（자음 辅音和 모음 元音）
		例如：ㄱ, ㄴ, ㄷ, ㅏ, ㅑ 等
		\u3130-\u318F：韩文兼容字母
		另一种表示韩文字母的 Unicode 范围
		提供了额外的字母表示方式
		\u3000-\u303F：标点符号和空格
		包含了一些东亚标点符号
		\uFF00-\uFFEF：全角字符
		包含全角的韩文字符和标点符号
		\s：匹配任何空白字符（空格、制表符、换行等）
	 */
	// const symbol = /\u3000-\u303F\uFF00-\uFFEF\s/.test(text);
	const koreanChar = /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/.test(text);
	return koreanChar;
};

export { isKorean };
