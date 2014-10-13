---
layout: post
title: BFC(Block Formatting Context)
description: BFC(Block Formatting Context)
category: blog
---

上文中我们讲述了在一个星球上发生的有关overflow:hidden的故事。这次，我们再欣赏下她另一个迷人之处。其实，关键也不是她啦。而是由于她会引起[BFC(Block Formatting Context)][0]。BFC又是什么？什么情况会创建BFC？它有什么用？其实在写代码时经常会遇到。

什么是BFC

BFC(Block Formatting Context)，**简单讲，它是提供了一个独立布局的环境，每个BFC都遵守同一套布局规则。例如，在同一个BFC内，盒子会一个挨着一个的排，相邻盒子的间距是由margin决定且垂直方向的margin会重叠。而float和clear float也只对同一个BFC内的元素有效。**

什么情况产生BFC

W3C标准中这样描述：  
  
Floats, absolutely positioned elements, block containers (such as inline-blocks, table-cells, and table-captions) that are not block boxes, and block boxes with 'overflow' other than 'visible' (except when that value has been propagated to the viewport) establish new block formatting contexts for their contents.  
  
非块级盒子的浮动元素、绝对定位元素及块级容器(比如inline-blocks，table-cells和table-captions)，以及overflow属性是visible之外任意值的块级盒子，都会创建了一个BFC。即当元素CSS属性设置了下列之一时，即可创建一个BFC:

float：left|right

position：absolute|fixed

display: table-cell|table-caption|inline-block

overflow: hidden|scroll|auto

BFC的一个简单应用

一个简单的例子：

html:

<div class="item"\>  
<div class="pic"\>your photo here?</div\>  
<p class="cont"\>  
爱饭否，爱豆瓣，也爱鸡脱壳。  
爱爬山，爱拍美景。  
爱腐败，更爱远征的自虐。  
爱下雪天，爱感动，爱平底鞋。  
我没有什么特别，我很特别。  
我和别人不一样，我和你一样。  
我是前端。  
</p\>  
</div\>

css:

.item{width:300px;border:1px solid \#b2d1a3;background-color:\#e5ebe4;}  
.pic{width:80px;height:80px;margin:10px;  
font-family:"Segoe UI Light";color:\#fff;background-color:\#acdae5;}  
.cont{margin:10px;color:\#37a;}

这段代码是结构简单的三个元素的叠放，效果如下：

![简答的元素叠放](http://f.hiphotos.baidu.com/album/pic/item/3b292df5e0fe992531ad57e035a85edf8cb171d8.jpg)  
  
这时，如果要将文字部分放到图片的右侧，很多人都会想到给.pic使用float:  
css:

.pic{width:80px;height:80px;margin:10px;  
font-family:"Segoe UI Light";color:\#fff;background-color:\#acdae5;  
float:left;  
}

将得到这样的效果：

![左侧图片使用了float](http://d.hiphotos.baidu.com/album/pic/item/7e3e6709c93d70cf887394bdf9dcd100bba12bf0.jpg)

右侧内容并没有如我们预料一样规整的排在右侧，而是将左侧图片包围起来。接下来，我们为右侧内容部分设置overflow:hidden属性来使它形成一个新的BFC：  
css:

.cont{margin:10px;color:\#37a;overflow:hidden;}

这次将看到：

![bfc](http://d.hiphotos.baidu.com/album/pic/item/18d8bc3eb13533fa2117ad9ea9d3fd1f40345bd8.jpg)

这确实是我们想要的。可是，在IE6下看到的却是下面这样：

![ie6双边距及layout](http://b.hiphotos.baidu.com/album/pic/item/5243fbf2b2119313e9aec10064380cd790238d94.jpg)  
不仅内容区没有排在右侧，而且遭遇了双边距bug。双边距bug非本文重点讨论，直接为.pic增加display:inline来解决。我们关心的是为什么IE6下右侧内容元素还是不能决定自己的布局呢？这里涉及到了另一个概念HasLayout。其实，在完美世界的字典里，是没有HasLayout这个概念的。它是IE浏览器引擎内部特有的属性，它可以影响到元素的定位和元素之间的相互作用。当一个元素的HasLayout属性为true时，这个元素才可以决定自己和其子孙元素的布局。为数不多的元素默认这个属性值为true，包括：

body and html

table, tr, th, td

img

hr

input, button, file, select, textarea, fieldset

marquee

frameset, frame, iframe

objects, applets, embed

所以，当发现有些元素的布局在IE下有异常时，可以有充分的理由来怀疑可能是hasLayout属性为false。而且这个属性值不能直接设置。一个元素要么默认拥有，要么通过设置特定的CSS属性来获取。直接的使元素hasLayout属性值为true的方法是声明下面的CSS属性之一：

width: 除auto之外的值

height: 除auto之外的值

float: left|right

position: absolute

display: inline-block

writing-mode: tb-rl(IE)

zoom: 除normal之外的值

IE7中增加了一些同样效果的属性：

min-height: 任意值

max-height: 除 "none" 之外的任意值

min-width: 任意值

max-width: 除 "none" 之外的任意值

overflow: hidden|scroll|auto

overflow-x: hidden|scroll|auto

overflow-y: hidden|scroll|auto

position: fixed

最常用的是zoom:1，因为这个设置对元素外观不会造成任何影响。但是这个属性是IE特有的CSS属性，不会通过CSS检查器[W3C提供的CSS校验器][1]（当然，让不让通过校验实际取决于各种校验器的规则）。所以，有推荐对于IE7，最好是设置min-height:0。因为0是min-height的初始值，这样不会对元素外观造成影响。对于IE6及更早的版本，推荐方法是设置height:1%。这个高度会使得容器盒子的大小刚好包含内容区而忽略掉真正的属性值。但这个设置的缺陷是会影响到其他浏览器的解析，因此需要使用hack屏蔽掉对其他浏览器的影响。  
所以，最终的代码可能是：

.item{width:300px;border:1px solid \#b2d1a3;background-color:\#e5ebe4;}  
.pic{width:80px;height:80px;margin:10px;  
font-family:"Segoe UI Light";color:\#fff;background-color:\#acdae5;  
float:left;display:inline;}  
.cont{margin:10px;color:\#37a;overflow:hidden;\_height:1%;}

你偏爱哪一种呢？欢迎探讨。


[0]: http://www.w3.org/TR/CSS21/visuren.html#block-formatting
[1]: http://jigsaw.w3.org/css-validator/validator