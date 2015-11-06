function getRemoteURL(path) {
	return 'http://hoverlytics.burntcaramel.com' + path;
};

function getGoURL(path) {
	return getRemoteURL('/go/v3' + path);
};

function getPanelURL(path) {
	return getRemoteURL('/panel/v3' + path);
};

module.exports = {
	getRemoteURL: getRemoteURL,
	getGoURL: getGoURL,
	getPanelURL: getPanelURL
}