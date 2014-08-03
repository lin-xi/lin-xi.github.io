---
layout: post
title: XMLHttpRequest2的进步之处
description: XHR2主要的新功能有(我平时开发遇到的):
上传下载二进制数据
上传进度事件的支持
跨域请求
同时结合html5中的File API，我们就可以在网页中实现更丰富的功能。
category: blog
---

##XMLHttpRequest2的进步之处

本文参考自:XMLHttpRequest2 新技巧 （重点保留demo，方便自己日后查阅）
HTML5是现在web开发中的热点，虽然关于web app和local app一直有争论，但是从技术学习的角度，html5技术无疑是值得学习的。最近看了看XHR2，大概了解了其中比之前进步的要点，记录下来以备日后复习:
首先，XHR2的官方注解可见：http://dvcs.w3.org/hg/xhr/raw-file/tip/Overview.html
XHR2主要的新功能有(我平时开发遇到的):
上传下载二进制数据
上传进度事件的支持
跨域请求
同时结合html5中的File API，我们就可以在网页中实现更丰富的功能。

一) 二进制数据处理
以前通过 XHR 抓取二进制 blob 形式的文件是很痛苦的事情。从技术上来说，这甚至是不可能的实现。有一种广为流传的一种技巧，是将 MIME 类型替换为由用户定义的字符集，如下所示：


	var xhr = new XMLHttpRequest();
	xhr.open('GET', '/path/to/image.png', true);
	  
	xhr.overrideMimeType('text/plain; charset=x-user-defined');
	  
	xhr.onreadystatechange = function(e) {
	  if (this.readyState == 4 && this.status == 200) {
		var binStr = this.responseText;
		for (var i = 0, len = binStr.length; i < len; ++i) {
		  var c = binStr.charCodeAt(i);
		  //String.fromCharCode(c & 0xff);
		  var byte = c & 0xff;
		}
	  }
	};
	  
	xhr.send();


虽然这种方法可行，但是 responseText 中实际返回的并不是二进制 blob，而是代表图片文件的二进制字符串。我们要巧妙地让服务器在不作处理的情况下，将这些数据传递回去。
现在XHR2中，新增了responseType和response属性，可以告知浏览器我们希望返回什么格式的数据。
xhr.responseType
在发送请求前，根据您的数据需要，将 xhr.responseType 设置为“text”、“arraybuffer”、“blob”或“document”。请注意，设置（或忽略）xhr.responseType = '' 会默认将响应设为“text”。
xhr.response
成功发送请求后，xhr 的响应属性会包含 DOMString、ArrayBuffer、Blob 或 Document 形式（具体取决于 responseTyp  的设置）的请求数据。
凭借这个优秀的新属性，我们可以修改上一个示例：以 ArrayBuffer 而非字符串的形式抓取图片。将缓冲区移交给 BlobBuilder API 可创建 Blob： 

	BlobBuilder = window.MozBlobBuilder || window.WebKitBlobBuilder || window.BlobBuilder;
	  
	var xhr = new XMLHttpRequest();
	xhr.open('GET', '/path/to/image.png', true);
	xhr.responseType = 'arraybuffer';
	  
	xhr.onload = function(e) {
	  if (this.status == 200) {
		var bb = new BlobBuilder();
		bb.append(this.response); // Note: not xhr.responseText
	  
		var blob = bb.getBlob('image/png');
		...
	  }
	};
	  
	xhr.send();



此外ArrayBuffer是二进制数据通用的固定长度容器。如果您需要原始数据的通用缓冲区，ArrayBuffer 就非常好用，但是它真正强大的功能是让您使用 JavaScript 类型数组创建底层数据的“视图”。实际上，可以通过单个 ArrayBuffer 来源创建多个视图。例如，您可以创建一个 8 位整数数组，与来自相同数据的现有 32 位整数数组共享同一个 ArrayBuffer。底层数据保持不变，我们只是创建其不同的表示方法。

	var xhr = new XMLHttpRequest();
	xhr.open('GET', '/path/to/image.png', true);
	xhr.responseType = 'arraybuffer';
	  
	xhr.onload = function(e) {
	  var uInt8Array = new Uint8Array(this.response); // this.response == uInt8Array.buffer
	  // var byte3 = uInt8Array[4]; // byte at offset 4
	  ...
	};
	  
	xhr.send();


