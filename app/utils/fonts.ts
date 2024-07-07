import { Inter, Nanum_Myeongjo, Noto_Serif_KR } from "next/font/google";

export const inter = Inter({ subsets: ["latin"] });

export const myeongjo = Nanum_Myeongjo({ weight: "400", subsets: ["latin"] });

export const notoKR = Noto_Serif_KR({
	weight: ["400", "700"],
	subsets: ["latin"],
});
