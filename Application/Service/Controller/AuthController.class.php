<?php
namespace Service\Controller;

import("Service.Security.AES");
use Service\Model\UserModel;
use Security\AES\AES;
use Think\Log;

/**
 * 权限验证
 * @author zhenkai.ding
 *
 */
class AuthController extends CommonController {
	
	private $sessionId;
	private $sessionToken;
	
	
	const H5Channel 	= "sdu";
	
	public function _initialize() {
		# 不需要走父类的构造函数
	}
	
	# aes加密
	private function encrypt() {
		$arr  = array(
				"sessionId" => $this->sessionId,
				"sessionToken" => $this->sessionToken
		);
		$str        = json_encode($arr);
		$encrypts 	= AES::AESEncrypt($str);
		$encrypts   = urlencode($encrypts);
		
		return $encrypts; 
	}
	
	# 获取艺龙这边的用户信息
	private function getElongUserInfo() {
		$url 		= C("ELONG_UCENTER")."?req=".$this->encrypt();
		$ret 		= curlPost($url, array(), 10, array("Channel:".self::H5Channel));	# https
		
		$userInfo 	= array();
		if (!empty($ret)) {
			$result = json_decode($ret, true, 512, JSON_BIGINT_AS_STRING);
			if ($result['errorCode'] == 0) {
				$userInfo = isset($result['userInfo']) ? $result['userInfo']: array();
			}
		}
		return $userInfo;
	}
	
	//TODO Restructure
	# 获取用户id(如果没有登录，不予以返回id)
	public function getUserId($sessionId, $sessionToken) {
		$userId                 = false;
		
		if (!empty($sessionId) && !empty($sessionToken)) {
			$this->sessionId 		= $sessionId;
			$this->sessionToken 	= $sessionToken;
			$userInfo 				= $this->getElongUserInfo();
// 			if (!empty($userInfo) && $userInfo['loginLevel'] == 0) { # 拿到用户信息但是没有登录
			if (!empty($userInfo)) { # 拿到用户信息但是没有登录
				$userModel  		 = new UserModel();
				$fields 			 = array();
				$mid 				 = $userInfo['cardNo'];
				$fields['mid']     	 = $mid;
				$fields['nick_name'] = $userInfo['userName'];
				$fields['phone']     = $userInfo['phoneNo'];
				$fields['sex']     	 = $userInfo['sex'] == "M" ? 1 : 2;
				$userId 			 = $userModel->userAdd($mid, $fields);
			}
		}
		
		# 钩子函数处理没有登录的情况
		if (empty($userId)) {
			
			# 用户中心的bug，通过清理cookie来解决
			setcookie('SessionToken', null, time() +3600, '/', 'elong.com');
			setcookie('H5SessionId', null, time() +3600, '/', 'elong.com');
			setcookie('TourpalCheck', null, time() +3600);
			
			$obj = A(MODULE_NAME."/Hook");
			if (is_object($obj)) {
				$obj->noLogin();
			} else {
				Log::write(MODULE_NAME." is not defined !");
				die("Hook error !");
			}
			exit;
		}

		return $userId;
	}
	
}