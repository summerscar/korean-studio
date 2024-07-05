import { signIn } from "@/../auth";
import { isRedirectError } from "next/dist/client/components/redirect";

export function SignIn() {
	return (
		<form
			action={async (formData) => {
				"use server";
				try {
					await signIn("credentials", formData);
				} catch (e) {
					if (!isRedirectError(e)) {
						throw e;
					}
					console.log("------------\n", e.message, "\n------------");
					console.log("------------\n", e, "\n------------");
				}
			}}
		>
			<label>
				Email
				<input name="email" type="email" />
			</label>
			<label>
				Password
				<input name="password" type="password" />
			</label>
			<button type="submit">Sign In</button>
		</form>
	);
}
