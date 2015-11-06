"Copyright 2013-2014 Patrick Smith";

/*! HOVERLYTICS */

var hoverlyticsPageViewer = null;
var $ = null;
var cookie = require('browser-cookie-lite').cookie;
var config = require('hoverlytics-config');

module.exports = function(hoverlyticsPageViewerSetUp, jQuery) {
	hoverlyticsPageViewer = hoverlyticsPageViewerSetUp;
	$ = jQuery;
	
	hoverlyticsMain();
};


function hoverlyticsMain()
{
	/*! EVENTS */
	$(document).on('mouseover', 'a[href]', hoverlyticsMouseEnteredPageLink);
	
	//console.log('HOVERLYTICS GO');
	/*! READY */
	$(function() {
		//console.log('HOVERLYTICS DOCUMENT READY');
		
		var headElement = document.getElementsByTagName('head')[0];
		var linkCSS = document.createElement('link');
		linkCSS.className = 'hoverlyticsLoadedResource';
		linkCSS.rel = 'stylesheet';
		linkCSS.href = config.getGoURL('/main.css?_='+(Math.random()));
		headElement.appendChild(linkCSS);
		
		var s = document.createElement('script');
		s.src = config.getPanelURL('/vendor-js/porthole.min.js');
		s.async = true;
		s.className = 'hoverlyticsLoadedResource';
		s.onload = function() {
			hoverlyticsSetUp();
		};
		document.body.appendChild(s);
	});
}


var initHoverlyticsPageViewer = function()
{
	this.linkToLoad = null;
	
	this.ready = true;
	
	this.settingsDidChange = function() {
		cookie('hoverlyticsSettingsDidChange', '1', 356 * 5, '/');
	};
	
	this.getEnabled = function() {
		if (this.enabled == null) {
			this.enabled = (cookie('hoverlyticsPageViewerEnabled') != '0');
		}
		
		return this.enabled;
	};
	
	this.setEnabled = function(enabled) {
		cookie('hoverlyticsPageViewerEnabled', enabled ? '1' : '0');
		
		this.enabled = enabled;
	};
	
	this.defaultAlignment = "left";
	
	this.getAlignment = function() {
		if (!this.alignment) {
			this.alignment = cookie('hoverlyticsPageViewerAlignment') || this.defaultAlignment;
		}
		
		return this.alignment;
	};
	
	this.setAlignment = function(alignment) {
		var previousAlignment = this.alignment || null;
		if (this.alignment === alignment) {
			return;
		}
		
		cookie('hoverlyticsPageViewerAlignment', alignment, 356 * 5, '/');
		this.settingsDidChange();
		
		this.alignment = alignment;
		
		hoverlyticsPageViewerUpdateAlignment({previousAlignment: previousAlignment});
	};
	
	this.getGoogleAnalyticsProfileID = function() {
		var cookieValue = cookie('hoverlyticsGoogleAnalyticsProfileID');
		if (cookieValue) {
			return cookieValue;
		}
		
		if (window.localStorage) {
			return window.localStorage.getItem('hoverlyticsGoogleAnalyticsProfileID');
		}
		else {
			return null;
		}
	};
	
	this.setGoogleAnalyticsProfileID = function(profileID) {
		//DEBUG && console.log('RECEIVED MESSAGE: NEW PROFILE ID SELECTED', profileID);
		cookie('hoverlyticsGoogleAnalyticsProfileID', profileID, 356 * 5, '/');
		
		if (window.localStorage) {
			window.localStorage.setItem('hoverlyticsGoogleAnalyticsProfileID', profileID);
		}
			
		this.settingsDidChange();
	};
	
	this.getEnabledSections = function() {
		if (this.enabledSections == null) {
			try {
				var enabledSections = {};
				var enabledSectionIDsList = cookie('hoverlyticsPageViewerEnabledSections').split(',');
				$.each(enabledSectionIDsList, function(index, sectionID) {
					if (sectionID) {
						enabledSections[sectionID] = true;
					}
				});
				//console.log('cookie load enabledSections', enabledSectionIDsList, enabledSections);
				this.enabledSections = enabledSections;
			}
			catch (exception) {
				this.enabledSections = {};
			}
		}
		
		//console.log('FRONT getEnabledSections', this.enabledSections);
		
		return this.enabledSections;
	};
	
	this.changeSectionIsEnabled = function(sectionID, isEnabled) {
		var enabledSections = this.getEnabledSections();
		enabledSections[sectionID] = isEnabled;
		
		this.saveEnabledSections();
	};
	
	this.saveEnabledSections = function() {
		var enabledSectionIDsList = [];
		$.each(this.enabledSections, function(sectionID, isEnabled) {
			if (isEnabled) {
				enabledSectionIDsList.push(sectionID);
			}
		});
		//console.log('SAVING ENABLED SECTIONS', enabledSectionIDsList);
		cookie('hoverlyticsPageViewerEnabledSections', enabledSectionIDsList.join(','));
		this.settingsDidChange();
	};
	
	this.chooseProfile = function()
	{
		this.proxy.post({chooseProfile: true});
	};
	
	this.signOut = function()
	{
		this.proxy.post({signOut: true});
	};
};
/*
module.exports = function(hoverlyticsPageViewer, window) {
	initHoverlyticsPageViewer.call(hoverlyticsPageViewer);
	console.log('INIT HOVERLYTICS PAGE VIEWER', hoverlyticsPageViewer);
	
	window.addEventListener('message', function(e) {
		var message = e.data;
		hoverlyticsPageViewerReceivedMessage(message);
	});
};
*/

