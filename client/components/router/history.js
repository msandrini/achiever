const onChangeListeners = [];

export const push = (pathname) => {
	window.history.pushState({}, '', pathname);
	onChangeListeners.forEach(callback => callback(pathname));
};

export const onChangeLocation = cb => onChangeListeners.push(cb);
