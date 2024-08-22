import { getServerI18n } from "@/utils/i18n";
import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

// TODO: og-image
export async function GET(req: NextRequest): Promise<Response | ImageResponse> {
	try {
		const t = await getServerI18n("Index");

		const { searchParams } = new URL(req.url);
		// TODO: 设备主题设置
		// const isLight = req.headers.get("Sec-CH-Prefers-Color-Scheme") === "light";

		const title = searchParams.has("title")
			? searchParams.get("title")
			: t("title");

		return new ImageResponse(
			<div
				style={{
					display: "flex",
					height: "100%",
					width: "100%",
					alignItems: "center",
					justifyContent: "center",
					flexDirection: "column",
					backgroundImage: "linear-gradient(to bottom, #dbf4ff, #fff1f1)",
					fontSize: 60,
					letterSpacing: -2,
					fontWeight: 700,
					textAlign: "center",
				}}
			>
				<div
					style={{
						backgroundImage:
							"linear-gradient(90deg, rgb(121, 40, 202), rgb(255, 0, 128))",
						backgroundClip: "text",
						color: "transparent",
					}}
				>
					{title}
				</div>
			</div>,
			{
				width: 843,
				height: 441,
			},
		);
	} catch (e) {
		if (!(e instanceof Error)) throw e;

		// eslint-disable-next-line no-console
		console.log(e.message);
		return new Response("Failed to generate the image", {
			status: 500,
		});
	}
}
