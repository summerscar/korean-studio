import { keystoneContext } from "@/../keystone/context";

export const authenticateUserWithPassword = async (
	email: string,
	password: string,
) => {
	const res = await keystoneContext.graphql.run<
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
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
	const userId = res.authenticate?.item?.id;
	if (userId) {
		return await keystoneContext.sudo().query.User.findOne({
			where: { id: userId },
			query: "id name email isAdmin",
		});
	}
	throw new Error(res.authenticate?.message);
};
