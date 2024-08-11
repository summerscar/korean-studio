import type en from "./messages/en.json";
import type { Context } from ".keystone/types";

declare global {
	var keystoneContext: Context | undefined;
}
type Messages = typeof en;

declare global {
	interface IntlMessages extends Messages {}
}
