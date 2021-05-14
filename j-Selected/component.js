COMPONENT('selected', 'class:selected;selector:a;attr:if;attror:or', function(self, config) {

	self.readonly();

	self.configure = function(key, value) {
		switch (key) {
			case 'datasource':
				self.datasource(value, function() {
					setTimeout(self.refresh, 50);
				});
				break;
		}
	};

	self.setter = function(value) {
		var cls = config.class;
		self.find(config.selector).each(function() {
			var el = $(this);
			var or = el.attrd(config.attror) || '';
			if (el.attrd(config.attr) === value || (or && or.indexOf(value) !== -1))
				el.aclass(cls);
			else
				el.hclass(cls) && el.rclass(cls);
		});
	};
});