"use client";
import useCountdown from "ahooks/lib/useCountDown";

const TestCutDown = ({ timeLeft }: { timeLeft: number }) => {
	const [_, formattedRes] = useCountdown({ leftTime: timeLeft });
	const { hours, minutes, seconds } = formattedRes;

	const paddingZero = (num: number) => {
		return num < 10 ? `0${num}` : num;
	};

	return (
		<span>
			{paddingZero(hours)}:{paddingZero(minutes)}:{paddingZero(seconds)}
		</span>
	);
};

export { TestCutDown };
