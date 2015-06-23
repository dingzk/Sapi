<?php
namespace Api\Controller;
use Think\Controller;

// 导入路由模块
import("Service.Router.Router");

class CommonController extends Controller {
	
	const NO_LOGIN 			= 3;	# 用户没有登录
	const INFO_NOT_COMPLETE = 2;	# 用户信息不完整
	const ERR_CODE      	= 1;	# 数据库相关错误
	const SUCCESS_CODE  	= 0;
	
	protected  $err_code 	= self::SUCCESS_CODE;
	protected  $err_msg 	= 'ok';
	private   $data 		= ''; //可能是单值，也可能是数组
	private   $retRes     	= array();
	
    public function _initialize() {
        # 过滤post,get,cookie,session内容非法字符
        if (get_magic_quotes_gpc() == 0) {
            if (!empty($_GET)) {
                $_GET  = addslashesDeep($_GET);
            }
            
            if (!empty($_POST)) {
                $_POST = addslashesDeep($_POST);
            }
            
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
    
    # 包装数据格式
    protected function wrapData($data) {
    	$this->data 	= $data;
    	
    	$this->retRes = array(
    			'code' => $this->err_code,
    			'msg'  => $this->err_msg,
    			'data' => $this->data
    	);
    	
    	return json_encode($this->retRes);
    }
    
    # 处理错误结果函数
    protected function resHandler($code, $msg) {
    	$this->err_code = $code;
    	$this->err_msg  = $msg;
    	return ;
    }
    
    # 返回数据包装
    protected function echoRes($res) {
    	
    	if ($res === null || $res === false) {
    		$this->resHandler(self::ERR_CODE, 'error');
    	}
    	
    	$ret 		= $this->wrapData($res);
    	echo $ret;
    	
    	exit;
    }
    
}
