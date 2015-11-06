(function() {
	if (window.hoverlyticsPageViewer) {
		window.hoverlyticsPageViewer.cancelled = true;
		
		console.log('CANCELLING AND REMOVING HOVERLYTICS');
		
		var loadedResourceElements = document.getElementsByClassName('hoverlyticsLoadedResource');
		// getElementsByClassName auto updates after every removeChild, so just remove the first item.
		while (loadedResourceElements[0]) {
			var e = loadedResourceElements[0];
			e.onload = null;
			e.parentNode.removeChild(e);
		}
		
		var panel = document.getElementById('hoverlyticsPageViewerHolder');
		if (panel) {
			panel.parentNode.removeChild(panel);
		}
		
		delete window.hoverlyticsPageViewer;
		
		return;
	}
	
	var config = require('hoverlytics-config');
	var random = Math.random();
	
	window.hoverlyticsPageViewer = {
		baseURL: config.getPanelURL('/?_=' + random),
		pageLinkTimeoutDuration: 400
	};
	
	var mainFileName = (window.jQuery) ? 'client-main-without-jquery.js' : 'client-main-including-jquery.js';
	
	var s = document.createElement('script');
	s.src = config.getGoURL('/' + mainFileName + '?_=' + random);
	s.async = true;
	s.className = 'hoverlyticsLoadedResource';
	document.body.appendChild(s);
})();