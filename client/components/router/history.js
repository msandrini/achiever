let historyListener = null;

window.onpopstate = (event) => {
	historyListener(event.path[0].location.pathname);
};

export const push = (pathname) => {
	window.history.pushState({}, '', pathname);
	historyListener(pathname);
};

export const onChangeLocation = (cb) => {
	historyListener = cb;
};
