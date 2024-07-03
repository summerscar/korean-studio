import { getContext } from "@keystone-6/core/context";
import type { Context } from ".keystone/types";

let _keystoneContext: Context = (globalThis as any)._keystoneContext;

export async function getKeystoneContext() {
	if (_keystoneContext) return _keystoneContext;

	// TODO: this could probably be better
	_keystoneContext = getContext(
		(await import("../../keystone")).default,
		await import("@prisma/client"),
	);
	if (process.env.NODE_ENV !== "production") {
		(globalThis as any)._keystoneContext = _keystoneContext;
	}
	return _keystoneContext;
}