function hoverlyticsSetUp()
{//console.log('hoverlyticsSetUp');
	initHoverlyticsPageViewer.call(hoverlyticsPageViewer);
	//console.log('INIT HOVERLYTICS PAGE VIEWER', hoverlyticsPageViewer);
	
	window.addEventListener('message', function(e) {
		var message = e.data;
		//console.log('RAW MESSAGE', message);
		//hoverlyticsPageViewerReceivedMessage(message);
	});


	var isEnabled = hoverlyticsPageViewer.getEnabled();
	if (isEnabled && !hoverlyticsPageViewer.linkToLoad) {
		hoverlyticsPageViewer.linkToLoad = document.URL;
	}
	
	
	var sourceProxyURL = hoverlyticsPageViewer.localProxyFileURL;
	
	var googleAnalyticsProfileID = hoverlyticsPageViewer.getGoogleAnalyticsProfileID();
	var jsonEncodedInfo = '{"masterPageURL":"' + document.URL + '", "sourceProxyURL":"' + sourceProxyURL+'"' + (googleAnalyticsProfileID ? ',"googleAnalyticsProfileID":"' + googleAnalyticsProfileID + '"' : '') + '}';
	
	var pageViewerBaseURL = hoverlyticsPageViewer.baseURL;
	var pageViewerLoadIFrameURL = pageViewerBaseURL + '#'+ encodeURIComponent(jsonEncodedInfo);
	var pageViewer = hoverlyticsPageViewer.$iframe = $('<iframe>', {id: 'hoverlyticsPageViewerIFrame', name: 'hoverlyticsPageViewerIFrame', width: 250, height: '100%', src: pageViewerLoadIFrameURL, frameborder: '0', scrolling: 'no'});
	
	
	if (false) {
		var iframe = pageViewer.get(0);
		//iframe.addEventListener
	}
	else {
		// PROXY
		var proxyPageURL = pageViewerBaseURL + 'proxy.html';
		var pageViewerProxy = hoverlyticsPageViewer.proxy = new Porthole.WindowProxy(proxyPageURL, 'hoverlyticsPageViewerIFrame');
		pageViewerProxy.addEventListener(hoverlyticsPageViewerReceivedMessage);
	}
	
	
	var holder = hoverlyticsPageViewer.$holder = $('<div></div>', {id: 'hoverlyticsPageViewerHolder'});
	hoverlyticsPageViewerUpdateAlignment();
	holder.toggleClass('demo', !!hoverlyticsPageViewer.isDemo);
	holder.append(pageViewer);
	holder.appendTo('body');
	
	
	var toggleButton = $('<a></a>', {id: 'hoverlyticsPageViewerToggleButton'});
	toggleButton.on('click', hoverlyticsPageViewerToggleButtonClicked);
	
	var settingsButton = $('<a></a>', {id: 'hoverlyticsPageViewerSettingsButton', class: 'icon-cog'});
	settingsButton.on('click', hoverlyticsPageViewerSettingsButtonClicked);
	
	var buttonBar = $('<div></div>', {id: 'hoverlyticsPageViewerButtonBar'});
	buttonBar.append(toggleButton, settingsButton);
	holder.append(buttonBar);
	
	buttonBar.on('mouseover', function(event) {
		hoverlyticsPageViewerChangeActive(true);
	});
	
	
	hoverlyticsPageViewer.ready = true;
	hoverlyticsPageViewerChangeEnabled(isEnabled);
}

