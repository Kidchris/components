COMPONENT('validation', 'delay:100;flags:visible;changes:0;strictchanges:0', function(self, config, cls) {

	var elements = null;
	var def = 'button[name="submit"]';
	var flags = null;
	var tracked = false;
	var reset = 0;
	var old, track;
	var currentvalue;

	self.readonly();

	self.make = function() {
		elements = self.find(config.selector || def);
	};

	self.configure = function(key, value, init) {
		switch (key) {
			case 'selector':
				if (!init)
					elements = self.find(value || def);
				break;
			case 'flags':
				if (value) {
					flags = value.split(',');
					for (var i = 0; i < flags.length; i++)
						flags[i] = '@' + flags[i];
				} else
					flags = null;
				break;
			case 'track':
				track = value.split(',').trim();
				break;
		}
	};

	var settracked = function() {
		tracked = 0;
	};

	var backup = null;
	var current = null;

	self.setter = function(value, path, type) {

		currentvalue = value;
		var is = path === self.path || path.length < self.path.length;

		if (config.changes) {
			current = STRINGIFY(value, config.strictchanges != true);
			if (is)
				backup = current;
			else
				is = backup === current;
		}

		if (reset !== is) {
			reset = is;
			self.tclass(cls + '-modified', !reset);
		}

		if ((type === 1 || type === 2) && track && track.length) {
			for (var i = 0; i < track.length; i++) {
				if (path.indexOf(track[i]) !== -1) {
					tracked = 1;
					return;
				}
			}
			if (tracked === 1) {
				tracked = 2;
				setTimeout(settracked, config.delay * 3);
			}
		}
	};

	var check = function() {

		var path = self.path.replace(/\.\*$/, '');
		var disabled = tracked || config.validonly ? !VALID(path, flags) : DISABLED(path, flags);

		if (!disabled && config.if)
			disabled = !EVALUATE(path, config.if);

		if (!disabled && config.changes && backup === current)
			disabled = true;

		if (disabled !== old) {
			elements.prop('disabled', disabled);
			self.tclass(cls + '-ok', !disabled);
			self.tclass(cls + '-no', disabled);
			old = disabled;
			if (!old && config.exec)
				self.SEEX(config.exec, currentvalue);
			config.output && self.SEEX(config.output, !disabled);
		}

	};

	self.state = function(type, what) {
		if (type === 3 || what === 3) {
			self.rclass(cls + '-modified');
			tracked = 0;
			backup = current;
		}
		setTimeout2(self.ID, check, config.delay);
	};

});