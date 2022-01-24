COMPONENT('autoexec', 'delay:0;init:0;manually:0;input:1', function(self, config) {

	var delay = null;
	var track = [];

	self.readonly();

	var exec = function() {
		config.exec && self.EXEC(config.exec, self.element, self.get());
	};

	self.configure = function(key, value) {
		switch (key) {
			case 'track':
				track = value.split(',').trim();
				break;
		}
	};

	self.setter = function(value, path, type) {

		var is = false;

		if ((type === 1 || type === 2) && track.length) {
			for (var p of track) {
				if (path.indexOf(p) !== -1) {
					is = true;
					break;
				}
			}
			if (!is)
				return;
		}

		switch (type) {
			case 0:
				if (!config.init)
					return;
				break;
			case 1:
			case 3:
				if (!config.manually)
					return;
				break;
			case 2:
				if (!config.input)
					return;
				break;
		}

		if (config.delay) {
			delay && clearTimeout(delay);
			delay = setTimeout(exec, config.delay);
		} else
			exec(value);
	};

});