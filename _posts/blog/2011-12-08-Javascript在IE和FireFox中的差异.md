---
layout: post
title: Javascript在IE和FireFox中的差异
description: javascript浏览器兼容性
category: blog
---

## Javascript在IE和FireFox中的差异

1.document.formName.item("itemName") 问题  
说明:IE下,可以使用document.formName.item("itemName")或document.formName.elements\["elementName"\];Firefox下,只能使用document.formName.elements\["elementName"\].   
解决方法:统一使用document.formName.elements\["elementName"\].

2.集合类对象问题  
说明:IE下,可以使用()或\[\]获取集合类对象;Firefox下,只能使用\[\]获取集合类对象.   
解决方法:统一使用\[\]获取集合类对象.

3.自定义属性问题  
说明:IE下,可以使用获取常规属性的方法来获取自定义属性,也可以使用getAttribute()获取自定义属性;Firefox下,只能使用getAttribute()获取自定义属性.   
解决方法:统一通过getAttribute()获取自定义属性.

4.eval("idName")问题  
说明:IE下,,可以使用eval("idName")或getElementById("idName")来取得id为idName的HTML对象;Firefox下只能使用getElementById("idName")来取得id为idName的HTML对象.   
解决方法:统一用getElementById("idName")来取得id为idName的HTML对象.

5.变量名与某HTML对象ID相同的问题  
说明:IE下,HTML对象的ID可以作为document的下属对象变量名直接使用;Firefox下则不能.Firefox下,可以使用与HTML对象ID相同的变量名;IE下则不能。  
解决方法:使用document.getElementById("idName")代替document.idName.最好不要取HTML对象ID相同的变量名,以减少错误;在声明变量时,一律加上var,以避免歧义.

7.input.type属性问题  
说明:IE下input.type属性为只读;但是Firefox下input.type属性为读写.

9.event.x与event.y问题  
说明:IE下,even对象有x,y属性,但是没有pageX,pageY属性;Firefox下,even对象有pageX,pageY属性,但是没有x,y属性.   
解决方法:使用mX(mX = event.x ? event.x : event.pageX;)来代替IE下的event.x或者Firefox下的event.pageX.

10.event.srcElement问题  
说明:IE下,event对象有srcElement属性,但是没有target属性;Firefox下,event对象有target属性,但是没有srcElement属性.   
解决方法:使用obj(obj = event.srcElement ? event.srcElement : event.target;)来代替IE下的event.srcElement或者Firefox下的event.target.

13.frame问题  
以下面的frame为例：  
<frame src="xxx.html" id="frameId" name="frameName" /\>

(1)访问frame对象:  
IE:使用window.frameId或者window.frameName来访问这个frame对象.  
Firefox:只能使用window.frameName来访问这个frame对象.  
另外，在IE和Firefox中都可以使用window.document.getElementById("frameId")来访问这个frame对象.

(2)切换frame内容:  
在IE和Firefox中都可以使用window.document.getElementById("testFrame").src = "xxx.html"或window.frameName.location = "xxx.html"来切换frame的内容.

如果需要将frame中的参数传回父窗口，可以在frme中使用parent来访问父窗口。例如：parent.document.form1.filename.value="Aqing";

14.body问题  
Firefox的body在body标签没有被浏览器完全读入之前就存在；而IE的body则必须在body标签被浏览器完全读入之后才存在.

例如：   
Firefox：   
<body\>   
<script type="text/javascript"\>   
document.body.onclick = function(evt){   
evt = evt || window.event;   
alert(evt);   
}   
</script\>   
</body\>   
IE&Firefox：   
<body\>  
</body\>   
<script type="text/javascript"\>   
document.body.onclick = function(evt){   
evt = evt || window.event;   
alert(evt);   
} </script\>

15\. 事件委托方法  
IE：document.body.onload = inject; //Function inject()在这之前已被实现

Firefox：document.body.onload = inject();

有人说标准是：  
document.body.onload=new Function('inject()');

16\. firefox与IE(parentElement)的父元素的区别  
IE：obj.parentElement  
firefox：obj.parentNode

解决方法: 因为firefox与IE都支持DOM,因此使用obj.parentNode是不错选择.

17.innerText在IE中能正常工作，但是innerText在FireFox中却不行.  
解决方法:  
if(navigator.appName.indexOf("Explorer") \> -1){

document.getElementById('element').innerText = "my text";

} else{

document.getElementById('element').textContent = "my text";

}

18\. FireFox中类似 obj.style.height = imgObj.height 的语句无效  
解决方法：  
obj.style.height = imgObj.height + 'px';

19\. ie,firefox以及其它浏览器对于 table 标签的操作都各不相同，在ie中不允许对table和tr的innerHTML赋值，使用js增加一个tr时，使用appendChile方法也不管用。  
解决方法：  
//向table追加一个空行：  
var row = otable.insertRow(-1);  
var cell = document.createElement("td");  
cell.innerHTML = " ";   
cell.className = "XXXX";   
row.appendChild(cell);

20\. padding 问题  
padding 5px 4px 3px 1px FireFox无法解释简写,

必须改成 padding-top:5px; padding-right:4px; padding-bottom:3px; padding-left:1px;

21\. 消除ul、ol等列表的缩进时  
样式应写成:list-style:none;margin:0px;padding:0px;

其中margin属性对IE有效，padding属性对FireFox有效

22\. CSS透明  
IE：filter:progid:DXImageTransform.Microsoft.Alpha(style=0,opacity=60)。

FF：opacity:0.6。

23\. CSS圆角  
IE：不支持圆角。

FF： -moz-border-radius:4px，或者-moz-border-radius-topleft:4px;-moz-border- radius-topright:4px;-moz-border-radius-bottomleft:4px;-moz-border-radius- bottomright:4px;。

24\. CSS双线凹凸边框  
IE：border:2px outset;。

FF： -moz-border-top-colors: \#d4d0c8 white;-moz-border-left-colors: \#d4d0c8 white;-moz-border-right-colors:\#404040 \#808080;-moz-border-bottom-colors:\#404040 \#808080;

25．ie支持document.all 而firefox 不支持  
改用下面三个tag的其中一个来代替document.all   
getElementsByTagName("tagName") 可以得到得到所有标签元素的集合  
getElementById("idName")          可以按id得到某一元素  
getElementsByName("Name")            可以得到按name属性得到某一元素

26、firefox 中使用innerHTML 的方法  
<div id="online"\></div\>  
document.all.online.innerHTML; //这种方法在IE中可以使用，但不是标准方法  
document.getElementById("online").innerHTML; //这样firefox就能使用innerHTML了

27、eval()与window.execScript()执行脚本  
IE、firerox均支持eval()，firefox不支持window.execScript()

解决：统一使用eval()

28、对事件处理函数的重写  
解决：（例）:如对document的onclick()重写，统一使用document.onclick = function(){...}