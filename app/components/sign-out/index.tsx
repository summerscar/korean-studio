"use client";
import { signOut } from "next-auth/react";

export const SignOut = () => {
	return (
		<button onClick={() => signOut()} type="button">
			Sign out
		</button>
	);
};
