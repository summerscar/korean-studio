"use server";

import type { TopikQuestion } from "@/types";

const checkAnswer = async (questionData: TopikQuestion, formData: FormData) => {
	const selectedOption = formData.get("options") as string;

	const correctOptionIndex = questionData.options.findIndex(
		(option) => option.isCorrect,
	);
	if (!selectedOption) {
		return {
			errors: "Please select an option",
		};
	}
	if (correctOptionIndex !== Number(selectedOption)) {
		return {
			errors: "Incorrect",
		};
	}
};

const testClick = async () => {
	console.log("test");
};

export { checkAnswer, testClick };
