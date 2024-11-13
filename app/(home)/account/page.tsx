import { getAllDicts } from "@/actions/user-dict-action";
import { filterAndSortDictList } from "@/actions/user-dict-utils";
import InfoIcon from "@/assets/svg/info.svg";
import { getServerI18n } from "@/utils/i18n";
import { auth } from "auth";
import Link from "next/link";
import { WordLists } from "./_components/lists";

export const generateMetadata = async () => {
	const tAccount = await getServerI18n("Account");

	return {
		title: tAccount("profile"),
	};
};

const AccountPage = async () => {
	const session = await auth();
	const dicts = filterAndSortDictList(await getAllDicts(), session, false);
	const tAccount = await getServerI18n("Account");

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
				<h1 className="text-3xl pb-4">{tAccount("profile")}</h1>
				<div>
					ID: {session.user?.id}{" "}
					<Link
						target="_blank"
						href="/learn/beginner/papago#:~:text=用户ID"
						rel="noreferrer"
					>
						<InfoIcon className="inline-block" />
					</Link>
				</div>
				<div>
					{tAccount("username")}: {session.user?.name}
				</div>
				<div>
					{tAccount("email")}: {session.user?.email}
				</div>
			</div>
			<div>
				<h2 className="text-2xl">{tAccount("myWordList")}</h2>
				<WordLists dicts={dicts} />
			</div>
		</div>
	);
};

export default AccountPage;
