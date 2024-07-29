import { auth } from "@/../auth";
import { KSwithSession, keystoneContext } from "@/../keystone/context";
import { getServerI18n } from "@/utils/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
	const tIndex = await getServerI18n("Index");
	return {
		title: `${tIndex("title")}-TOPIK`,
	};
}
export default async function Topik() {
	const users = await KSwithSession(await auth()).query.User.findMany({
		where: {},
		query: "id name email isAdmin",
	});

	return (
		<div>
			<h1>Topik</h1>
			{users.map((user) => (
				<p key={user.id}>{user.name}</p>
			))}
		</div>
	);
}
