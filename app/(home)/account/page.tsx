import { getAllDicts } from "@/actions/user-dict-action";
import { filterAndSortDictList } from "@/actions/user-dict-utils";
import InfoIcon from "@/assets/svg/info.svg";
import { auth } from "auth";
import { WordLists } from "./_components/lists";

const AccountPage = async () => {
	const session = await auth();
	const dicts = filterAndSortDictList(await getAllDicts(), session);

	if (!session) {
		return (
			<div className="pt-32">
				<h1>Not Signed In</h1>
			</div>
		);
	}

	return (
		<div className="w-full">
			<div className="py-4">
				<h1 className="text-3xl">Account</h1>
				<div>
					ID: {session.user?.id}{" "}
					<a
						target="_blank"
						href="https://github.com/summerscar/korean-studio/blob/main/scripts/tampermonkey-create-word-from-papago.js#L16-L32"
						rel="noreferrer"
					>
						<InfoIcon className="inline-block" />
					</a>
				</div>
				<div>Username: {session.user?.name}</div>
				<div>Email: {session.user?.email}</div>
			</div>
			<div>
				<h2 className="text-2xl">Word Lists </h2>
				<WordLists dicts={dicts} />
			</div>
		</div>
	);
};

export default AccountPage;
