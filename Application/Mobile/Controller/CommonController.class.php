<?php
namespace Mobile\Controller;
use Think\Controller;

class CommonController extends Controller {
	
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
        if($_COOKIE['SessionToken']){
            cookie('TourpalCheck', md5($_COOKIE['SessionToken']));
        }else{
            cookie('TourpalCheck', null);
        }
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
    
    #获取当前url完整地址
    Public function get_url() {
        $sys_protocal = isset($_SERVER['SERVER_PORT']) && $_SERVER['SERVER_PORT'] == '443' ? 'https://' : 'http://';
        $php_self     = $_SERVER['PHP_SELF'] ? $_SERVER['PHP_SELF'] : $_SERVER['SCRIPT_NAME'];
        $path_info    = isset($_SERVER['PATH_INFO']) ? $_SERVER['PATH_INFO'] : '';
        $relate_url   = isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : $php_self.(isset($_SERVER['QUERY_STRING']) ? '?'.$_SERVER['QUERY_STRING'] : $path_info);
        return $sys_protocal.(isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : '').$relate_url;
    }
}
