var Animation = {
	vertical: {
		forward: {
			'in': function (dom, time, func) {
				var h = dom.height();
				dom.css('top', -h);
				dom.animate({
					top: 0
				}, time, 'swing', function () {
					func();
				});
			},

			'out': function (dom, time, func) {
				var h = dom.height();
				dom.css('top', 0);
				setTimeout(function () {
					dom.animate({
						top: h
					}, time - 200, 'swing', function () {
						func();
					});
				}, 200);
			}
		},
		backward: {
			'in': function (dom, time, func) {
				var h = dom.height();
				dom.css('top', h);
				dom.animate({
					top: 0
				}, time, 'swing', function () {
					func();
				});
			},

			'out': function (dom, time, func) {
				var h = dom.height();
				dom.css('top', 0);
				setTimeout(function () {
					dom.animate({
						top: -h
					}, time - 200, 'swing', function () {
						func();
					});
				}, 200);
			}
		}
	},

	horizontal: {
		forward: {
			'in': function (dom, time, func) {
				var w = dom.width();
				dom.css('left', -w);
				dom.animate({
					left: 0
				}, time, 'swing', function () {
					func();
				});
			},

			'out': function (dom, time, func) {
				var w = dom.width();
				dom.css('left', 0);
				setTimeout(function () {
					dom.animate({
						left: w
					}, time - 200, 'swing', function () {
						func();
					});
				}, 200);
			}
		},
		backward: {
			'in': function (dom, time, func) {
				var w = dom.width();
				dom.css('left', w);
				dom.animate({
					left: 0
				}, time, 'swing', function () {
					func();
				});
			},

			'out': function (dom, time, func) {
				var w = dom.width();
				dom.css('left', 0);
				setTimeout(function () {
					dom.animate({
						left: -w
					}, time - 200, 'swing', function () {
						func();
					});
				}, 200);
			}
		}
	}
};

var Animate = {
	state: 'stop',
	fps: 40,
	start: function (time, render, finish) {
		var me = this;
		var st = new Date().getTime(),
			et = st + parseInt(time);

		execute();

		function execute() {
			var nd = new Date().getTime();
			if (nd > et) {
				finish(1);
			} else {
				render((nd - st) / time);
				requestAnimationFrame(execute);
			}
		}
	}
}