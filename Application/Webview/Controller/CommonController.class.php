<?php
namespace Webview\Controller;
use Think\Controller;

import("Service.Analysis.HM");
use Analysis\HM\_HMT;

class CommonController extends Controller {
	
	const BAIDU_STAT_KEY = 'df55fa73d178f98a02dac94ae5da5cf9'; 	# 百度统计的KEY
	
    public function _initialize() {
        # 过滤post,get,cookie,session内容非法字符
        if (get_magic_quotes_gpc() == 0) {
            if (!empty($_GET)) {
                $_GET  = addslashesDeep($_GET);
            }
            
            if (!empty($_POST)) {
                $_POST = addslashesDeep($_POST);
            }
            
            $_COOKIE   = addslashesDeep($_COOKIE); 
            $_REQUEST  = addslashesDeep($_REQUEST);
        }
        #百度统计
		$_hmt = new _HMT(self::BAIDU_STAT_KEY);
		$_hmtPixel = $_hmt->trackPageView();
		$this->assign('hmtPixel', $_hmtPixel);
    }
    
    # 获取数组中的某一个字段的值
    protected function getArrFieldVals(array $arr, $field) {
    	$fieldVals 		= array();
    	if (!empty($arr)) {
    		foreach ($arr as $value) {
    			if (isset($value[$field])) {
    				$fieldVals[] = $value[$field];
    			}
    		}
    	}
    	return $fieldVals;
    }
}
