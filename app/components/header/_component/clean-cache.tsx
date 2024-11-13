"use client";
import { clearCacheAction } from "@/actions/clear-cache-actions";
import { callModal } from "@/components/modal";
import { isAdminBySession } from "@/hooks/use-user";
import type { Session } from "next-auth";
import { useRouter } from "next/navigation";

const CleanCache = ({ session }: { session: Session | null }) => {
	const router = useRouter();
	const isAdmin = isAdminBySession(session);
	const handleOnClick = async () => {
		const path = (await callModal({
			type: "dialog",
			title: "Clean Cache",
			inputDefaultValue: "/",
		})) as string | undefined;
		if (!path) return;
		await clearCacheAction(path);
		router.refresh();
	};
	if (!isAdmin) return null;
	return (
		<button
			className="btn btn-ghost btn-xs -ml-4"
			type="button"
			onClick={handleOnClick}
		>
			🧹
		</button>
	);
};

export { CleanCache };
