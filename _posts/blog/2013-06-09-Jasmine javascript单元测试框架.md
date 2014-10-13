---
layout: post
category: blog
title: golang与node.js的http模块性能对比测试（go1）
description: 
golang与node.js的http模块性能对比测试（go1）
---

在jasmine的官网的第一行文字是"BDD for JavaScript"。什么是BDD呢？

（PS:这部分内容很晦涩，不喜欢就直接跳过，不影响阅读。）  
说真得明河也是一知半解，全称是"behavior-driven development"，即行为驱动开发。百度百科有句解释，"是一种敏捷软件开发技术，鼓励开发人员、质量保证和非技术或商业参与者都参与到项目中来。"BDD更像是一种团队的约定，javascript单元测试，也许对于你本人（开发该脚本的前端）意义不是特别突出，但对于整个团队，整个项目来说就是一种财富。哪些是典型的BDD实践呢？

为不同利益相关者建立共有的可实施的目标期望。（Establishing the goals of different stakeholders required for a vision to be implemented）；

-\_-！英语水平太差，不献丑了（Involving stakeholders in the implementation process through outside-in software development）；

使用例子去描述应用的行为或单元代码（Using examples to describe the behavior of the application, or of units of code）；

通过这些例子（单元测试）实现自动化的快速反馈和测试回归（Automating those examples to provide quick feedback and regression testing）。1.学习jasmine的基础语法

（ps：如果你熟悉Rspec（一个BDD测试框架），那么jasmine对于你来说非常容易，因为jasmine风格上很接近Rspec。）  
jasmine单元测试有二个核心的部分：**describe **函数块和**it**函数块。接下来我们来看下这二个部分是如何工作的。

//建立个describe块

describe('JavaScript addition operator', function () { 

//建立it块

it('adds two numbers together', function () { 

//测试1+2是否等于3

expect(1 + 2).toEqual(3); 

}); 

});

describe和it函数都有二个参数：

第一个参数：测试描述（一般使用英文，当然你使用中文也是完全没问题的）；

第二个参数：测试逻辑函数（具体干活的主）

在it的函数块（第二个参数）内，你可以针对你要测试的javascript代码书写相应的测试代码，上面的代码有行"**expect(1 + 2).toEqual(3); **"，**expect**方法用于表明你测试的预期，**toEqual**是它的子方法，表示是否等于你的预期。所以这句代码可以翻译为，1 + 2等于3，如果等于3，那么it函数块测试通过，it测试通过，那么describe也就测试通过。  
it函数块可以包含多个expect过程，只要有其中的expect不符合期望，it就会测试不通过；而describe也可以包含多个it，只要有中有一个it报错，那么describe就会测试不通过。  
当然单纯的测试1+2是否等于3，完全没有意义，明河觉得单元测试的最主要作用在于对js类的接口进行的测试。比如明河写了个选择框组件：

var Select = function(){

};

Select.prototype = {

show : function(){},

hide : function(){},

change : function(){},

width : function(){}

}

那么我会针对这个类写下如下单元测试代码：

describe('模拟选择框测试', function () { 

var select = new Select();

it('显示方法无误', function () { 

expect(select.show()).toEqual(true); 

});

it('隐藏方法无误', function () { 

expect(select.hide()).toEqual(true); 

});   

});

show、hide方法执行正确时返回true，这里明河隐去代码具体实现。  
当我下次重构select组件时，如果我漏写了hide方法或者把hide写成hidden，那么运行这个单元测试就会报错。当然也许你会说这个过程不是用肉眼就可以知晓吗？是的，明河不否认人地主观能动性的强大，但是思考个问题，如果你的类有很多方法，如果你需要知道方法各种调用的执行情况，那么人肉很容易出现纰漏。  
接下来我们来看个实际的使用jasmine的项目例子。2.如何在你的项目中应用jasmine？

如果你下载了jasmine的源文件，那么结构应该是如下图所示：  
  
你可以运行下SpecRunner.html（实例页）体验下jasmine的测试界面，如下图：  
  
当测试用例的背景全部为绿色时，表示测试通过，红色出现时表示测试失败，代码有问题。  
SpecRunner.html是非常标准的单元测试，可以作为你项目测试页面模板。  
接下来我们以实例包为例，里面已经包含了jasmine的源码了。实例包的目录如下：  
  
