var running = false;
var eventQueue = null;
var indicator = null;

function JsMovie(dom) {
	var me = this;
	this.scenes = [];
	this.dom = dom;
	this.si = 0; //当前场景index
	this.fi = 0; //当前帧index
	this._events = {};

	this.scrollTimer = null;
	this.initialize();
}

JsMovie.prototype.initialize = function () {
	var me = this;
	this.scenes = parseDomTree();
	var indicator = this.indicator = new Indicator(this.dom, this.scenes);
	indicator.on('click', function (e) {
		me.play(e.data.sceneIndex, e.data.frameIndex);
	});

	$('body').on("mousewheel", function (e) {
		if (me.scrollTimer) {
			clearTimeout(me.scrollTimer);
		}
		me.scrollTimer = setTimeout(function () {
			mouseWheelHandler(e);
		}, 100);
	});

	var times = 0;

	function mouseWheelHandler(e) {
		//神奇的遨游浏览器内核是wheelDeltaY
		var dy = e.originalEvent.deltaY || e.originalEvent.wheelDelta || -e.originalEvent.wheelDeltaY;
		// var dy = e.deltaY;
		var direction = dy > 0 ? 1 : -1;

		var cur = me.scenes[me.si],
			curf = cur.frames[me.fi];
		var tar = curf.dom.get(0);

		var maxScrollTop = tar.scrollHeight - tar.offsetHeight;
		console.log(tar.scrollTop, tar.maxScrollTop);
		if (direction > 0 && tar.scrollTop < maxScrollTop) {
			times = 0;
			return;
		} else if (direction < 0 && tar.scrollTop > 0) {
			times = 0;
			return;
		} else if (maxScrollTop != 0) {
			if (times > 1) {
				e.preventDefault();
				e.stopPropagation();
				eventHandler(direction);
				times = 0;
			} else {
				times++;
			}
		} else {
			e.preventDefault();
			e.stopPropagation();
			eventHandler(direction);
		}
	}

	$('body').on('keydown', function (e) {
		if (e.which == 38) {
			eventHandler(-1); //向上
		} else if (e.which == 40) {
			eventHandler(1); //向下
		}
	});

	function eventHandler(direction) {
		if (running) {
			eventQueue = direction;
			return;
		} else {
			var res = caculateSceneFrame(direction);
			if (res[0] != undefined && res[1] != undefined) {
				me.play.apply(me, res);
			}
		}
	}

	function caculateSceneFrame(direction) {
		var cur = me.scenes[me.si],
			curf = cur.frames[me.fi];
		var sn, fn, type, dir = 1 * direction;

		var multiFrame = cur.frames.length > 1;
		if (multiFrame) {
			if (me.fi + dir >= 0 && me.fi + dir < cur.frames.length) {
				sn = me.si;
				fn = me.fi + dir;
			} else {
				if (me.si + dir < me.scenes.length && me.si + dir >= 0) {
					sn = me.si + dir;
					fn = dir > 0 ? 0 : me.scenes[sn].frames.length - 1;
				}
			}
		} else {
			if (me.si + dir >= 0 && me.si + dir < me.scenes.length) {
				sn = me.si + dir;
				fn = dir > 0 ? 0 : me.scenes[sn].frames.length - 1;;
			}
		}
		return [sn, fn];
	}
}

JsMovie.prototype.play = function (sn, fn) {
	if (running) return;

	var me = this;
	sn = sn ? parseInt(sn) : 0;
	fn = fn ? parseInt(fn) : 0;
	var scn = this.scenes[this.si],
		dest = this.scenes[sn];

	var cur = scn.frames[this.fi],
		df = dest.frames[fn];

	running = true;
	var bp = this._events['before_play'];
	bp && bp(dest, df);

	if (sn > this.si) {
		//向后翻页
		var d1 = scn.render('backward', 'out');
		var d2 = df.render('static');
		var d3 = dest.render('backward', 'in');

		$.when(d1, d2, d3).done(function () {
			finish();
		});

	} else if (sn < this.si) {
		//向前翻页
		var d1 = scn.render('forward', 'out');
		var d2 = df.render('static');
		var d3 = dest.render('forward', 'in');

		$.when(d1, d2, d3).done(function () {
			finish();
		});

	} else if (sn == this.si && fn != this.fi) {
		//翻子页
		cur = scn.frames[this.fi];
		df = scn.frames[fn];
		if (fn < this.fi) {
			var d1 = cur.render('forward', 'out');
			var d2 = df.render('forward', 'in');

			$.when(d1, d2).done(function () {
				finish();
			});
		} else {
			var d1 = cur.render('backward', 'out');
			var d2 = df.render('backward', 'in');

			$.when(d1, d2).done(function () {
				finish();
			});
		}
	} else {
		if (sn == 0 && fn == 0) {
			//初始化
			dest.render('static');
			df.render('static');
		}
		finish();
	}

	function finish() {
		running = false;
		finishTask();
		var ap = me._events['after_play'];
		ap && ap(sn, dest, df);
	}

	me.indicator.update(sn, fn);

	this.si = sn;
	this.fi = fn;
};

JsMovie.prototype.next = function () {
	var next = this.si + 1;
	if (next >= this.scenes.length) {
		return;
	}
	this.play(this.si + 1, 0);
};

JsMovie.prototype.prev = function () {
	var prev = this.si - 1;
	if (prev < 0) {
		return;
	}
	this.play(this.si - 1, 0, 0);
};

JsMovie.prototype.on = function (event, func) {
	this._events[event] = func;
};

function finishTask() {
	if (!running) {
		if (eventQueue) {
			var e = $.Event("keydown");
			e.which = eventQueue == 1 ? 40 : 38; //向下键
			$('body').trigger(e);
			eventQueue = 0;
		}
	}
}

function parseDomTree() {
	var scenes = [];
	$('.scene').each(function (index, item) {
		scenes.push(parseScene(item));
	});
	return scenes;
}


function parseScene(scene) {
	var frames = [];
	var $scene = $(scene);
	var w = $scene.width(),
		h = $scene.height();

	//$scene.css({width: w, height: h});
	var animType = $scene.attr('animType') || 'vertical';
	var animTime = $scene.attr('time') || 1000;
	var id = $scene.attr('sceneId');
	var name = $scene.attr('name');

	var frms = $scene.find('.frame');
	if (frms.length == 1) {
		var f = parseFrame($(frms[0]), 'frame');
		frames.push(f)
	} else if (frms.length > 1) {
		$.each(frms, function (idx, itm) {
			var sf = parseFrame($(itm), 'segment');
			frames.push(sf);
		});
	}
	return new Scene(id, name, $scene, frames, animType, animTime);
}

function parseFrame(dom, frameType) {
	var name = dom.attr('name') || '';
	var animType = dom.attr('animType') || 'vertical';
	var animTime = dom.attr('time') || 500;
	var delay = dom.attr('delay') || 0;
	return new Frame(dom, name, frameType, animType, animTime, delay);
}