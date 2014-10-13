---
layout: post
category: blog
title: float & hasLayout
description: 
float & hasLayout
---

浮动元素不占任何正常文档流空间，而浮动元素的定位还是基于正常的文档流，然后从文档流中抽出并尽可能远的移动至左侧或者右侧。文字内容会围绕在浮动元素周围。当一个元素从正常文档流中抽出后，仍然在文档流中的其他元素将忽略该元素并填补他原先的空间。   

不过既然浮动元素不占任何正常文档流空间，为什么文字不在DIV下，而是环绕DIV？  
这就是浮动的特性。普通的块级元素处在浮动元素下层，但它内部的文字（以及行内元素）会环绕浮动元素。  
浮动的概念源自图片的左/右对齐，而图片左/右对齐的目的就是实现文字环绕图片。  
_所以说，这就是浮动的特性。_

float  
left  :　 文档流向对象的右边   
right  :　 文档流向对象的左边   
position  
absolute  :　 将对象从文档流中拖出，使用 left ， right ， top ， bottom 等属性相对于其最接近的一个最有定位设置的父对象进行绝对定位。如果不存在这样的父对象，则依据 body 对象。而其层叠通过 z-index 属性定义   
以上引用CSS2.0手册。  
  
关于文档流这个概念，其实一直没有一个很明确的定义，比较一致的看法就是指文档自上而下的书写顺序。  
对于拖出文档流的元素有很多不同的解释，我的观点就是这类元素不会对其周围元素位置产生影响。

脱离了文档流的。只是由于ie下经常会遇到haslayout。所以很多时候造成"没有真正脱离"的假象。

_[haslayout][0]_

