"use client";

import { useEffect, useState } from "react";

interface FormattedDateProps {
	date: string | Date;
	className?: string;
}

export function FormattedDate({ date, className }: FormattedDateProps) {
	const [formattedDate, setFormattedDate] = useState<string>("");

	useEffect(() => {
		setFormattedDate(new Date(date).toLocaleDateString());
	}, [date]);

	if (!formattedDate) {
		return null;
	}

	return <span className={className}>{formattedDate}</span>;
}
