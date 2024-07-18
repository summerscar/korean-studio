const isParentWithClassName = (className: string, el: HTMLElement | null) => {
	if (!el) return false;
	window.test = isParentWithClassName;
	if (el.classList.contains(className)) return true;
	return isParentWithClassName(className, el.parentElement);
};

export { isParentWithClassName };
