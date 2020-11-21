COMPONENT('minheight', 'parent:auto;margin:0;attr:min-height', function(self, config, cls) {

	var timeout;

	self.readonly();

	self.make = function() {
		self.aclass(cls);
		self.on('resize2', self.resize);
		self.resizeforce();
	};

	self.resize = function() {
		timeout && clearTimeout(timeout);
		timeout = setTimeout(self.resizeforce, 200);
	};

	self.resizeforce = function() {

		var parent = self.parent(config.parent);
		var h = parent.height() - config.margin;

		if (config.topoffset)
			h -= self.element.offset().top;

		if (config.topposition)
			h -= self.element.position().top;

		self.css(config.attr, h);
	};

});