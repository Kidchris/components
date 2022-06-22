COMPONENT('leaflet', 'height:200;zoom:11;draggable:0;marker:1;margin:0;maxzoom:19', function(self, config, cls) {

	var meta = { markers: [] };
	var skip = false;
	var skipmove = false;

	self.readonly();
	self.nocompile();

	self.destroy = function() {
		for (var m of meta.markers)
			m.remove();
		meta.map.off();
		meta.map.remove();
		meta.markers = null;
		meta.map = null;
		meta.marker = null;
	};

	self.meta = meta;
	self.make = function() {

		self.aclass(cls);
		self.append('<div></div>');
		meta.container = self.find('div')[0];

		if (config.height > 0)
			$(meta.container).css('height', config.height);

		meta.map = L.map(meta.container);
		meta.tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: config.maxzoom, attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>' }).addTo(meta.map);

		var onmove = function() {

			if (skipmove) {
				skipmove = false;
				return;
			}

			if (config.move) {
				var pos = meta.map.getCenter();
				self.SEEX(config.move, pos.lat + ',' + pos.lng, meta.map.getZoom());
			}

		};

		meta.map.on('moveend', onmove);
		meta.map.on('zoomend', onmove);

		self.on('resize + resize2', self.resize);
		self.resize();
	};

	self.resize = function() {
		setTimeout2(self.ID, self.resizeforce, 300);
	};

	self.resizeforce = function() {

		var height = config.height;

		if (typeof(height) === 'string')
			height = self.parent(config.height).height() - config.margin;

		if (meta.height !== height) {
			meta.height = height;
			$(meta.container).css('height', height);
			meta.map.invalidateSize();
		}
	};

	self.addmarker = function(pos, name, opt) {
		// opt.draggable = true;
		var gps = self.parse(pos);
		var item = L.marker(gps.slice(0, 2), opt);
		name && item.bindPopup(name);
		meta.markers.push(item);
		item.addTo(meta.map);
		return item;
	};

	self.parse = function(pos) {
		var tmp = pos.split(',').trim();
		tmp[0] = parseFloat(tmp[0]);
		tmp[1] = parseFloat(tmp[1]);
		tmp[2] = tmp[2] ? parseInt(tmp[2]) : config.zoom;
		return tmp;
	};

	self.center = function(pos) {
		var gps = self.parse(pos);
		meta.map.setView(gps.slice(0, 2), gps[2]);
	};

	self.search = function(name, callback) {
		AJAX('GET https://nominatim.openstreetmap.org/search?format=json&q=' + encodeURIComponent(name), function(response) {
			if (response instanceof Array) {
				for (var item of response) {
					item.pos = item.lat + ',' + item.lon;
					item.name = item.display_name;
					item.id = item.place_id;
				}
			}
			callback(response);
		});
	};

	self.marker = function(pos) {
		if (config.marker) {
			if (meta.marker) {
				meta.marker.setLatLng(pos);
			} else {

				var opt = {};

				if (config.draggable)
					opt.draggable = true;

				if (config.icon) {

					var iconopt = {};
					iconopt.iconUrl = config.icon;

					if (config.iconanchor)
						iconopt.iconAnchor = self.parse(config.iconanchor);

					if (config.iconsize)
						iconopt.iconSize = self.parse(config.iconsize);

					opt.icon = new L.Icon(iconopt);
				}
				meta.marker = L.marker(pos, opt);
				meta.marker.addTo(meta.map);
				meta.markers.push(meta.marker);
				meta.marker.on('click', function(e) {
					config.click && self.SEEX(config.click, e.latlng.lat + ',' + e.latlng.lng, e);
				});
				meta.marker.on('moveend', function(e) {
					skip = true;
					var pos = e.target._latlng;
					self.set(pos.lat + ',' + pos.lng);
				});
			}
		}
	};

	self.setter = function(value) {

		if (skip) {
			skip = false;
			return;
		}

		var address = config.center;

		if (value) {
			// check
			var tmp = value.replace(/\.|,|\s/g, '');
			if (!(/^\d+$/).test(tmp)) {
				address = value;
				value = '';
			}
		}

		if (value) {

			skipmove = true;
			var pos = self.parse(value);
			meta.map.setView(pos.slice(0, 2), pos[2]);
			self.marker(pos);

		} else {
			if (address) {
				self.search(address, function(response) {
					var item = response[0];
					if (item) {
						var gps = self.parse(item.pos);
						var pos = gps.slice(0, 2);
						meta.map.setView(pos, gps[2]);
						self.marker(pos);
						skip = true;
						self.set(item.pos);
					}
				});
			}
		}

	};

}, ['https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.8.0/leaflet.min.css', 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.8.0/leaflet.min.js']);