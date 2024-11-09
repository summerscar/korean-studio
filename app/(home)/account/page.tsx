import { getAllDicts } from "@/actions/user-dict-action";
import { auth } from "auth";
import { WordLists } from "./_components/lists";

const AccountPage = async () => {
	const session = await auth();
	const dicts = await getAllDicts();
	if (!session) {
		return (
			<div className="pt-32">
				<h1>Not Signed In</h1>
			</div>
		);
	}

	return (
		<div className="w-full">
			<h1 className="text-3xl">Account</h1>
			<div className="py-4">
				<div>ID: {session.user?.id}</div>
				<div>Username: {session.user?.name}</div>
				<div>Email: {session.user?.email}</div>
			</div>
			<div>
				<h2 className="text-2xl">Word Lists</h2>
				<WordLists dicts={dicts} />
			</div>
		</div>
	);
};

export default AccountPage;