如果您要直接处理 Blob 且/或不需要操作任何文件的字节，可使用xhr.responseType='blob'


	window.URL = window.URL || window.webkitURL;  // Take care of vendor prefixes.
	  
	var xhr = new XMLHttpRequest();
	xhr.open('GET', '/path/to/image.png', true);
	xhr.responseType = 'blob';
	  
	xhr.onload = function(e) {
	  if (this.status == 200) {
		var blob = this.response;
	  
		var img = document.createElement('img');
		img.onload = function(e) {
		  window.URL.revokeObjectURL(img.src); // Clean up after yourself.
		};
		img.src = window.URL.createObjectURL(blob);
		document.body.appendChild(img);
		...
	  }
	};
	  
	xhr.send();
	

Blob 可用于很多场合，包括保存到 indexedDB、写入 HTML5 文件系统 或创建 Blob 网址（如本例中所示）。
二)发送数据
能够下载各种格式的数据固然是件好事，但是如果不能将这些丰富格式的数据送回本垒（服务器），那就毫无意义了。XMLHttpRequest 有时候会限制我们发送 DOMString 或 Document (XML) 数据。但是现在不会了。现已替换成经过修改的 send() 方法，可接受以下任何类型：DOMString、Document、FormData、Blob、File、ArrayBuffer。本部分的其余内容中的示例演示了如何使用各类型发送数据。
1)发送字符串数据：xhr.send(DOMString)


	function sendText(txt) {
	  var xhr = new XMLHttpRequest();
	  xhr.open('POST', '/server', true);
	  xhr.responseType ='text';  xhr.onload = function(e) {
		if (this.status == 200) {
		  console.log(this.responseText);
		}
	  };
	  
	  xhr.send(txt);
	}
	  
	sendText('test string');


提交表单：xhr.send(FormData)


	function sendForm() {
	  var formData = new FormData();
	  formData.append('username', 'johndoe');
	  formData.append('id', 123456);
	  
	  var xhr = new XMLHttpRequest();
	  xhr.open('POST', '/server', true);
	  xhr.onload = function(e) { ... };
	  
	  xhr.send(formData);
	}


由form数据初始化formData

	<form id="myform" name="myform" action="/server">
	  <input type="text" name="username" value="johndoe">
	  <input type="number" name="id" value="123456">
	  <input type="submit" onclick="return sendForm(this.form);">
	</form>


	function sendForm(form) {
	  var formData = new FormData(form);
	  
	  formData.append('secret_token', '1234567890'); // Append extra data before send.
	  
	  var xhr = new XMLHttpRequest();
	  xhr.open('POST', form.action, true);
	  xhr.onload = function(e) { ... };
	  
	  xhr.send(formData);
	  
	  return false; // Prevent page from submitting.
	}


同时可以包含文件上传


	function uploadFiles(url, files) {
	  var formData = new FormData();
	  
	  for (var i = 0, file; file = files[i]; ++i) {
		formData.append(file.name, file);
	  }
	  
	  var xhr = new XMLHttpRequest();
	  xhr.open('POST', url, true);
	  xhr.onload = function(e) { ... };
	  
	  xhr.send(formData);  // multipart/form-data
	}
	  
	document.querySelector('input[type="file"]').addEventListener('change', function(e) {
	  uploadFiles('/server', this.files);
	}, false);


