import { getAllDicts } from "@/actions/user-dict-action";
import { auth } from "auth";
import { WordsList } from "./_components/words-list";

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
				<div className="join join-vertical w-full py-4">
					{dicts
						.filter((dict) => dict.createdBy.id === session.user?.id)
						.map((dict) => (
							<div
								key={dict.id}
								className="collapse collapse-arrow join-item border-base-300 border"
							>
								<input
									type="radio"
									name="my-accordion-4"
									defaultChecked={false}
								/>
								<div className="collapse-title text-xl font-medium">
									👉 {dict.name} 👈
								</div>
								<div className="collapse-content">
									<span className="text-xs">Id: {dict.id}</span>
									<WordsList dictId={dict.id} />
								</div>
							</div>
						))}
				</div>
			</div>
		</div>
	);
};

export default AccountPage;
