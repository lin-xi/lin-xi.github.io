(function(){
    var cache = {};
    var ajax = {
        send: function(url, method, params, cb) {
            var xhr = new XMLHttpRequest();
            xhr.open(method, url, true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4) {
                    var data = xhr.responseText;
                    cb && cb(data);
                }
            }
            var body;
            if (params) {
                var bodies = [];
                for (var name in params) {
                    bodies.push(name + '=' + encodeURIComponent(params[name]));
                }
                body = bodies.join('&');
                if (body.length) {
                    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded"); 
                }        
            }
            xhr.send(body);
        },
        get: function(url, params, cb) {
            ajax.send(url, 'GET', params, cb);
        },
        post: function(url, params, cb) {
            ajax.send(url, 'POST', params, cb);
        }
    };
	
	var Deferred = function(){
        var fn = null;
        return {
            then: function(func){
                fn = func;
            },
            resolve: function(){
                fn && fn.apply(null, arguments);
            }
        }
    };

    var variables = {};

    function Interface(path, data){
        this.path = path;
        this.data = data;
    }
    Interface.prototype.update = function(data){
        if(cache[this.path]){
            for(var k in data){
                this.data[k] = data[k];
            }
            renderCss(this.data, cache[this.path]);
        }
    }
	
	function loadCss(data, path){
        if(!cache[path]){
            ajax.get(path, null, function(cssText){
                cssText = cssText.replace(/^\s*/g, '');
                cache[path] = {
                    data: data,
                    css: cssText
                };
                renderCss(data, cssText);
            });
        }
        return new Interface(path, data);
    }

    function renderCss(data, cssText){
        //解析define变量
        var reg_define = /define\{([^\}]*)\}/gm;
        var match_define = reg_define.exec(cssText);
        var copy = match_define[1].slice(0).replace(/\s/mg, '');
        compile(copy, data);
        var cssContent = cssText.replace(reg_define, '');
        cssContent = parseCss(cssContent);
        addSheet(cssContent);
    }

    function compile(copy, data){
        //第一阶段，解析直接变量@width:900px;
        //@width:900px; => @width=900px
        //@half-width:@width/2 => @half-width:900px/2
        var reg_var1 = /(@[\w-]+):([\w-]+);/g;
        var match_vars1 = reg_var1.exec(copy);
        while(match_vars1){
			var val = data[match_vars[1].slice(1)];
            variables[match_vars1[1]] = val ? val : match_vars1[2];
            //将直接变量替换到表达式中
            match_vars1 = reg_var1.exec(copy);
        }
        for(var k in variables){
            copy = copy.replace(new RegExp(k, 'g'), variables[k]);
        }
        //第二阶段，解析表达式变量 
        // @half-width:360px/2 => @half-width=180px
        // @left-width:360px+120px => @left-width=480px
        // @all-width=360px+@half-width => @all-width=360px+180px
        var reg_var2 = /(@[\w-]+):([\w-]+[\+\*\/-][\w-]+).*?;/g;
        var match_vars2 = reg_var2.exec(copy);
        if(!match_vars2){
            return;
        }
        while(match_vars2){
            var result;
            if(match_vars2[2].indexOf('px') != -1){
                result = eval(match_vars2[2].replace(/px/g, '*1')) +'px';
            }else{
                result = eval(match_vars2[2]);
            }
            //将直接变量替换到表达式中
            copy = copy.replace(match_vars2[2], result);
            match_vars2 = reg_var2.exec(copy);
        }
        compile(copy);
    }

    function parseCss(css){
        for(var key in variables){
            //var reg = key.replace('-', '\\-');
            css = css.replace(new RegExp(key, 'mg'), variables[key]);
        }
        return css;
    }

    /**
     * 动态插入css文本片段
     * @param {string} cssText css样式文本片段
     */
    function addSheet(cssText) {
        var doc = document,
            cssCode = cssText;
        var headElement = document.getElementsByTagName('head')[0];
        var styleElements = headElement.getElementsByTagName("style");
        if (styleElements.length == 0) { //如果不存在style元素则创建
            if (doc.createStyleSheet) {
                //包括ie10在内的以下版本，创建一个空的style标签并插入到当前document中
                doc.createStyleSheet();
            } else {
                //w3c标准
                var tempStyleElement = doc.createElement('style');
                tempStyleElement.setAttribute("type", "text/css");
                headElement.appendChild(tempStyleElement);
            }
        }
        var styleElement = styleElements[0];
        var media = styleElement.getAttribute("media");
        if (media != null && !/screen/.test(media.toLowerCase())) {
            styleElement.setAttribute("media", "screen");
        }
        if (styleElement.styleSheet) { //ie
            styleElement.styleSheet.cssText += cssCode;
        } else if (doc.getBoxObjectFor) { //火狐支持直接innerHTML添加样式表字串
            styleElement.innerHTML += cssCode;
        } else {
            styleElement.appendChild(doc.createTextNode(cssCode))
        }
    }

    window.Dcss = {
        load: loadCss
    };

})();

    