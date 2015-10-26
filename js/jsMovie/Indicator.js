function Indicator(parent, data){
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
