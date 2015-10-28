/**
 * Provides requestAnimationFrame in a cross browser way.
 * http://paulirish.com/2011/requestanimationframe-for-smart-animating/
 */

if ( !window.requestAnimationFrame ) {

	window.requestAnimationFrame = ( function() {

		return window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame || // comment out if FF4 is slow (it caps framerate at ~30fps: https://bugzilla.mozilla.org/show_bug.cgi?id=630127)
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element ) {

			window.setTimeout( callback, 1000 / 60 );

		};

	} )();

}
;var Animation = {
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
};function AnimateObject(dom, animType, time, delay, from, to){
	this.dom = dom;
	this.animType = animType;
	this.time = time;
	this.delay = delay;
	this.from = from;
	this.to = to;

	this.dom.css('top', this.from*$(window).height());
}
AnimateObject.prototype.render = function(direction, action, pos, step, func){
	var anim = AO_animate[this.animType];

	anim[action](this.dom, this.time, this.delay, this.from, this.to, pos, step, function(){
		finishTask();
		func && func();
	});
}

var AO_animate = {
	textVScroll: {
		'in': function(dom, time, delay, from, to, pos, step, func){
			var h = $(window).height();
				ff = from*h,
				ft = to*h;
			var offset = ff + Math.abs(ft-ff)*pos;

			setTimeout(function(){
				dom.animate({top: offset}, time, function(){
					func();
				});
			}, delay);
		},
		'out': function(dom, time, delay, from, to, pos, step, func){
			var h = $(window).height();
				ff = from*h,
				ft = to*h;
			var offset = ff + Math.abs(ft-ff)*pos;

			dom.animate({top: offset}, time, function(){
				func();
			});
		}
	},

	sine: {
		'in': function(dom, time, delay, from, to, pos, step, func){
			var w = $(window).width(),
				h = $(window).height(),
				hdw = dom.width()/2,
				hdh = dom.height()/2;

			var offsetX = dom.attr('offsetX');
			if(!offsetX){
				offsetX = Math.random()*w/4;
				dom.attr('offsetX', offsetX);
			}

			var sin = dom.attr('sineIn');
			if(!sin){
				sin = Math.round(Math.random()*1)+1;
				dom.attr('sineIn', sin);
			}
			
			setTimeout(function(){
				Animate.start(2000, function(value){
					var p = value;
					var ponit = sineInFunc['sine'+sin](p, offsetX, w, h);
					// dom.css({left: ponit[0], top: ponit[1], transform: 'scale(0.1, 0.1)'});
					dom.css({left: ponit[0]-hdw, top: ponit[1]-hdh, transform: 'scale('+p+', '+p+')', opacity: p});
				}, function(){
					func();
				});
			}, delay);
		},
		'out': function(dom, time, delay, from, to, pos, step, func){
			
			var w = $(window).width(),
				h = $(window).height(),
				hdw = dom.width()/2,
				hdh = dom.height()/2;

			var offsetX = dom.attr('offsetX');
			if(!offsetX){
				offsetX = Math.random()*w/4;
				dom.attr('offsetX', offsetX);
			}

			var outSin = dom.attr('sineOut');
			if(!outSin){
				outSin = Math.round(Math.random()*3)+1;
				dom.attr('outSin', outSin);
			}
			
			setTimeout(function(){
				Animate.start(1000, function(value){
					var p = value;
					var ponit = sineOutFunc['sine'+outSin](p, offsetX, w, h);
					// dom.css({left: ponit[0], top: ponit[1], transform: 'scale(0.1, 0.1)'});
					dom.css({left: ponit[0]-hdw, top: ponit[1]-hdh, transform: 'scale('+(p+1)+', '+(p+1)+')', opacity: 1-p});
				}, function(){
					func();
				});
			}, delay);
		}
	},

	count: {
		'in': function(dom, time, delay, from, to, pos, step, func){
			if(pos != 1) return;
			var n = 0, size = to.toString().length, st = 1, cp = 0;
			function countUp(){
				if(size>=3){
					st = Math.pow(10, size-cp-2);
					if(n >= to){
						func();
						return;
					}else if(n.toString().length == size){
						var res = 0;
						for(var i=0; i<size; i++){
							if(n.toString().charAt(i) == to.toString().charAt(i)){
								res++;
							}else{
								break;
							}
						}
						if(res-cp-1>0){
							cp++;
							st = Math.pow(10, size-cp-2);
						}
					}
					n += st;
					dom.html(n);
					requestAnimationFrame(countUp);
				}else{
					if(n <= to){
						n++;
						dom.html(n-1);
						requestAnimationFrame(countUp);
					}else{
						func();
					}
				}
			}
			setTimeout(countUp, delay);
		},
		'out': function(dom, time, delay, from, to, pos, step, func){
			var me = this;
			me['in'](dom, time, delay, from, to, pos, step, func);
		}
	}
};

