import { auth } from "auth";
import Link from "next/link";

const Header = async () => {
	const session = await auth();
	console.log("[Header]", session);
	return (
		<div className="sticky flex border-b border-slate-900/10 w-full backdrop-blur-lg select-none bg-slate-300/10">
			<div className="w-full px-8 py-4 flex justify-between">
				<div>logo</div>
				<div>
					<span>
						{session ? (
							<div>
								<span>{session.user?.name}</span>
								<Link href="/api/auth/signout">Sign Out</Link>
							</div>
						) : (
							<Link href="/api/auth/signin">Sign In</Link>
						)}
					</span>
				</div>
			</div>
		</div>
	);
};

export { Header };
