"use client";

import { useEffect, useState } from "react";

interface FormattedDateProps {
	date: string | Date;
}

export function FormattedDate({ date }: FormattedDateProps) {
	const [formattedDate, setFormattedDate] = useState<string>("");

	useEffect(() => {
		setFormattedDate(new Date(date).toLocaleDateString());
	}, [date]);

	if (!formattedDate) {
		return null;
	}

	return <span className="text-xs">{formattedDate}</span>;
}
