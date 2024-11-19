"use client";

import { useRouter } from "next/navigation";

export default function ErrorPage() {
	const router = useRouter();
	return (
		<div className="flex flex-col items-center justify-center p-4 mx-auto">
			<div className="text-center space-y-6">
				<h1 className="text-4xl font-bold text-gray-900">出错了</h1>
				<p className="text-gray-600">抱歉，页面加载出现问题</p>
				<button
					type="button"
					onClick={() => router.replace("/")}
					className="px-6 py-2 btn"
				>
					返回首页
				</button>
			</div>
		</div>
	);
}
