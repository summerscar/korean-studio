import fs from "node:fs";
import path from "node:path";

interface SubtitleCue {
	startTime: string;
	endTime: string;
	text: string;
}

function parseVTTTime(timeStr: string): string {
	return timeStr.trim().split(" ")[0];
}

function extractKoreanText(text: string): string {
	const koreanMatch = text.match(/<c\.korean>(.*?)<\/c\.korean>/);
	return koreanMatch ? koreanMatch[1] : "";
}

function extractZhCNText(text: string): string {
	const zhCNMatch = text.match(
		/<c\.simplifiedchinese>(.*?)<\/c\.simplifiedchinese>/,
	);
	return zhCNMatch ? zhCNMatch[1] : "";
}

function extractEnglishText(text: string): string {
	return text;
}

function extractJapaneseText(text: string): string {
	const japaneseMatch = text.match(/<c\.japanese>(.*?)<\/c\.japanese>/);
	const japaneseText = japaneseMatch ? japaneseMatch[1] : "";
	return (
		japaneseText.match(/<c\.bg_transparent>(.*?)<\/c\.bg_transparent>/)?.[1] ||
		""
	);
}

function parseVTTFile(filePath: string): SubtitleCue[] {
	const content = fs.readFileSync(filePath, "utf-8");
	const lines = content.split("\n");
	const cues: SubtitleCue[] = [];

	let i = 0;
	// Skip header
	while (i < lines.length && !lines[i].includes("-->")) {
		i++;
	}

	while (i < lines.length) {
		const line = lines[i].trim();

		if (line.includes("-->")) {
			const [startTime, endTime] = line.split("-->").map(parseVTTTime);
			let text = "";
			i++;

			// Collect all text lines until empty line
			while (i < lines.length && lines[i].trim() !== "") {
				text += `${lines[i].trim()} `;
				i++;
			}

			const subTitleText =
				extractKoreanText(text) ||
				extractZhCNText(text) ||
				extractJapaneseText(text) ||
				extractEnglishText(text);

			if (subTitleText) {
				cues.push({
					startTime,
					endTime,
					text: subTitleText,
				});
			}
		}
		i++;
	}

	return cues;
}

// Main execution
const subtitlePath = process.argv[2];
const fileName = path.basename(subtitlePath);
const outputPathDir = path.join(__dirname, "../public", "subtitle-text");
const outputPath = path.join(outputPathDir, `${fileName}.json`);

try {
	const cues = parseVTTFile(subtitlePath);
	fs.writeFileSync(outputPath, JSON.stringify(cues, null, 2), "utf-8");
	console.log(`Successfully parsed ${cues.length} subtitle cues`);
	console.log(`JSON output saved to ${outputPath}`);
} catch (error) {
	console.error("Error processing subtitle file:", error);
}
