<?php
namespace Admin\Controller;
use Think\Controller;

// 导入路由模块
import("Service.Router.Router");

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

    #需要登录
    Public function needLogin (){
        if(session('username')){
            $this->assign('username', session('username'));
        }else{
            redirect('/index.php/Admin/Login/index');
        }
    }
}