打开实例包的SpecRunner.html。在测试页面中引入jasmine库

<link rel="stylesheet" type="text/css" href="spec/jasmine/jasmine.css"\>

<script type="text/javascript" src="spec/jasmine/jasmine.js"\></script\>

<script type="text/javascript" src="spec/jasmine/jasmine-html.js"\></script\>

必须引入这三个文件！在测试页面中引入需要测试的代码文件

<script type="text/javascript" src="src/convert.js"\></script\>在测试页面中引入单元测试代码

<script type="text/javascript" src="spec/convertSpec.js"\></script\>初始化jasmine

通用的代码，copy到页面下即可。

(function() {

var jasmineEnv = jasmine.getEnv();

jasmineEnv.updateInterval = 1000;

var trivialReporter = new jasmine.TrivialReporter();

jasmineEnv.addReporter(trivialReporter);

jasmineEnv.specFilter = function(spec) {

return trivialReporter.specFilter(spec);

};

var currentWindowOnload = window.onload;

window.onload = function() {

if (currentWindowOnload) {

currentWindowOnload();

}

execJasmine();

};

function execJasmine() {

jasmineEnv.execute();

}

})();

接下来你就可以自由的在convertSpec.js中书写单元测试代码。3.写测试用例？

可以把每个it块当做一个解释类的方法用法的例子，而describe就像一部对类进行解释的说明书，也就是说可以把测试代码当做"文档"来读。建立describe

describe( "Convert library", function () { 

describe( "distance converter", function () { 

}); 

describe( "volume converter", function () { 

}); 

});

从上面的代码可以看出describe是可以嵌套的，（一般不会出现嵌套太多的情况）。  
这里的describe测试的是Convert library，即convert.js中的**xConvert**类（xConvert主要用于单位的转换）下的方法可用性。  
需要测试二方面的内容：distance converter（距离单位转换），volume converter（体积单位转换），所以我们创建了二个子**describe**。对xConvert的API进行测试

先对距离单位转换进行测试：

describe( "distance converter", function () { 

it("converts inches to centimeters", function () { 

expect(Convert(12, "in").to("cm")).toEqual(30.48); 

}); 

it("converts centimeters to yards", function () { 

expect(Convert(2000, "cm").to("yards")).toEqual(21.87); 

}); 

});

上面的代码提供了二个用例，将单位in转成cm，将cm转成yards，使用expect方法看结果是否符合预期，如果符合那么测试通过。  
通过上面的测试代码，我们可以阅读到二个信息：

Convert函数有二个参数，第一个参数是数值型，为待转换的数字，第二个参数为单位；

Convert还有to字方法，用于转换成指定单位。

这就是明河所说的，单元测试可以但文档阅读的缘故。  
接下来来看下体积转换的测试：

describe( "volume converter", function () { 

it("converts litres to gallons", function () { 

expect(Convert(3, "litres").to("gallons")).toEqual(0.79); 

}); 

it("converts gallons to cups", function () { 

expect(Convert(2, "gallons").to("cups")).toEqual(32); 

}); 

});

代码跟距离转换非常类似就不再一一解释。  
接下来我们再追加二个测试，用于测试当用户传入非法单位或不支持的单位时的情况。

it("throws an error when passed an unknown from-unit", function () {

var testFn = function () {

Convert(1, "dollar").to("yens");

};

expect(testFn).toThrow(new Error("unrecognized from-unit"));

});

it("throws an error when passed an unknown to-unit", function () {

var testFn = function () {

Convert(1, "cm").to("furlongs");

}

expect(testFn).toThrow(new Error("unrecognized to-unit"));

});

如果你运行SpecRunner.html，那么页面将会出现如下错误！  
  
错误很明确的指向Convert变量未定义！！！好的，我们接下来打开src/convert.js，你就会发现变量错了！将xConvert改成Convert，你就会发现测试通过了！  
  
当然这个错误其实是人为制造的错误，而且代码偏简单。代码越复杂，越有必要进行单元测试，才能保证你日后维护时，整个类逻辑的正确性。