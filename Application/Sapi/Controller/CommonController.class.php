<?php
namespace Sapi\Controller;
use Think\Controller;
use Think\Log;

// 导入路由模块
import("Service.Router.Router");
import("Sapi.Protobuf.ProtoHandler");
use Protobuf\ProtoHandler\ProtoHandler;

class CommonController extends Controller {
	
	const NO_LOGIN 			= 3;	# 用户没有登录
	const INFO_NOT_COMPLETE = 2;	# 用户信息不完整
	const ERR_CODE      	= 1;	# 数据库相关错误
	const SUCCESS_CODE  	= 0;
	
	protected  $err_code 	= self::SUCCESS_CODE;
	protected  $err_msg 	= 'ok';
	protected  $reqInfo 	= '';  # 请求的protobuf对象,待注册
	protected  $resInfo 	= '';  # 返回的protobuf对象,待注册
	
	protected  $clientId 	= '';  # 个推客户端的id 
	
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
        
        # 注册登录信息到全局变量cookie里面
        $packed 	   = isset($_REQUEST['d']) ? $_REQUEST['d'] : "";
        $verify 	   = isset($_REQUEST['v']) ? $_REQUEST['v'] : "";
        
		$this->register($packed, $verify);	# 注册相应的req/res对象
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
    
	/**
	 * 注册一些变量信息到全局
	 * @param string $packed
	 * @param string $verify
	 * @return boolean
	 */
    private function register($packed, $verify) {
    	
    	$this->resInfo = new \ResponseInfo();	# 初始化response对象
    	if (!empty($packed) && !empty($verify)) {
    		try {
    			$protoHandler 		= new ProtoHandler();
    			$reqInfo 			= $protoHandler->getReqMessage($packed, $verify);
    			if ($reqInfo) {
    				$this->reqInfo 	= $reqInfo;	# 注册请求内容的protobuf对象
    				try {
    					$clientInfo 	= $reqInfo->getClientInfo();	# 获取请求客户端的信息
    					$loginInfo  	= $reqInfo->getLoginInfo();		# 获取用户登录相关信息
    					if ($loginInfo) {
    						$sessionId 					= $loginInfo->getSessionId();
    						$sessionToken 				= $loginInfo->getSessionToken();
    						$this->clientId 			= $loginInfo->getPushClientId();
    						$_COOKIE['H5SessionId'] 	= $sessionId;	# 放到超全局变量里面
    						$_COOKIE['SessionToken'] 	= $sessionToken;
    					}
    				} catch (\Exception $e) {
    					Log::write('warn : register cookie error' . $e->getMessage());
    				}
    			}
    		} catch (\Exception $e) {
    			Log::write('Register cookie error: ' . $e->getMessage());
    			$this->returnError();
    		}
    	}
    	# resInfo
    	if (empty($this->reqInfo)) {
    		$this->returnError();
    	}
		
    	return true;
    }
    
    /**
     * 包装Protouf对象并加密返回给客户端
     * @param \ResponseInfo $resInfo
     */
    protected function echoRes() {
    	
    	$resInfo 	= $this->resInfo;
    	$ret 		= "";
    	try {
    		$resInfo->setErrCode($this->err_code);
    		$protoHandler 	= new ProtoHandler();
    		$ret 			= $protoHandler->getResMessage($resInfo);
    	} catch (\Exception $e) {
    		Log::write('Set Error code error: ' . $e->getMessage());
    	}
    	
    	echo  $ret;
    	exit;
    }
    
    /**
     * 访问以及解析出错
     */
    protected function returnError() {
    	$this->err_code = self::ERR_CODE;
    	$this->echoRes();
    }
    
    
    /**
     * 解包分页数据
     */
    protected function getPageInfo($obj) {
    	$offset 		= 0;
    	$length 		= 0;
    	
    	if (is_object($obj)) {
    		try {
    			$pageInfo	= $obj->getPageRequestInfo();
    			$length 	= $pageInfo->getNumPerPage();
    			$offset 	= $pageInfo->getStartOffset();
    		} catch (\Exception $e) {
    			Log::write('get pageInfo error: ' . $e->getMessage());
    		}
    	}
    	return array($offset, $length);
    }
    
    
    /**
     * 包装返回的分页格式
     */
    protected function wrapPageInfo($obj, $offset, $hasRest) {
    	$offset      	= intval($offset);
    	$hasRest		= empty($hasRest) ? false : true;
    	
    	if (is_object($obj)) {
    		try {
    			$pageResInfo = new \PageResponseInfo();
    			$pageResInfo->setEndOffset($offset);
    			$pageResInfo->setHasRest($hasRest);
    			$obj->setPageResponseInfo($pageResInfo);
    		} catch (\Exception $e) {
    			Log::write('wrap pageInfo error: ' . $e->getMessage());
    		}
    	}
    	
    	return $obj;
    }
    
}
