"Copyright 2013-2014 Patrick Smith"


$ = window.jQuery


class HoverlyticsPageViewer


class HoverlyticsPageViewer.Settings
	constructor:
		@linkToLoad = null
		@defaultAlignment = 'left'
	
	
	settingsDidChange: ->
		$.cookie('hoverlyticsSettingsDidChange', '1', {expires: 356 * 5, path: "/"})
		return
	
	getEnabled: ->
		unless @_enabled?
			@_enabled = $.cookie('hoverlyticsPageViewerEnabled') isnt '0'
		
		return @_enabled
	
	setEnabled: (newEnabled) ->
		jQuery.cookie('hoverlyticsPageViewerEnabled', if newEnabled then '1' else '0')
		
		@_enabled = newEnabled
		return
	
	getAlignment: ->
		unless @_alignment?
			@_alignment = $.cookie('hoverlyticsPageViewerAlignment') or this.defaultAlignment
		
		return @_alignment
	
	setAlignment: (newAlignment) ->
		previousAlignment = @_alignment or null
		if @_alignment is newAlignment
			return
		
		$.cookie('hoverlyticsPageViewerAlignment', newAlignment, {expires: 356 * 5, path: "/"})
		@settingsDidChange()
		
		@_alignment = newAlignment;
		
		@updateAlignment({previousAlignment: previousAlignment})
	
	
	updateAlignment: ->