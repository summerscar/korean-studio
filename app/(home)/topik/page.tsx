import { keystoneContext } from "keystone/context";

export default async function Topik() {
	const session = {};
	const users = await keystoneContext
		.withSession(session)
		.query.User.findMany({ where: {}, query: "id name email isAdmin" });

	return (
		<div>
			<h1>Topik</h1>
			{users.map((user) => (
				<p key={user.id}>{user.name}</p>
			))}
		</div>
	);
}