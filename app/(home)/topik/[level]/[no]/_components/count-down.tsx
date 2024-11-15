"use client";
import { useMemoizedFn } from "ahooks";
import useCountdown from "ahooks/lib/useCountDown";
import { useEffect } from "react";

const TestCutDown = ({
	timeLeft,
	onEnd = () => {},
}: { timeLeft: number; onEnd: () => void }) => {
	const [leftTime, formattedRes] = useCountdown({ leftTime: timeLeft });
	const { hours, minutes, seconds } = formattedRes;

	const paddingZero = (num: number) => {
		return num < 10 ? `0${num}` : num;
	};
	const memoOnEnd = useMemoizedFn(onEnd);

	useEffect(() => {
		if (leftTime <= 0) {
			memoOnEnd();
		}
	}, [leftTime, memoOnEnd]);

	return (
		<span className="text-xl font-bold">
			{paddingZero(hours)}:{paddingZero(minutes)}:{paddingZero(seconds)}
		</span>
	);
};

export { TestCutDown };
