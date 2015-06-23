<?php
namespace Sapi\Controller;

use Router\Router\Router;

/**
 * 提供用户相关业务逻辑
 * @author zhenkai.ding
 *
 */
class UserController extends CommonController {
	
	public function _initialize() {
		parent::_initialize();
	}
	
	# 提供用户相关业务逻辑
	public function getUserInfoById() {
		$uid 					 = $this->reqInfo->getUserId();
		$uid 					 = isset($uid) && !empty($uid) ? $uid : NULL;
		$userInfo 				 = Router::run($uid);
		
		$commonPbController      = new CommonPbController();
		$userInfoObj             = $commonPbController->setUserInfo($userInfo);
		$this->resInfo->setUserInfo($userInfoObj);
		
		$this->echoRes();
	}
	
	# 用户信息的编辑
	public function userSave() {
		$userInfoObj 			 = $this->reqInfo->getUserInfo();
		$fields             	 = array();
		$fields['nick_name'] 	 = $userInfoObj->getNickName();
		$fields['sex'] 			 = $userInfoObj->getSex();
		$fields['age']			 = $userInfoObj->getAge();
		$fields['weixin'] 		 = $userInfoObj->getWeixin();
		$fields['qq'] 			 = $userInfoObj->getQq();
		$fields['phone'] 		 = $userInfoObj->getPhone();
		$fields['group_visible'] = $userInfoObj->getGroupVisible();
		$fields['visible_item']  = $userInfoObj->getVisibleItem();
		$fields['sign'] 	 	 = $userInfoObj->getSelfSign();
		$fields['dest_wanted'] 	 = $userInfoObj->getWannaGoDest();
		$fields['dest_gone']     = $userInfoObj->getHaveBeenDest();
		$fields['residence']     = $userInfoObj->getResidence();							# 常驻地id
		$fields['preferList']	 = $userInfoObj->getTravelPeferIterator()->getArrayCopy();	# 旅行偏好
		
		$status 				 = Router::run($fields);
		
		$this->err_code          = $status ? self::SUCCESS_CODE : self::ERR_CODE;
		
		$this->echoRes();
	}
	
	# 上传用户头像
	public function uploadHeadImg() {
		$imgStream         		= $this->reqInfo->getImg();
		$status 				= Router::run($imgStream);
		$userInfo 				= Router::exec('User', 'getUserInfoById', array());
		
		$commonPbController     = new CommonPbController();
		$userInfoObj            = $commonPbController->setUserInfo($userInfo);
		
		$this->resInfo->setUserInfo($userInfoObj);
		$this->err_code         = $status ? self::SUCCESS_CODE : self::ERR_CODE;
		
		$this->echoRes();
	}
	
}