上传文件或 blob：xhr.send(Blob)，同时demo下上传事件如果使用


	<progress min="0" max="100" value="0">0% complete</progress>


	function upload(blobOrFile) {
	  var xhr = new XMLHttpRequest();
	  xhr.open('POST', '/server', true);
	  xhr.onload = function(e) { ... };
	  
	  // Listen to the upload progress.
	  var progressBar = document.querySelector('progress');
	  xhr.upload.onprogress = function(e) {
		if (e.lengthComputable) {
		  progressBar.value = (e.loaded / e.total) * 100;
		  progressBar.textContent = progressBar.value; // Fallback for unsupported browsers.
		}
	  };
	  
	  xhr.send(blobOrFile);
	}
	  
	// Take care of vendor prefixes.
	BlobBuilder = window.MozBlobBuilder || window.WebKitBlobBuilder || window.BlobBuilder;
	  
	var bb = new BlobBuilder();
	bb.append('hello world');
	  
	upload(bb.getBlob('text/plain'));


上传字节：xhr.send(ArrayBuffer)

	function sendArrayBuffer() {
	  var xhr = new XMLHttpRequest();
	  xhr.open('POST', '/server', true);
	  xhr.onload = function(e) { ... };
	  
	  var uInt8Array = new Uint8Array([1, 2, 3]);
	  
	  xhr.send(uInt8Array.buffer);
	}

三)跨源请求 (CORS)
CORS 允许一个域上的网络应用向另一个域提交跨域 AJAX 请求。启用此功能非常简单，只需由服务器发送一个响应标头即可。
允许来自 example.com 的请求：


	Access-Control-Allow-Origin: http://example.com


要允许任何域向您提交请求：

	Access-Control-Allow-Origin: *


提交跨域请求时和以前没有区别。


	var xhr = new XMLHttpRequest();
	xhr.open('GET', 'http://www.example2.com/hello.json');
	xhr.onload = function(e) {
	  var data = JSON.parse(this.response);
	  ...
	}
	xhr.send();


四)有用的实例
1)下载文件并保存到文件系统


	window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
	  
	function onError(e) {
	  console.log('Error', e);
	}
	  
	var xhr = new XMLHttpRequest();
	xhr.open('GET', '/path/to/image.png', true);
	xhr.responseType = 'arraybuffer';
	  
	xhr.onload = function(e) {
	  
	  window.requestFileSystem(TEMPORARY, 1024 * 1024, function(fs) {
		fs.root.getFile('image.png', {create: true}, function(fileEntry) {
		  fileEntry.createWriter(function(writer) {
	  
			writer.onwrite = function(e) { ... };
			writer.onerror = function(e) { ... };
	  
			var bb = new BlobBuilder();
			bb.append(xhr.response);
	  
			writer.write(bb.getBlob('image/png'));
	  
		  }, onError);
		}, onError);
	  }, onError);
	};
	  
	xhr.send();


2)分割文件并上传各个部分



	window.BlobBuilder = window.MozBlobBuilder || window.WebKitBlobBuilder ||
						 window.BlobBuilder;
	  
	function upload(blobOrFile) {
	  var xhr = new XMLHttpRequest();
	  xhr.open('POST', '/server', true);
	  xhr.onload = function(e) { ... };
	  xhr.send(blobOrFile);
	}
	  
	document.querySelector('input[type="file"]').addEventListener('change', function(e) {
	  var blob = this.files[0];
	  
	  const BYTES_PER_CHUNK = 1024 * 1024; // 1MB chunk sizes.
	  const SIZE = blob.size;
	  
	  var start = 0;
	  var end = BYTES_PER_CHUNK;
	  
	  while(start < SIZE) {
	  
		// Note: blob.slice has changed semantics and been prefixed. See http://goo.gl/U9mE5.
		if ('mozSlice' in blob) {
		  var chunk = blob.mozSlice(start, end);
		} else {
		  var chunk = blob.webkitSlice(start, end);
		}
	  
		upload(chunk);
	  
		start = end;
		end = start + BYTES_PER_CHUNK;
	  }
	}, false);
	  
	})();



