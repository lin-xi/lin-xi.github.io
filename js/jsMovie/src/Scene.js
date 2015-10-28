function Scene(id, name, dom, frames, animType, time){
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
}