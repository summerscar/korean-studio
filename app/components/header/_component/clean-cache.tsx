"use client";
import { clearCacheAction } from "@/actions/clear-cache-actions";
import { callModal } from "@/components/modal";
import { isAdminBySession } from "@/hooks/use-user";
import { FAV_LIST_KEY } from "@/utils/config";
import type { Session } from "next-auth";
import { useRouter } from "next/navigation";
import { mutate } from "swr";

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
		// server
		await clearCacheAction(path);
		// client
		await mutate(FAV_LIST_KEY);
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
