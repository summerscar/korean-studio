import { auth } from "@/../auth";
import { SignIn } from "@/components/sign-in";
import { SignOut } from "@/components/sign-out";
import { keystoneContext } from "keystone/context";

export default async function Topik() {
	const session = await auth();
	console.log("session", session);

	const users = await keystoneContext
		.withSession(session)
		.query.User.findMany({ where: {}, query: "id name email isAdmin" });

	return (
		<div>
			<h1>Topik</h1>
			{users.map((user) => (
				<p key={user.id}>{user.name}</p>
			))}
			<SignIn />
			<SignOut />
		</div>
	);
}
