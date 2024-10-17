import confetti from "canvas-confetti";

const count = 500;
const defaults = {
	scalar: 1.4,
	gravity: 1.2,
} satisfies confetti.Options;

function fireLeft(particleRatio: number, opts: confetti.Options) {
	confetti({
		...defaults,
		...opts,
		particleCount: Math.floor(count * particleRatio),
		angle: 55,
		origin: { x: -0.1, y: 1 },
		drift: 1.5,
	});
}

function fireRight(particleRatio: number, opts: confetti.Options) {
	confetti({
		...defaults,
		...opts,
		particleCount: Math.floor(count * particleRatio),
		angle: 125,
		origin: { x: 1.1, y: 1 },
		drift: -1.5,
	});
}

const leftConfetti = () => {
	fireLeft(0.25, {
		spread: 26,
		startVelocity: 80,
	});
	fireLeft(0.2, {
		spread: 40,
	});
	fireLeft(0.35, {
		spread: 50,
		decay: 0.91,
		scalar: 0.8,
		startVelocity: 90,
	});
	fireLeft(0.1, {
		// spread: 80,
		startVelocity: 50,
		decay: 0.92,
		scalar: 1.2,
	});
	fireLeft(0.1, {
		// spread: 80,
		startVelocity: 70,
	});
};

const rightConfetti = () => {
	fireRight(0.25, {
		spread: 26,
		startVelocity: 80,
	});
	fireRight(0.2, {
		spread: 40,
	});
	fireRight(0.35, {
		spread: 50,
		decay: 0.91,
		scalar: 0.8,
		startVelocity: 90,
	});
	fireRight(0.1, {
		// spread: 80,
		startVelocity: 50,
		decay: 0.92,
		scalar: 1.2,
	});
	fireRight(0.1, {
		// spread: 80,
		startVelocity: 70,
	});
};

const playConfetti = () => {
	leftConfetti();
	rightConfetti();
};

export { playConfetti };
