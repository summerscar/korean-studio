import confetti from "canvas-confetti";

const count = 300;
const defaults = {
	scalar: 2,
	gravity: 0.7,
} satisfies confetti.Options;

function fireLeft(particleRatio: number, opts: confetti.Options) {
	confetti({
		...defaults,
		...opts,
		particleCount: Math.floor(count * particleRatio),
		angle: 45,
		origin: { x: -0.1, y: 0.8 },
		drift: 1.5,
	});
}

function fireRight(particleRatio: number, opts: confetti.Options) {
	confetti({
		...defaults,
		...opts,
		particleCount: Math.floor(count * particleRatio),
		angle: 135,
		origin: { x: 1.1, y: 0.8 },
		drift: -1.5,
	});
}

const leftConfetti = () => {
	fireLeft(0.25, {
		spread: 26,
		startVelocity: 65,
	});
	fireLeft(0.2, {
		spread: 60,
	});
	fireLeft(0.35, {
		spread: 100,
		decay: 0.91,
		scalar: 0.8,
	});
	fireLeft(0.1, {
		spread: 120,
		startVelocity: 35,
		decay: 0.92,
		scalar: 1.2,
	});
	fireLeft(0.1, {
		spread: 120,
		startVelocity: 55,
	});
};

const rightConfetti = () => {
	fireRight(0.25, {
		spread: 26,
		startVelocity: 65,
	});
	fireRight(0.2, {
		spread: 60,
	});
	fireRight(0.35, {
		spread: 100,
		decay: 0.91,
		scalar: 0.8,
	});
	fireRight(0.1, {
		spread: 120,
		startVelocity: 35,
		decay: 0.92,
		scalar: 1.2,
	});
	fireRight(0.1, {
		spread: 120,
		startVelocity: 55,
	});
};

const playConfetti = () => {
	leftConfetti();
	rightConfetti();
};

export { playConfetti };