function randomX(step){
	var seg = 1/step,
		n1 = Math.random()*seg,
		w = $(window).width()/seg;
	return n1*w-w/2;
}

function formatNumber(n, size){
	var temp = [];
	var str = ((Math.pow(10, size+1) + n) +'').slice(1);
	for(var i=0; i<size; i++){
		temp.push('<b>'+str.charAt(i)+'</b>');
	}
	return temp.join('');
}

var sineInFunc = {
	sine1: function(pos, sx, w, h){
		var c = w/2-sx;
		var x = parseInt(sx) + c*pos,
			theta = pos*Math.PI;
		var y = h/4 * (1- Math.cos(theta));
		return [x, y];
	},

	sine2: function(pos, sx, w, h){
		var c = w/2-sx;
		var x = w - c*pos,
			theta = -pos*Math.PI;
		var y = h/4 * (1- Math.cos(theta));
		return [x, y];
	}
};

var sineOutFunc = {
	sine1: function(pos, sx, w, h){
		var c = w/2-sx;
		var x = parseInt(sx) + c*(1-pos),
			theta = -pos*Math.PI;
		var y = h/4 + h/4 * Math.cos(theta);
		return [x, y];
	},

	sine2: function(pos, sx, w, h){
		var c = w/2-sx;
		var x = w/2 + c*pos,
			theta = pos*Math.PI;
		var y = h/4 + h/4 * Math.cos(theta);
		return [x, y];
	},

	sine3: function(pos, sx, w, h){
		var c = w/2-sx;
		var x = w/2 + c*pos,
			theta = pos*Math.PI;
		var y = h/2 + h/4 * (1- Math.cos(theta));
		return [x, y];
	},

	sine4: function(pos, sx, w, h){
		var c = w/2-sx;
		var x = parseInt(sx) + c*(1-pos),
			theta = -pos*Math.PI;
		var y = h/2 + h/4 * (1- Math.cos(theta));
		return [x, y];
	}
};;function Scene(id, name, dom, frames, animType, time){
	this.id = id;
	this.name = name;
	this.dom = dom;
	this.frames = frames;
	this.animType = animType;
	this.time = time;
}
Scene.prototype.render = function(direction, action){
	var dtd = $.Deferred(); 
	var anim = Animation[this.animType];
	var me = this;

	if(action == "in"){
		me.dom.css('z-index', 10);
		me.dom.show();
	}else{
		me.dom.css('z-index', 1);
	}

	if(direction == 'static'){
		me.dom.css('z-index', 10);
		me.dom.show();
		dtd.resolve();
		return;
	}
	anim[direction][action](this.dom, this.time, function(){
		if(action == "out"){
			me.dom.hide();
			me.dom.css('z-index', 0);
		}
		dtd.resolve();
	});
	return dtd.promise();
};function Frame(dom, name, frameType, animType, time, delay){
	this.dom = dom;
	this.name = name;
	this.frameType = frameType;
	this.animType = animType || 'linear';
	this.time = time;
	this.delay = delay || 0;
}
Frame.prototype.render = function(direction, action){
	var dtd = $.Deferred();
	var anim = Animation[this.animType];
	var me = this;

	switch(direction){
		case 'backward':
		case 'forward':
			if(action == 'in'){
				me.dom.css('z-index', 10);
				me.dom.show();
			}else{
				me.dom.css('z-index', 1);
			}
			anim[direction][action](me.dom, me.time, function(){
				if(action == 'out'){
					me.dom.hide();
					me.dom.css('z-index', 0);
				}
				dtd.resolve();
			});
		break;

		case 'static':
			me.dom.css('top', 0);
			me.dom.show();
			dtd.resolve();
		break;
	}
	return dtd.promise();
};;function Indicator(parent, data){
	var me = this;
	this._data = data;
	this.parent = parent;
	this._events = {};
	
	this.si = 0; //当前scene
	this.fi = 0; //当前frame

	var ind = $('<div id="indicator"></div>').appendTo(parent);
	var subInd = $('<div id="sub-indicator"></div>').appendTo(parent);
	ind.delegate('.frameIndicator', 'click', function(e){
		var tar = $(this);
		var si = tar.attr('si') || 0;
		var ck = me._events['click'];
		me.select(si, 0);
		ck && ck({data: {
			sceneIndex: si,
			frameIndex: 0
		}});
	});
	ind.delegate('.segmentIndicator', 'click', function(e){
		var tar = $(this);
		var fi = tar.attr('fi') || 0;
		var ck = me._events['click'];
		me.select(me.si, fi);
		ck && ck({data: {
			sceneIndex: me.si,
			frameIndex: fi
		}});
	});
	subInd.delegate('li', 'click', function(e){
		var tar = $(this);
		var fi = tar.attr('fi') || 0;
		var ck = me._events['click'];
		me.select(me.si, fi);
		ck && ck({data: {
			sceneIndex: me.si,
			frameIndex: fi-0
		}});
	});

	ind.delegate('li', 'mouseover', function(e){
		var tar = $(this), pos = tar.offset();
		var tit = $('<div class="indicator-title"></div>').appendTo(tar);
		tit.text(tar.attr('data-title'));
	});

	ind.delegate('li', 'mouseout', function(e){
		var tar = $(this);
		tar.find('.indicator-title').remove();
	});

	this.dom = ind;
	this.subDom = subInd;

	this._create();
}

