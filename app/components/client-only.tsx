"use client";
import { useMount } from "ahooks";
import { useState } from "react";

export const ClientOnly = ({ children }: { children: React.ReactNode }) => {
	const [hasMounted, setHasMounted] = useState(false);
	useMount(() => setHasMounted(true));
	return hasMounted ? children : null;
};
