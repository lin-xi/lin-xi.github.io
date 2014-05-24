---
layout: post
title: gps纠偏数据库及gps纠偏算法PHP
description: gps纠偏数据库及gps纠偏算法PHP
category: blog
---


##利用0.01精度校正库offset.dat文件修正中国地图经纬度偏移。
gps设备获取的经纬度跟实际地图经纬度有偏移，大陆地图是这样的。google地图存在偏移是众所周知的事实，说到底就是火星坐标系和真实gps之间的转换，我国所有的地图为了安全起见都作了加偏。

具体偏移原因见: gps纠偏及大陆地图偏移原因。

总之，gps是从卫星上获取的经纬度，是准确的：GPS坐标转换经纬度及换算方法。实际的地图都在原有的基础上加偏移值，天朝说是为了安全呗。因此，gps获取出来的经纬度直接在地图上展示，那肯定是不准确的，有偏差。当然不管google map,百度地图，搜狗地图等每一个都一样，但是他们的偏移算法肯定不一样，偏移的值也不一样。

google的国内地图坐标都是加过密的，由高德提供。百度的地图数据也是加过密的，估计是四维提供。但是不同批次的数据加密后的坐标是有偏差的。总而言之，相对GPS数据，两种地图都是有偏差的。

经纬度在http://maps.google.com和google earth上可以准确对应，但是在ditu.google.cn和百度地图上得到的总是偏移的

既然有了偏移，就需要使用纠偏来解决gps定位问题，

##GPS坐标转百度坐标方法：

http://api.map.baidu.com/ag/coord/convert?from=0&to=4&x=’.经度.’&y=’.纬度
google目前没有类似百度这样的，只能通过纠偏数据库进行校验。

纠偏数据库都是要钱的，0.001精度2-5k都有卖，我网上找到一个0.01精度的，是一个 offset.dat 文件, 总共74.9M,数据为9813675条,不敢独享，分享给大家.

##google纠偏数据库：

http://file.yanue.net/map/offset.dat.

基于该数据库，我搞个的纠偏接口

##免费纠偏接口: 

http://map.yanue.net/gpsApi.php

参数:

lat: gps原始纬度,如22.502412986242,请保留小数点3位以上

lng: gps原始经度,如113.93832783228,请保留小数点3位以上

gps纠偏工具：

http://map.yanue.net/gps.html

说正题，有了偏移数据库之后，根据算法就可以完成目的了。

下面贴出纠偏算法

##php利用offset.dat修正gps经纬度的算法：

	<?php
	/**
	 * gps经纬度修正
	 *
	 * 功能说明:利用0.01精度校正库offset.dat文件修正中国地图经纬度偏移。
	 *         该校正适用于 Google map China, Microsoft map china ,MapABC 等，这些地图构成方法是一样的。
	 * 使用方法:
			$gps = new GpsOffset();
			echo $gps->geoLatLng($lat,$lng);
	 * 注意: 请在服务器开启offset.dat读取权限
	 * @author yanue (yanue@outlook.com)
	 * @version 1.0
	 * @copyright yanue.net
	 * @time 2013-06-30
	 */

	class GpsOffset {
		const datMax = 9813675;# 该文件最大数据为9813675条
		private $fp = null;
		/*
		 * 构造函数，打开 offset.dat 文件并初始化类中的信息
		 * @param string $filename
		 * @return null
		 */
		function __construct($filename = "offset.dat") {
			if (($this->fp = @fopen($filename, 'rb')) !== false) {
				//注册析构函数，使其在程序执行结束时执行
				register_shutdown_function(array(&$this, '__construct'));
			}
		}

		/*
		 * 读取dat文件并查找偏移像素值
		 * 说明:
		 * dat文件结构:该文件为0.01精度校正数据,并以lng和lat递增形式组合.
		 * 其中以8个字节为一组:
		 * lng : 2字节经度,如12151表示121.51
		 * lat : 2字节纬度,如3130表示31.30
		 * x_off : 2字节地图x轴偏移像素值
		 * y_off : 2字节地图y轴偏移像素值
		 * 因此采用二分法并以lng+lat的值作为条件
		 * 注意:请在服务器开启offset.dat读取权限
		 *
		 */
		private function fromEarthToMars($lat,$lng){
			$tmpLng=intval($lng * 100);
			$tmpLat=intval($lat * 100);
			$left = 0; //开始记录
			$right = self::datMax; //结束记录
			$searchLngLat = $tmpLng.$tmpLat;
			// 采用用二分法来查找查数据
			while($left <= $right){
				$recordCount =(floor(($left+$right)/2))*8; // 取半
				fseek ( $this->fp, $recordCount , SEEK_SET ); // 设置游标
				$c = fread($this->fp,8); // 读8字节
				$lng = unpack('s',substr($c,0,2));
				$lat = unpack('s',substr($c,2,2));
				$x = unpack('s',substr($c,4,2));
				$y = unpack('s',substr($c,6,2));
				$curLngLat=$lng[1].$lat[1];
				if ($curLngLat==$searchLngLat){
					fclose($this->fp);
					return array('x'=>$x[1],'y'=>$y[1]);
					break;
				}else if($curLngLat<$searchLngLat){
					$left=($recordCount/8) + 1;
				}else if($curLngLat>$searchLngLat){
					$right=($recordCount/8) - 1;
				}
			}
			fclose($this->fp);
			return false;
		}

		// 转换经纬度到
		public function geoLatLng($lat,$lng){
			$offset =$this->fromEarthToMars($lat,$lng);
			$lngPixel=$this->lngToPixel($lng,18)+$offset['x'];
			$latPixel=$this->latToPixel($lat,18)+$offset['y'];
			$mixLat = $this->pixelToLat($latPixel,18);
			$mixLng = $this->pixelToLng($lngPixel,18);
			return array('lat'=>$mixLat,'lng'=>$mixLng);
		}
		//经度到像素X值
		private function lngToPixel($lng,$zoom) {
			return ($lng+180)*(256<<$zoom)/360;
		}

		//纬度到像素Y值
		private function latToPixel($lat, $zoom) {
			$siny = sin($lat * pi() / 180);
			$y=log((1+$siny)/(1-$siny));
			return (128<<$zoom)*(1-$y/(2*pi()));
		}

		//像素X到经度
		private function pixelToLng($pixelX,$zoom){
			return $pixelX*360/(256<<$zoom)-180;
		}

		//像素Y到纬度
		private function pixelToLat($pixelY, $zoom) {
			$y = 2*pi()*(1-$pixelY /(128 << $zoom));
			$z = pow(M_E, $y);
			$siny = ($z -1)/($z +1);
			return asin($siny) * 180/pi();
		}

		public function __destruct(){
			if($this->fp){
				fclose($this->fp);
			}
			$this->fp = null;
		}
	}
参考文章：http://go2log.com/2011/08/30/%E4%B8%AD%E5%9B%BD%E5%9C%B0%E5%9B%BE%E5%81%8F%E7%A7%BB%E6%A0%A1%E6%AD%A3php%E7%AE%97%E6%B3%95/