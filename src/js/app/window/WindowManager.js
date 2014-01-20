define([
	'exports',
	'file/File',
	'file/Recents'
], function(exports, File, Recents) {

	var gui = require('nw.gui');

	var windows = {},
		windowsByFile = {},
		openning = false,
		realCount = 0,
		shadowCount = 0,
		gapX = 0,
		gapY = 0;

	var config = store.get('Window') || {};
	var generalOpt = store.get('General');
	var top = config.y || 20,
		left = config.x || 20;

	function _updateStore() {
		config = store.get('Window') || {};
	}

	function getWindowByFile(name) {
		for (var prop in windows) {
			if (windows[prop].file.get('fileEntry') == name) {
				return windows[prop];
			}
		}

		return;
	}

	function _add(newWin) {
		exports.actived = windows[newWin.created_at] = newWin;

		realCount++;

		newWin.on('closed', function() {
			this.file.close();
			
			for (var prop in windows) {
				if (prop == this.created_at) {
					windows[prop] = null;
					delete windows[prop];
					realCount--;

					if (!realCount/* && getPlatformName() != 'mac'*/) {
						config = store.get('Window');
						window.ee.emit('exit');
					}
					return;
				}
			}
		});

		/* open file */
		newWin.on('file.open', function(fileEntry) {
			var file = File.open(fileEntry);

			open(file);
			Recents.add(fileEntry);
		});

		newWin.on('file.saved', function(file) {
			Recents.add(file.fileEntry);
		});

		//window instance delivery to child window
		newWin.once('loaded', function() {
			_updateStore();

			shadowCount++;

			//윈도우 오픈 시 position 파라미터가 존재하면 위치 지정은 패스한다.
			// if (newWin._params.position) {
			// 	return;
			// }

			if (config.height + top > window.screen.height) {
				top = 20;
			}

			if (config.width + left > window.screen.width) {
				left = 20;
			}

			if (realCount > 1) {
				left = left + 20;
				top = top + 20;
			}

			if (!top && !left) {
				this.setPosition('center');
				top = this.x;
				left = this.y;
			} else {
				this.moveTo(left, top);
			}
		});
	}

	function open(file) {
		var fileEntry, newWin, activedWin = exports.actived;

		file = (typeof file === 'string') ? File.open(file) : file;
		fileEntry = file && file.get('fileEntry');

		//이미 열려 있는 파일 일 경우
		var existWin = getWindowByFile(fileEntry);

		if (fileEntry && existWin) {
			existWin.focus();
			return;
		}

		//TODO
		// if (activedWin) {
		// 	var fo = activedWin.file.toJSON();

		// 	if (fo.fileEntry === undefined && fo.markdown === undefined) {
		// 		activedWin.file.set(file.toJSON());
		// 		return;
		// 	}
		// }

		newWin = gui.Window.open('pad.html', gui.App.manifest.window);
		newWin.parent = window;
		newWin.file = file || File.open();
		newWin.created_at = new Date().getTime();
		
		_add(newWin);

		return newWin;
	}

	process.on('actived', function(child) {
		exports.actived = child;

		openning = false;
	});

	exports.open = open;

});