function hoverlyticsPageViewerUpdateAlignment(options)
{
	var holder = hoverlyticsPageViewer.$holder;
	var alignment = hoverlyticsPageViewer.getAlignment();
	
	if (options && options.previousAlignment) {
		holder.addClass('changingAlignment');
		var css = {};
		css[options.previousAlignment] = '-300px';
		holder.animate(css, 480, function() {
			holder.toggleClass('alignedLeft', alignment === 'left');
			holder.toggleClass('alignedRight', alignment === 'right');
			
			css[options.previousAlignment] = 'auto';
			css[alignment] = '-300px';
			holder.css(css);
			
			css[alignment] = '0';
			holder.animate(css, 400, function() {
				holder.removeClass('changingAlignment');
				
				css[options.previousAlignment] = '';
				css[alignment] = '';
				holder.css(css);
			});
		});
	}
	else {
		holder.toggleClass('alignedLeft', alignment === 'left');
		holder.toggleClass('alignedRight', alignment === 'right');
	}
	
	hoverlyticsPageViewerToggleUpdateSettingsView();
}

function hoverlyticsPageViewerChangeActive(isActive)
{
	hoverlyticsPageViewer.$holder.toggleClass('active', isActive);
}

function hoverlyticsPageViewerChangeEnabled(isEnabled)
{
	if (isEnabled == null) {
		isEnabled = !hoverlyticsPageViewer.getEnabled();
	}
	
	hoverlyticsPageViewer.setEnabled(isEnabled);
	hoverlyticsPageViewer.$holder.toggleClass('enabled', isEnabled);
}

function hoverlyticsPageViewerChangeHeight(height)
{
	//hoverlyticsPageViewer.height = height;
	
	//if (hoverlyticsPageViewer.getEnabled()) {
		hoverlyticsPageViewer.$holder.height(height);
	//}
}

function hoverlyticsPageViewerChangeToBottomFullWidthPanel()
{
	hoverlyticsPageViewer.$holder.addClass('isBottomFullWidth');
}


