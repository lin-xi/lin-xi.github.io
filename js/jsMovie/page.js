$('body').ready(function(){
	//pv/uv统计
	CodeStat.addStat({
		item: 'panohome'
	});

	function browser(){
    	var userAgent = navigator.userAgent.toLowerCase();
		var browserAgent = {
		    version:(userAgent.match( /.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/ ) ||[0,'0'])[1],
		    chrome:/chrome/.test( userAgent ),
		    safari:/webkit/.test( userAgent )&&!/chrome/.test( userAgent ),
		    opera:/opera/.test( userAgent ),
		    msie:/msie/.test( userAgent ) &&!/opera/.test( userAgent ),
		    mozilla:/mozilla/.test( userAgent ) &&!/(compatible|webkit)/.test( userAgent )
		};
		return browserAgent;
    }
    var bs = browser();

	var currentBanner = 0;
	var currentFrame = 0;
	var isRunning = false;
	var iframeInit = false, page2init = false;
	var totalThemeRow =0, themeRowStart=0, themeRowEnd=2, paging=false;
	var winH = $(window).height();
	$('body').height(winH);

	var option = [
		{frames: [{name: '首页'}]}, 
		{frames: [{name: '全景记录'}, {name: '全景的成长记录'}, {name: '全景诞生'}, {name: '覆盖城市'}, {name: '用户上传'}, {name: '采集设备'}]}, 
		{frames: [{name: '专题'}]}
	];
	if(bs.msie){
		option = [
			{frames: [{name: '首页'}]}, 
			{frames: [{name: '专题'}]}
		];
	}

	page1();
	page2();
	page4();
	page3();

	globalPage();

	var movie = new JsMovie(option);

	function page1(){
		var open = false,
			newEvent = null,
			running = false;
			currentHover = -1;

		var banners = $('.head-banner'),
			total = banners.length,
			al = $('.arrow-left'),
			ar = $('.arrow-right'),
			tit = $('.desc .title'),
			txt = $('.desc .text');

		var cb = $(banners[currentBanner]);
		cb.addClass('on').css('z-index', 8);
		tit.text(cb.find('.desc-title').text());
		txt.text(cb.find('.desc-text').text());
		al.addClass('arrow-left-disable');

		banners.find('img').each(function(idx, item){
			//var size = resizeImg(item.width, item.height);
			var size = resizeImg(2500, 1700);
			item.width = size[0];
			item.height = size[1];
			$(item).css({top: -(size[1]-winH)/2});
		});

		banners.find('a').click(function(){
			//头图左右切换点击量
			CodeStat.addStat({
				item: 'panohome_banner_click'
			});
		});

		al.on('mouseenter', function(){
			showBack(1);
		});
		al.on('mouseleave', function(){
			restore(1);
		});
		al.on('click', function(){
			if(open){
				doMove(1);
			}else{
				showBack(1, function(){
					doMove(1);
				});
			}

			//头图左右切换点击量
			CodeStat.addStat({
				item: 'panohome_head_click'
			});
		});

		ar.on('mouseenter', function(){
			showBack(-1);
		});
		ar.on('mouseleave', function(){
			restore(-1);
		});
		ar.on('click', function(){
			if(open){
				doMove(-1);
			}else{
				showBack(-1, function(){
					doMove(-1);
				});
			}
			
			//头图左右切换点击量
			CodeStat.addStat({
				item: 'panohome_head_click'
			});
		});

		function doMove(direction){

			if(currentBanner-direction>=0 && currentBanner-direction<total && !running){
				var cur = $(banners[currentBanner]), destTar = $(banners[currentBanner-direction]);
				running = true;
				open = false;
				var dest = direction * $(window).width();

				tit.text(destTar.find('.desc-title').text());
				txt.text(destTar.find('.desc-text').text());

				cur.animate({left: dest}, 500, 'easeOutQuad', function(){
					cur.css({'z-index': 0, left: 0}).hide();
					destTar.css('z-index', 8);
					currentBanner -= direction;

					cur.removeClass('on');
					destTar.addClass('on');
					
					if(currentBanner==0){
						al.addClass('arrow-left-disable');
						ar.removeClass('arrow-right-disable');
					}else if(currentBanner==total-1){
						al.removeClass('arrow-left-disable');
						ar.addClass('arrow-right-disable');
					}else{
						al.removeClass('arrow-left-disable');
						ar.removeClass('arrow-right-disable');
					}
					running = false;
				});
			}
		}

		function showBack(direction, func){
			var cIdx = currentBanner-direction;
			if(cIdx>=0 && cIdx<total && !running){
				open = true;
				var ban = $(banners[cIdx]).css('z-index', 7).show();
				currentHover = cIdx;
				$(banners[currentBanner]).stop().animate({left: direction*50}, 500, 'jswing', function(){
					func && func();
				});
			}
		}

		function restore(direction){
			if(!running){
				open = false;
				running = true;
				$(banners[currentBanner]).stop().animate({left: 0}, 300, 'jswing', function(e){
					$(banners[currentBanner-direction]).css('z-index', 0).hide();
					running = false;
				});
			}
		}
	}


	function page2(){
		if(bs.msie){
			$('.page2').remove && $('.page2').remove();
		}else{
			$('.page2').show();
			var ifm = $('#page2Iframe');
			if(!ifm.length) return;
			ifm.width($(window).width());
			ifm.height(winH);
			//ifm.src = '/panohome/pano?#baidu-pano-1';
		}
	}

	function resizeImg(width, height){
		var w = $(window).width();
		var ratio = w/width,
			rh = height*ratio;
		return [w, rh];
	}

	window.beforeEvent = function(direction, si, sn, fn){
		//第一页视差滚动
		if(si == sn && si == 0){
			parallaxScroll(direction, si, sn, fn)
		}
		//第一页滚动到第二页
		if(si == 0 && sn == 1){
			page2init = true;
			restoreBaner();
		}
		//第二页滚动到第一页或第三页
		if(si == 1 && (sn == 2 || sn == 0)){
			iframePageScroll(direction, si, sn, fn);
		}
		//第三页滚动到第二页
		if(si == 2 && sn == 1){
			themePagetoIframePage();
		}
		return true;
	};

	window.afterEvent = function(){
		var ifm = $('#page2Iframe');
		if(!ifm.length) return;
		if(iframeInit){
			if(page2init){
				page2init = false;
				iframeChangePage(ifm, 0);
				$('.head-banner img').each(function(idx, item){
					var h = -($(item).height()-winH)/2;
					$(item).stop().css({top: h});
				});
			}
		}else{
			if(movie.si == 1 && movie.fi == 0 && page2init){
				iframeInit = true;
				page2init = false;
				ifm.focus();
				setTimeout(function(){
					ifm.attr('src', '/panohome/pano?#baidu-pano-1');
				}, 50);
			}
		}
	};

	//圆点页码点击前
	window.beforeChangePage = function(si, fi){
		//第二页的页码区点击
		if(si == 1){
			//当前第一页，点击第二页
			if(movie.si < si){
				bannerPageToIframePage(si, fi);
				restoreBaner();
			}else if(movie.si == si){
				//第二页子页点击
				iframePageClick(si, fi);
				return false;
			}else{
				//当前第三页，点击第二页
				themePagetoIframePage(-1, si, fi, null)
			}
		}
		return true;
	};

	window.mouseWheelHock = function(direction, si){
		if(movie.scenes[si].id == 'theme'){
			return themePageScroll(direction, si);
		}
		return true;
	};

	//第一页视差滚动
	function parallaxScroll(direction, si, sn, fn){
		var img = $('.head-banner.on img'),
			top = img.css('top').replace('px', '');
		var h = img.height()-winH,
			nt = parseInt(top)-direction*h/2;
		nt>0 && (nt=0);
		nt<-h && (nt=-h);
		img.animate({top: nt}, 1500);
	}

	//恢复第一页图片的视差
	function restoreBaner(){
		setTimeout(function(){
			$('.head-banner img').each(function(idx, item){
				var h = -($(item).height()-winH)/2;
				$(item).stop().css({top: h});
			});
		}, 900);
	}

	//从iframe页面滚动
	function iframePageScroll(direction, si, sn, fn){
		var ifm = $('#page2Iframe');
		if(!ifm.length) return true;
		//第二页子页之间滚动
		if(currentFrame+direction < 5 && currentFrame+direction > 0){
			iframeChangePage(ifm, currentFrame+direction);
			return false;
		}else{
			//第二页滚动到第一页或第三页
			ifm.blur();
			$('body').focus();
		}
	}

	//banner页到iframe页
	function bannerPageToIframePage(si, fi){
		var ifm = $('#page2Iframe');
		if(!ifm.length) return true;
		if(!iframeInit){
			currentFrame = 0;
			ifm.attr('src', '/panohome/pano?#baidu-pano-1');
			iframeInit = true;
		}else{
			iframeChangePage(ifm, 0);
		}
	}

	//iframe子页面点击
	function iframePageClick(si, fi){
		var ifm = $('#page2Iframe');
		if(!ifm.length) return true;
		movie.showScene(movie.si);
		currentFrame = fi;
		iframeChangePage(ifm, fi);
		indicator.update(0, 1, currentFrame, 'iframe');
	}

	//专题页滚动到iframe页
	function themePagetoIframePage(direction, si, sn, fn){
		var ifm = $('#page2Iframe');
		if(!ifm.length) return true;
		if(!iframeInit){
			iframeInit = true;
			ifm.focus();
			currentFrame = 4;
			ifm.attr('src', '/panohome/pano?#baidu-pano-5');
		}else{
			iframeChangePage(ifm, 4);
		}
	}

	function themePageScroll(direction, si){
		if(paging) return false;
		if(themeRowStart+direction<0) return true;
		if(themeRowEnd+direction>totalThemeRow) return true;

		var destPos = themeRowEnd+direction;
		var pageRows = 3*direction;
		var newStartRow = themeRowStart+pageRows > 0 ? themeRowStart+pageRows : 0;
		var newEndRow = themeRowEnd+pageRows >= totalThemeRow ? totalThemeRow-1 : themeRowEnd+pageRows;
		if(newStartRow<newEndRow && newStartRow>=0 && newEndRow<totalThemeRow){
			var pw = $('#pano-wall'), 
				wc = $('#wall-container'),
				rows = pw.find('.row'),
				ele = $(rows[themeRowStart]),
				hh= ele.height(),
			
				loadCount = 0, totalLoadCount = (newEndRow-newStartRow)*4, loading = false,
				loaddom = pw.find('.loading'),
				hov = $('#hover-group');

			paging = true;

			if(direction>0){
				for(var i=newStartRow; i<=newEndRow; i++){
					var imgs = $(rows[i]).find('img');
					imgs.each(function(idx, item){
						if(!item.src){
							addLoading();
							item.onload = loadHandler;
							item.onerror = loadHandler;
							item.src = item.getAttribute('data-src');
						}else{
							doAnimate();
							return false;
						}
					});
				}
			}else{
				doAnimate();
			}

			function loadHandler(){
				loadCount++;
				if(loadCount == totalLoadCount){
					setTimeout(function(){
						loaddom.hide();
						loading = false;
						doAnimate();
					}, 400);
				}
			}
			function addLoading(){
				if(loading) return;
				loading = true;
				wc.css('top', -themeRowStart*hh-60);
				loaddom.show();
			}
			function doAnimate(){
				wc.stop().animate({top: -(themeRowStart+direction*(newEndRow-newStartRow+1))*hh}, 800, function(){
					paging = false;
					themeRowStart += pageRows;
					themeRowEnd += pageRows;
					hov.hide();
				});
			}
			return false;
		}
		return true;
	}


	function iframeChangePage(ifm, fi){
		if(!ifm.length) return true;
		ifm.focus();
		var func = ifm.get(0).contentWindow.changePage;
		if(func && !isRunning){
			isRunning = true;
			currentFrame = fi;
			func(fi);
		}
	}

	function page3(){
		var panoWallInit = false;
		var lasLeaveTarget = null;

		var panoWall = $('#pano-wall'),
			wc = $('#wall-container'),
			hov = $('#hover-group'),
			hovText = $('#hoverText'),
			rows = panoWall.find('.row');

		var lh = (winH-40)/3;
		hovText.css('line-height', lh+'px');
		totalThemeRow = rows.length;

		wc.height(totalThemeRow*lh);

		wc.delegate('span', 'mouseenter',  function(e){
			if(paging) return;

			var cur = $(e.currentTarget);
			hov.show();
			hovText.text(cur.attr('title'));
			hovText.attr('subjectId', cur.attr('subjectid'));
			if(!panoWallInit){
				var os = cur.position();
				hov.css({left: os.left, top: os.top, width: cur.width(), height: cur.height()}).show();
				panoWallInit = true;
			}else{
				var osh = hov.position();
				var osc = cur.position();
				var ot = osc.top, w= cur.width(), h=cur.height();
				if(osh.top == ot){
					hov.stop();
					hov.css({height: h});
					hov.animate({left: osc.left, width: w}, 200);
				}else if(osh.top > ot){
					//从下往上
					hov.stop();
					hov.animate({height: 0}, 100, function(){
						hov.css({left: osc.left, top: ot+h, width: w});
						hov.animate({top: ot, height: h}, 100);
					});
				}else{
					//从上往下
					hov.stop();
					hov.animate({top: osh.top+h, height: 0}, 100, function(){
						hov.css({left: osc.left, top: ot, width: w});
						hov.animate({height: h}, 100);
					});
				}
			}
		});

		wc.on('mouseleave',  function(e){
			hov.hide();
			panoWallInit = false;
		});

		hovText.on('click',  function(e){
			var id = $(this).attr('subjectId');
			window.open('/panohome/subject?id='+id);
		});
	}

	function page4(){
		var pwh = winH-40;
		$('#pano-wall').height(pwh);
	}

	function globalPage(){
		var lastPage = 0, scrollTimer, count=0, stop=false;
		var resizeTimer;

		window.onIframeScroll = function(deltaY, from, direction){
			var sp = from == 'key' ? 1 : 10;
			if(lastPage==5 && deltaY<0){
				if(count<sp){
					count++;
					return;
				}
				count=0;
				movie && movie.playNextScene();
				stop=true;
			}else if(lastPage==1 && deltaY>0){
				if(count<sp){
					count++;
					return;
				}
				count=0;
				movie && movie.playPrevScene();
				stop=true;
			}else{
				count=0;
				stop=false;
				var s = deltaY || direction;
				currentFrame += s;
			}
		};
		window.receiveMessage = function(msg){
			isRunning = false;
			if(msg){
				var item = msg.split('-');
				if(item[2]){
					lastPage = item[2];
					currentFrame = item[2]-1;
					if(stop) return;
					indicator.update(0, 1, currentFrame, 'iframe');
				}
			}
		};

		window.onresize = function(){
			if(resizeTimer){
				clearTimeout(resizeTimer);
			}
			resizeTimer = setTimeout(doResize, 100);
			function doResize(){
				var h = $(window).height();

				var banners = $('.head-banner');
				banners.find('img').each(function(idx, item){
					//var size = resizeImg(item.width, item.height);
					var size = resizeImg(2500, 1700);
					item.width = size[0];
					item.height = size[1];
					$(item).css({top: -(size[1]-h)/2});
				});

				var ifm = $('#page2Iframe');
				if(!ifm.length){
					ifm.width($(window).width());
					ifm.height(h);
				}

				var panoWall = $('#pano-wall'),
					wc = $('#wall-container'),
					hov = $('#hover-group'),
					hovText = $('#hoverText'),
					rows = panoWall.find('.row');

				var lh = (h-40)/3;
				panoWall.height(h-40);
				hovText.css('line-height', lh+'px');
				totalThemeRow = rows.length;

				wc.height(totalThemeRow*lh);

				var ind = $('#indicator');
				ind.css('top', (h-ind.height())/2);
			}
		};
		
	}
	

});



