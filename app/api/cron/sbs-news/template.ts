type Video = {
	videoId: string;
	title: string | null | undefined;
	description: string | null | undefined;
	publishedAt: string | null | undefined;
	viewCount: number;
	thumbnailUrl: string | null | undefined;
};

const buildContent = (video: Video) => {
	return `
<iframe
    width="560"
    height="315"
    src="https://www.youtube.com/embed/${video.videoId}"
    title="${video.title?.replace(/"/g, '\\"')}"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
/>

---

${video.description}

> Published at ${video.publishedAt}
	`;
};

export { buildContent };