function hoverlyticsPageViewerToggleShowingSettings()
{
	var settings = $('#hoverlyticsPageViewerSettings');
	if (settings.size() === 0) {
		settings = $('<div></div>', {id: 'hoverlyticsPageViewerSettings'});
		
		// ALIGNMENT
		var alignmentSection = $('<div>');
		var alignLeftButton = $('<a></a>', {id: 'hoverlyticsPageViewerSettingsAlignLeft', class: 'hoverlytics-toggleButton'}).text('Align Left');
		var alignRightButton = $('<a></a>', {id: 'hoverlyticsPageViewerSettingsAlignRight', class: 'hoverlytics-toggleButton'}).text('Align Right');
		alignmentSection.append(alignLeftButton, alignRightButton);
		settings.append(alignmentSection);
		
		alignLeftButton.on('click', function(event) {
			hoverlyticsPageViewer.setAlignment('left');
		});
		alignRightButton.on('click', function(event) {
			hoverlyticsPageViewer.setAlignment('right');
		});
		
		// ACCOUNT
		var accountSection = $('<div>');
		var chooseProfileButton = $('<a></a>', {id: 'hoverlyticsPageViewerSettingsChooseProfile', class: 'hoverlytics-pushButton'}).text('Choose Profile');
		var signOutButton = $('<a></a>', {id: 'hoverlyticsPageViewerSettingsSignOut', class: 'hoverlytics-pushButton'}).text('Sign Out');
		accountSection.append(chooseProfileButton, signOutButton);
		settings.append(accountSection);
		
		chooseProfileButton.on('click', function(event) {
			hoverlyticsPageViewer.chooseProfile();
			settings.toggleClass('active', false);
		});
		signOutButton.on('click', function(event) {
			hoverlyticsPageViewer.signOut();
		});

		
		hoverlyticsPageViewer.$holder.append(settings);
		
		hoverlyticsPageViewerToggleUpdateSettingsView();
	}
	
	setTimeout(function() {
		settings.toggleClass('active');
	}, 1);
}

function hoverlyticsPageViewerToggleUpdateSettingsView()
{
	var alignment = hoverlyticsPageViewer.getAlignment();
	$('#hoverlyticsPageViewerSettingsAlignLeft').toggleClass('selected', alignment === 'left');
	$('#hoverlyticsPageViewerSettingsAlignRight').toggleClass('selected', alignment === 'right');
}



function hoverlyticsPageViewerToggleButtonClicked(event)
{
	event.preventDefault();
	
	hoverlyticsPageViewerChangeEnabled();
}

function hoverlyticsPageViewerSettingsButtonClicked(event)
{
	event.preventDefault();
	
	hoverlyticsPageViewerToggleShowingSettings();
}

function hoverlyticsMouseEnteredPageLink(event)
{
	//console.log('(CHECKING)', hoverlyticsPageViewer);
	if ((!hoverlyticsPageViewer) || (!hoverlyticsPageViewer.ready) || !hoverlyticsPageViewer.getEnabled()) {
		return;
	}
	
	var link = $(event.target).closest('a[href]');
	hoverlyticsBeginTargetingLink(link);
	
	//DEBUG && console.log('HOVERLYTICS ENTERED LINK', link.attr('href'), ' TIMEOUT:', timeout);
}

function hoverlyticsBeginTargetingLink(link)
{
	link = link.filter(":not([href^='#']):not([href^='mailto:'])"); // Not hash or email links.
	link = link.filter("[href*='"+location.hostname+"'], [href^='/']"); // Only links within this website.
	link = link.filter(":not([href*='/wp-admin/'])"); // Not links to WordPress admin.
	if (link.size() === 0) {
		return false;
	}
	
	if (link.data('hoverlyticsMouseIsTargeting')) { // If this link is already being targeted.
		return;
	}
	
	if (hoverlyticsPageViewer.targetedLink) {
		hoverlyticsCancelTargetingLink(hoverlyticsPageViewer.targetedLink);
		hoverlyticsPageViewer.targetedLink = null;
	}
	
	link.data('hoverlyticsMouseIsTargeting', true);
	hoverlyticsPageViewer.targetedLink = link;
	
	var previousMousePosition = {};
	var mouseDistanceTravelled = 0.0;
	link.on('mousemove.hoverlyticsChecking', function(event) {
		var currentMousePosition = {x: event.pageX, y: event.pageY};
		if (previousMousePosition.usedBefore) {
			var distanceX = Math.abs(currentMousePosition.x - previousMousePosition.x);
			var distanceY = Math.abs(currentMousePosition.y - previousMousePosition.y);
			//console.log('MOUSE MOVED', distanceX, distanceY);
			mouseDistanceTravelled += Math.sqrt(distanceX*distanceX + distanceY*distanceY);
		}
		
		previousMousePosition = currentMousePosition;
		previousMousePosition.usedBefore = true;
	});
	
	link.on('mouseout.hoverlyticsChecking', function(event) {
		hoverlyticsCancelTargetingLink(link);
	});
	
	link.on('hoverlyticsCheckMouse.hoverlyticsChecking', function() {
		//console.log('MOUSE DISTANCE TRAVELLED:', mouseDistanceTravelled, ' AFTER:', timeoutDuration+'ms');
		if (mouseDistanceTravelled <= 8.0) {
			hoverlyticsChangeTargetPageLink(link);
			hoverlyticsCancelTargetingLink(link);
		}
		else {
			mouseDistanceTravelled = 0;
		}
	});
	
	var timeoutDuration = hoverlyticsPageViewer.pageLinkTimeoutDuration;
	//var timeout = setTimeout(function() {
	var timeout = setInterval(function() {
		link.trigger('hoverlyticsCheckMouse');
	}, timeoutDuration);
	link.data('hoverlyticsTimeout', timeout);
}

