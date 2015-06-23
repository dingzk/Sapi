<?php
namespace Service\Controller;

define("STAT_PATH", dirname(__FILE__)."/../Stat/");	# 软连到/data/stat下
/**
 * 提供打点相关统计
 * @author zhenkai.ding
 *
 */
class StatController extends CommonController {
	
	public function _initialize() {
		# 不需要初始化父类
	}
	
	public function dot($data) {
		$data		.= ' '.date("YmdHis", time());
		$filename    = STAT_PATH.date('y_m_d').'.log';
		if (!file_exists($filename)) {
			touch($filename);
		}
		error_log($data.PHP_EOL, 3, $filename);
		return true;
	}
	
}