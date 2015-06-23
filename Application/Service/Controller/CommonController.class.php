<?php
namespace Service\Controller;

use Think\Controller;
use Think\Log;

/**
 * 提供公用处理模块
 * @author zhenkai.ding
 *
 */
class CommonController extends Controller {
	
	protected  $uid 		= 0;	# 初始化用户id
	
	private $_actionName    = "";
	
    public function _initialize() {
        # 过滤post,get,session内容非法字符
        if (get_magic_quotes_gpc() == 0) {
            if (!empty($_GET)) {
                $_GET  = addslashesDeep($_GET);
            }
            
            if (!empty($_POST)) {
                $_POST = addslashesDeep($_POST);
            }
            
            $_REQUEST  = addslashesDeep($_REQUEST);
        }
		
        # http only
        $sessionId 		= isset($_COOKIE['H5SessionId']) ? $_COOKIE['H5SessionId'] : "";
        $sessionToken 	= isset($_COOKIE['SessionToken']) ? $_COOKIE['SessionToken'] : "";
        
//         $sessionId = "fbd77954-52b0-4016-b896-6de83c835d44";
//         $sessionToken = "d5912757-07f9-49b9-98a8-dccfb6dc5211622";
		$this->_actionName = strtolower(ACTION_NAME);
/* 		if (!in_array($this->_actionName, $this->whiteList($sessionToken))) {
			# 登录全局验证
			$authObj 	= new AuthController();
			$this->uid  = $authObj->getUserId($sessionId, $sessionToken);	# 这里做权限控制
		} */
		$this->uid = 39;
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
    
    # 把数组中的某一个字段作为key
    protected function setKeyByField($arr, $field) {
    	$arrKey 	= array();
    	if (!empty($arr)) {
			foreach ($arr as $value) {
				if (isset($value[$field])) {
					$arrKey[$value[$field]] = $value;
				}
			}
		}
    	return $arrKey;
    }
    
    # 调用不存在的函数的魔术方法
    public function __call($method, $args) {
    	return "method:'".$method."'is not exist!";
    }
    
    # 白名单过滤
    private function whiteList($sessionToken = "") {
    	# 未登录情况下
    	$res 		= array();
    	if (empty($sessionToken)) {
    		$res 	= array("getHotCity", "getPostsByPlace", "suggest", "getLikedInfoByPostId", "feedBack", 'uploadImg', 'postDetail');
    	} else {
    		$res 	= array("getHotCity", "getLikedInfoByPostId", "feedBack", 'uploadImg');
    	}
    	
    	$res 		= array_map("strtolower", $res);
    	
    	return $res;
    	
    }
    
    # 根据字段名称获取offset
    protected function getOffsetByField($arr, $field) {
    	$offset             = 0;
    	$num 				= count($arr);
    	if ($num) {
    		$offset 		= isset($arr[$num - 1][$field]) ? $arr[$num - 1][$field] : 0;
    		$offset         = intval($offset);
    	}
    	
    	return $offset;
    }
    
    # 调用hook类中相应的处理方法
    protected function hookHandler($hookFunc) {
    	$module 	= MODULE_NAME;
    	$obj 		= A($module."/Hook");
    	if (method_exists($obj, $hookFunc)) {
    		call_user_func(array($obj, $hookFunc));
    	} else {
    		Log::write($module."/".$hookFunc." is not defined !");
    		die("Hook error !");
    	}
    }
    
    # 通用分页模块
    protected function getPage($list, $perNum, $field = 'id') {
    	$lastId 		= 0;
    	$isRest         = 0;
    	$list           = array_values((array)$list);			# 把对应的key去掉
    	if (!empty($list)) {
    		if (count($list) > $perNum) {
    			$isRest = 1;
    			array_pop($list);
    		}
    		$lastId     = $this->getOffsetByField($list, $field);
    	}
    	
    	return array("list" => $list, "has_rest" => $isRest, "offset" => $lastId);
//     	return array($info, $isRest, $lastId);
    }
    
    # 按照给定的id顺序来对数组排序
    protected function sortByKey($keys, $sortArr) {
    	$sortRes         = array();
    	foreach ($keys as $key) {
    		if (isset($sortArr[$key])) {
    			$sortRes[$key] = $sortArr[$key];
    		}
    	}
    
    	return $sortRes;
    }
    
}
