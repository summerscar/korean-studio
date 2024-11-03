import { ImageResponse } from "next/og";

// Image metadata
export const size = {
	width: 32,
	height: 32,
};
export const contentType = "image/png";

export const LOGO = ({ fontSize = 20 }: { fontSize?: number }) => (
	<div
		style={{
			fontSize,
			background: "#66ccff",
			width: "100%",
			height: "100%",
			display: "flex",
			alignItems: "center",
			borderRadius: 8,
			justifyContent: "center",
			color: "white",
		}}
	>
		한
	</div>
);

// Image generation
export default function Icon() {
	return new ImageResponse(
		// ImageResponse JSX element
		<LOGO />,
		// ImageResponse options
		{
			// For convenience, we can re-use the exported icons size metadata
			// config to also set the ImageResponse's width and height.
			...size,
		},
	);
}
