function Frame(dom, name, frameType, animType, time, delay){
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
};