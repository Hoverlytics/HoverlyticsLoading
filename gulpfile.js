var gulp = require('gulp');
gulp.on('err', function(e) {
	console.log(e.err.stack);
});

///////////////////////////////////////////////////////////////////

var version = 3;

var guilty = require('guilty-gulp')({
	taskNameGroup: 'main'
});

guilty.requireTask('images');
guilty.requireTask('compass', {
	srcFilePath: 'main.scss',
	destCSSPath: './',
	dependencies: guilty.taskName([
		'images'
	])
});

guilty.requireTask('js-each', {
	srcPathGlob: '{bookmarklet,bookmarklet-dev}.js',
	destPath: './'
});

guilty.requireTask('js-browserify', {
	taskName: 'js-go',
	srcFilePath: 'go.js',
	destFilePath: 'go.js',
	browserifySetUpCallback: function(browserify) {
		var configFilePath = guilty.isProduction ? './-config/config-prod.js' : './-config/config-dev.js';
		browserify.require(configFilePath, {expose: 'hoverlytics-config'});
	}
});


guilty.requireTask('js-browserify', {
	taskName: 'js-main-including-jquery',
	srcFilePath: 'client-main-including-jquery.js',
	destFilePath: 'client-main-including-jquery.js',
	browserifySetUpCallback: function(browserify) {
		var configFilePath = guilty.isProduction ? './-config/config-prod.js' : './-config/config-dev.js';
		browserify.require(configFilePath, {expose: 'hoverlytics-config'});
	}
});

guilty.requireTask('js-browserify', {
	taskName: 'js-main-without-jquery',
	srcFilePath: 'client-main-without-jquery.js',
	destFilePath: 'client-main-without-jquery.js'
});


// Main
gulp.task(
	guilty.taskNameGroup,
	guilty.taskName([
		'compass',
		'js-each',
		'js-go',
		'js-main-including-jquery',
		'js-main-without-jquery'
	])
);


// Default
gulp.task(
	'default',
	[
		guilty.taskNameGroup
	]
);

// Watch
gulp.task(
	'watch',
	[
		guilty.taskNameGroup,
		guilty.taskName('watch')
	]
);