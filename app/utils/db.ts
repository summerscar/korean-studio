import { keystoneContext } from "@/../keystone/context";

export const authenticateUserWithPassword = async (
	email: string,
	password: string,
) => {
	const res = await keystoneContext.graphql.run<
		Record<string, any>,
		{ identity: string; secret: string }
	>({
		query: `mutation signin($identity: String!, $secret: String!) {
			authenticate: authenticateUserWithPassword(email: $identity, password: $secret) {
				... on UserAuthenticationWithPasswordSuccess {
					item {
						id
					}
				}
				... on UserAuthenticationWithPasswordFailure {
					message
				}
			}
		}`,
		variables: {
			identity: email,
			secret: password,
		},
	});

	if (res.authenticate?.message === "Failed to start session.") {
		return await keystoneContext.sudo().query.User.findOne({
			where: { email },
			query: "id name email",
		});
	}
	throw new Error(res.authenticate?.message);
};