[http://jmedia.cn/][1]

在一个完美的世界，我们不需要知道[hasLayout][2]属性是什么东西。它是Windows [Internet Explorer][3]渲染引擎的一个内部组成部分。但是它的作用不可小觑，他对元素的外观和行为有很大影响，主要针对元素内容的约束和与邻接元素的相互作用。

这篇文章完全针对Windows的[Internet Explorer][3]。[hasLayout][2]属性是什么？

在[Internet Explorer][3]中，一个元素要么自己对自身的内容进行计算大小和组织，要么依赖于父元素来计算尺寸和组织内容。

为了调节这两个不同的概念，渲染引擎采用了所谓的[hasLayout][2]的属性，属性值可以为true或false。当一个元素的[hasLayout][2]属性值为true时，我们说这个元素有一个布局（layout）。

当一个元素有一个布局时，它负责对自己和可能的子孙元素进行尺寸计算和定位。简单来说，这意味着这个元素需要花更多的代价来维护自身和里面的内容，而不是依赖于祖先元素来完成这些工作。因此，一些元素默认会有一个布局，尽管大多数都没有。

负责组织自身内容的元素将默认有一个布局，主要包括以下元素（不完全列表）：

body and html (in standards mode)

table, tr, th, td

img

hr

input, button, file, select, textarea, fieldset

marquee

frameset, frame, iframe

objects, applets, embed

对于并非所有的元素都默认有布局，微软给出的主要原因是"性能和简洁"。如果所有的元素都默认有布局，会对性能和内存使用上产生有害的影响。

那么，我们为什么要关心这个[hasLayout][2]属性呢？原因是，许多[Internet Explorer][3]的显示不一致问题，都可以归因于这个属性。

在大多数情况下，有与元素缺少布局而导致的问题很容易发现：内容往往错位了或者完全不见了。例如，当一个元素（如div，它默认情况下是没有布局的）内含浮动或绝对定位的内容时，它通常会表现出奇怪和错误的行为。这类可能产生的奇怪行为是多种多样的，包括内容缺失或者错位，或者当浏览器窗口移动或者滚动时元素重绘失败。[3][4]

如果你发现一块内容有的显示有点不显示，部分网页只显示了部分内容，这些迹象都表明很可能某个元素需要一个布局。当关键元素有了布局以后，这个问题就会奇迹般地消失了。事实上，在日常开发中所遇到的99％的[Internet Explorer][3] [CSS][5]的bug都可以用设置[hasLayout][2]的方法来修正。修正[hasLayout][2]具体无非声明一个[CSS][5]属性来使这个因素获得布局，如果这个元素默认没有布局的话。

为一个元素设置布局最简单的方法是，设置一个[CSS][5]尺寸属性（例如，宽度width或高度height）。然而，有些情况下你可能不希望对元素设置具体的宽度或高度，还有其他一些的[CSS][5]属性也可以达到相同的效果。

这些其他属性是：

display: inline-block

height: (任何值除了auto)

float: (left 或 right)

position: absolute

width: (任何值除了auto)

writing-mode: tb-rl

[zoom][6]: (任何值除了normal)[4][7]

[Internet Explorer][3] 7还有一些额外的属性（不完全列表） ：

min-height: (任何值)

max-height: (任何值除了none)

min-width: (任何值)

max-width: (任何值除了none)

overflow: (任何值除了visible)

overflow-x: (任何值除了visible)

overflow-y: (任何值除了visible)[5][8]

position: fixed

声明任何这些[CSS][5]属性都会让元素得到布局，当然前提是这个属性对这个元素是有效的。例如，我们不能对内嵌（inline）元素设置高度，除非文档运行于[quirks mode][9]。

让所有的元素都有布局并不明智------不仅是因为前面提到的对性能和内存的问题，还因为许多其他不必要的[CSS][5]副作用会发生。例如：

绝对定位或者浮动元素的子孙元素有布局时，就不会收缩环绕其中的内容。

浮动元素旁的静态定位内容不会环绕浮动元素，而是形成一个矩形块并列在浮动元素旁。 更多的例子可以在[MSDN网站][10]上找到。[hasLayout][2]问题的调试

如果您发现您的网页在[Internet Explorer][3]中表现奇怪，可以尝试为一个元素设置一个[CSS][5]属性来得到布局，看看问题是否消失。 对于设置哪个元素是有些技巧可言的。随着经验的增加，很容易就可以确定。通常是一个没有明确设置宽度的父容器，或者其宽度只定义了外边距（margin）。如果这个父元素包含浮动或绝对定位的元素，它可能就是造成问题的原因。如果父对象考虑到维护子对象的问题，那么问题就可能会产生。

有一个有用的办法来调试布局的问题，对文档中的元素逐个设置[CSS][5]属性[zoom][11]为1来隔离产生问题的元素。如果你对某个元素设置了这个属性，然后问题解决了，那么你就成功了。属性[zoom][6]很有用，因为它不仅能够触发元素获得布局，而且在大多数情况下，设置这个属性不会改变网页的显示（除了你正在修复的这个bug），而其他方式就可能会 。这个排除法可以很快找到问题所在。

一旦你找到了产生问题的元素，你就可以进行必要的修正了。最好的办法是对这个元素设置一个或多个[CSS][5]的尺寸属性。但是，在不能正常应用尺寸属性的情况下，就只能寻找替代方案了。

对于[Internet Explorer][3] 7 ，最好的办法是设置最小高度属性为0；这个技术是无害的，因为0本来就是这个属性的初始值。而且没有必要对其他浏览器隐藏这个属性，但对于我们的下一个建议就不是这样了！

而对于[Internet Explorer][3] 6和更早版本中触发一个元素得到布局的标准方法是设置这个元素的高度属性为1%，只要overflow属性没有被设置过（除了visible）。这种方法利用了这些版本浏览器的一个bug，即如果overflow属性设置为默认值visible，包含的盒子的高度会自动根据里面的内容扩大而忽略原始的高度值。不过，大多数其他浏览器将尊重高度值1%，而你通常不要他们这样做，所以这项声明需要对所有其他的浏览器隐藏。

在过去几年里，这个设置高度为1%且仅对[Internet Explorer][3] 6和早期版本可见的技术，被称为霍莉破解（[Holly hack][12]）。现在，仅对[Internet Explorer][3]进行[CSS][5]声明的推荐方法是通过利用[条件注释][13]来做。

好消息是，[Internet Explorer][3] 7比以前的版本要健全很多，许多（尽管不幸不是所有的）和布局有关的问题已经消失了，相比以前的版本浏览器，你会需要少得多的修复。如需关于布局问题的更多信息，请参见[Satzansatz网站的"关于布局"][14]。脚注

[1][15] 一旦一个元素有了布局，它的[hasLayout][2]属性就可以被渲染引擎和脚本查询到。  
[2][16] 如果一个子孙元素也有布局，它会处理自身及其子孙元素的尺寸计算，但是它的定位是由它的父元素决定的。  
[3][17] 关于这些行为的几个例子的详细描述可以在Position Is Everything网站找到，网址是[http://positioniseverything.net/explorer.html][18]。  
[4][19] 属性[zoom][6]和writing-mode是[Internet Explorer][3]专有的[CSS][5]属性，所以使用了会通不过[CSS][5]合法验证。  
[5][20] overflow-x and overflow-y是CSS3的提议属性, 但从[Internet Explorer][3] 5就已经有了。


[0]: http://www.cnblogs.com/zhuyezi/archive/2009/12/21/1628597.html
[1]: http://jmedia.cn/
[2]: http://jmedia.cn/?tag=haslayout
[3]: http://jmedia.cn/?tag=internet-explorer
[4]: http://jmedia.cn/?p=144&cpage=1#fntarg_3
[5]: http://jmedia.cn/?tag=css
[6]: http://jmedia.cn/?tag=zoom
[7]: http://jmedia.cn/?p=144&cpage=1#fntarg_4
[8]: http://jmedia.cn/?p=144&cpage=1#fntarg_5
[9]: http://reference.sitepoint.com/css/doctypesniffing
[10]: http://msdn2.microsoft.com/en-us/library/bb250481.aspx
[11]: http://reference.sitepoint.com/css/zoom
[12]: http://www.communitymx.com/content/article.cfm?page=2&cid=C37E0
[13]: http://reference.sitepoint.com/css/conditionalcomments
[14]: http://www.satzansatz.de/cssd/onhavinglayout.html
[15]: http://jmedia.cn/?p=144&cpage=1#fnsrc_1
[16]: http://jmedia.cn/?p=144&cpage=1#fnsrc_2
[17]: http://jmedia.cn/?p=144&cpage=1#fnsrc_3
[18]: http://positioniseverything.net/explorer.html
[19]: http://jmedia.cn/?p=144&cpage=1#fnsrc_4
[20]: http://jmedia.cn/?p=144&cpage=1#fnsrc_5