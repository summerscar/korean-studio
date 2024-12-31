const getPortalParent = () => {
	return document.fullscreenElement || document.body;
};

export { getPortalParent };
