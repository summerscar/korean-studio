import type { Context } from ".keystone/types";
declare module "*.svg" {
	import type { FC, SVGProps } from "react";
	const content: FC<SVGProps<SVGElement>>;
	export default content;
}

declare module "*.svg?url" {
	const content: string;
	export default content;
}

declare module "*.mp3" {
	const src: string;
	export default src;
}

declare global {
	var keystoneContext: Context | undefined;
}
