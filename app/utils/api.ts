import { GraphQLClient } from "graphql-request";

export const client = new GraphQLClient(
	`${process.env.NEXTAUTH_URL}/api/graphql/`,
);

// api authenticateUserWithPassword
export const authenticateUserWithPassword = async (
	email: string,
	password: string,
) => {
	const res = await client.request(
		`
		mutation ($identity: String!, $secret: String!) {
			authenticate: authenticateUserWithPassword(email: $identity, password: $secret) {
				... on UserAuthenticationWithPasswordSuccess {
					item {
						id
						__typename
					}
					__typename
				}
				... on UserAuthenticationWithPasswordFailure {
					message
					__typename
				}
				__typename
			}
		}
	`,
		{
			identity: email,
			secret: password,
		},
	);

	return res;
};
