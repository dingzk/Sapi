<?php
namespace Api\Controller;

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
		$uid 		= $_REQUEST['uid']; 
		$userInfo 	= Router::run($uid);
		
		$this->echoRes($userInfo);
	}
	
	# 用户信息的编辑
	public function userSave() {
		$fields             	= array();
		$fields['nick_name'] 	= $_REQUEST['nick_name'];
		$fields['sex'] 			= $_REQUEST['sex'];
		$fields['age']			= $_REQUEST['age'];
		$fields['weixin'] 		= $_REQUEST['weixin'];
		$fields['qq'] 			= $_REQUEST['qq'];
		$fields['phone'] 		= $_REQUEST['phone'];
		
		$status 				= Router::run($fields);
		
		$this->echoRes($status);
	}

	# 修改用户的隐私
	public function editPrivacy() {
		$privacyFields          		= array();
		$privacyFields['group_visible'] = $_REQUEST['group_visible'];
		$privacyFields['visible_item'] 	= $_REQUEST['visible_item'];
	
		$status 						= Router::run($privacyFields);
		
		$this->echoRes($status);
	}
	
}