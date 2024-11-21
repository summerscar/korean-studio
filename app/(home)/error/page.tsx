"use client";
import ErrorComp from "@/(home)/error";

export default function ErrorPage() {
	return <ErrorComp error={new Error("")} reset={() => {}} />;
}
