const WORD_EXAMPLE = {
	name: "하늘",
	trans: {
		en: ["Sky", "Heaven", "God"],
		"zh-CN": ["天空", "天堂", "上帝"],
		"zh-TW": ["天空", "天堂", "上帝"],
		ja: ["空", "天", "上帝"],
	},
	example: "하늘을 바라보세요.",
	exTrans: {
		en: ["Look at the sky."],
		"zh-CN": ["仰望天空。"],
		"zh-TW": ["仰望天空。"],
		ja: ["空を見てください。"],
	},
};
const generateWordPrompt = (word: string) => {
	return `
请根据以下规则处理韩语单词并生成标准化的 JSON 输出:

输入参考格式:
${JSON.stringify(WORD_EXAMPLE)}
处理步骤:
1. 输入处理:
   - 给定单词若不是韩文,需先转换为韩文
   - 移除所有标点符号

2. 汉字词处理:
   - 检查韩文单词是否有对应的常用汉字词
   - 若有,将汉字词用【】包裹,添加到中文(zh-CN/zh-TW)释义列表的首位
   - 若无(包括无对应汉字词/非汉字词/罕见汉字词),跳过此步骤

3. 输出要求:
   - 严格按照参考格式生成 JSON
   - 包含完整的 name/trans/example/exTrans 字段
   - 仅返回 JSON 字符串,不要包含其他内容

示例输入: 你好
预期输出格式:
{
    "name": "[转换后的韩文]",
    "trans": {
        "en": [...],
        "zh-CN": ["[汉字词]", ...],  // 如果适用的话
        "zh-TW": ["[汉字词]", ...],  // 如果适用的话
        "ja": [...]
    },
    "example": "[韩语例句]",
    "exTrans": {
        "en": ["..."],
        "zh-CN": ["..."],
        "zh-TW": ["..."],
        "ja": ["..."]
    }
}

现在输入单词: [${word}]`;
};

const generateDocDescriptionPrompt = () => {
	return "我将发你一份韩语学习相关教程，你将总结这份教程，生成的描述，控制在20-100个字。";
};

const generateDocPrompt = (title: string) => `
请按以下模板生成韩语语法说明文档。要求:
1. 使用 Markdown 格式
2. 所有韩语例句使用 <Speak></Speak> 标签包裹
3. 使用"子音/母音"替代"辅音/元音"
4. 例句只需中文注释,无需标注发音
5. 句型说明力求简洁

# [语法名称]

## 句型
- 动词接续: [说明动词如何接续及活用]
- 形容词接续: [说明形容词如何接续及活用]
- 名词接续: [说明名词如何接续及活用]

## 含义
1. [基本含义]
2. [延伸含义1]
3. [延伸含义2]
...

## 例子
### 含义1
1. <Speak>韩语例句1</Speak>
   - 中文注释
2. <Speak>韩语例句2</Speak>
   - 中文注释
3. <Speak>韩语例句3</Speak>
   - 中文注释

### 含义2
[按上述格式列出3个例句]

### 含义3
[按上述格式列出3个例句]

## 注意事项
1. [使用限制]
2. [特殊情况]
3. [常见错误]
...

## 类似语法对比
1. [语法1]
   - 相同点：
   - 区别：
2. [语法2]
   - 相同点：
   - 区别：
...

---
示例要求:
1. 每种含义都需配备3个典型例句
2. 句型说明应覆盖所有可能的接续形式
3. 注意事项应尽可能详尽
4. 类似语法对比应明确指出异同点

请给出语法 [${title}] 的说明文档：`;

const generateWordSuggestionPrompt = (word: string, locale: string) => {
	return `现有韩语单词【${word}】，请告诉我该单词含义，以及如何拆解并背诵该单词。请使用 ${locale} 语言告诉我。`;
};

export {
	generateWordPrompt,
	generateDocDescriptionPrompt,
	generateDocPrompt,
	generateWordSuggestionPrompt,
};