Indicator.prototype._create = function(){
	var me = this;
	var current = me.current;
	var curScene = me._data[current];

	var ind = me.dom.empty();
	var subInd = me.subDom.empty();

	$.each(me._data, function(idx, item){
		if(item.frames.length>1){
			var fmi = $('<ul class="indicator-group"></ul>').appendTo(ind);
			var fid = $('<li class="frameIndicator" si="'+idx+'" data-title="'+item.name+'"></li>').appendTo(fmi);
			
			if(idx == me.si){
				if(item.animType == "horizontal"){
					$.each(item.frames, function(fidx, fItem){
						var sfmi = $('<ul class="indicator-group"></ul>').appendTo(subInd);
						var sfid = $('<li class="segmentIndicator" fi="'+fidx+'"></li>').appendTo(sfmi);
						if(fidx == me.fi){
							sfid.addClass('on');
							fid.addClass('on');
						}
					});
				}else{
					$.each(item.frames, function(fidx, fItem){
						var sfmi = $('<ul class="indicator-group"></ul>').appendTo(ind);;
						var sfid = $('<li class="segmentIndicator" fi="'+fidx+'" data-title="'+fItem.name+'"></li>').appendTo(sfmi);
						if(fidx == me.fi){
							sfid.addClass('on');
						}
					});
				}
			}
		}else{
			var fmi = $('<ul class="indicator-group"></ul>').appendTo(ind);
			var fid = $('<li class="frameIndicator" si="'+idx+'" data-title="'+item.name+'"></li>').appendTo(fmi);
			if(idx == me.si){
				fid.addClass('on');
			}
		}
	});

	me.dom.css('top', (me.parent.height()-me.dom.height())/2);
	me.subDom.css('left', (me.parent.width()-me.subDom.width())/2);
};

Indicator.prototype.select = function(si, fi){
	// var lis = this.dom.find('li');
	// lis.removeClass('on');
	// $(lis[si]).addClass('on');

	// var slis = this.subDom.find('li');
	// if(slis.length>0){
	// 	slis.removeClass('on');
	// 	$(slis[fi]).addClass('on');
	// }
	this.si = si;
	this.fi = fi;
	this.update(si, fi);
};

Indicator.prototype.on = function(eventType, func){
	this._events[eventType] = func;
};

Indicator.prototype.update = function(si, fi){
	this.si = si;
	this.fi = fi;
	this._create();
};
;var running = false;
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

	if (df) {
		df.dom.scrollTop(0);
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