function hoverlyticsCancelTargetingLink(link)
{
	var timeout = link.data('hoverlyticsTimeout');
	//DEBUG && console.log('HOVERLYTICS MOUSE EXITED LINK', ' TIMEOUT: ', timeout);
	if (timeout) {
		//clearTimeout(timeout);
		clearInterval(timeout);
	}
	
	link.data('hoverlyticsMouseIsTargeting', false);
	link.off('.hoverlyticsChecking');
}

function hoverlyticsChangeTargetPageLink(link)
{
	hoverlyticsPageViewer.$holder.addClass('messagePassed');
	//DEBUG && console.log('CHANGE TRGET PAGE', link);
	if (hoverlyticsPageViewer.getEnabled()) {
		if (hoverlyticsPageViewer.proxy) {
			var url = typeof (link) === 'string' ? link : link.attr('href');
			//DEBUG && console.log('SENDING MESSAGE TO PAGE VIEWER');
			hoverlyticsPageViewer.proxy.post({changePageURL: url});
			
			hoverlyticsPageViewerChangeActive(true);
			
			
			//$('.hoverlyticsActiveLink').removeClass('hoverlyticsActiveLink');
			//link.addClass('hoverlyticsActiveLink');
		}
		else {
			hoverlyticsPageViewer.linkToLoad = link;
		}
	}
}

function hoverlyticsPageViewerReceivedMessage(message)
{
	//console.log('PLUGIN RECEIVED', message);
	
	if (!message || !message.data) {
		return;
	}
	
	if (message.data.viewsReady) {
		var enabledSections = hoverlyticsPageViewer.getEnabledSections();
		hoverlyticsPageViewer.proxy.post({enabledSections: enabledSections});
		
		// If user has already hovered over a link, everything is ready so load it now.
		if (hoverlyticsPageViewer.linkToLoad) {
			hoverlyticsChangeTargetPageLink(hoverlyticsPageViewer.linkToLoad);
		}
	}
	else if (message.data.newProfileIDSelected) {
		var profileID = message.data.newProfileIDSelected;
		hoverlyticsPageViewer.setGoogleAnalyticsProfileID(profileID);
	}
	else if (message.data.needsUser) {
		hoverlyticsPageViewerChangeActive(true);
	}
	else if (message.data.changeHeight) {
		var newHeight = message.data.changeHeight;
		//hoverlyticsPageViewerChangeHeight(newHeight);
	}
	else if (message.data.wantsBottomFullWidthPanel) {
		hoverlyticsPageViewerChangeToBottomFullWidthPanel();
	}
	else if (message.data.sectionIsEnabledChanged) {
		var options = message.data.sectionIsEnabledChanged;
		hoverlyticsPageViewer.changeSectionIsEnabled(options.sectionID, options.isEnabled);
	}
}