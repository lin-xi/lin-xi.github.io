function AnimateObject(dom, animType, time, delay, from, to){
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
};