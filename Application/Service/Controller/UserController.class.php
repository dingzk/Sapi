<?php
namespace Service\Controller;

use Service\Model\UserModel;
/**
 * 用户相关业务逻辑
 * @author zhenkai.ding
 *
 */

class UserController extends CommonController {
	
	public function _initialize() {
		parent::_initialize();
	}
	
	# 根据用户id获取用户的信息
	public function getUserInfoById($uid = NULL) {
		$uid 		= $uid === NULL ? $this->uid : $uid;
		$userModel 	= new UserModel();
		$userInfo  	= $userModel->getUserInfoById($uid);
		$userInfo['is_complete'] = 0;												# 判断用户信息完善不完善
		if (!empty($userInfo)) {
			$userInfo = array_map("trim", $userInfo);
			if(!empty($userInfo['nick_name']) && !empty($userInfo['sex']) && (!empty($userInfo['weixin']) || !empty($userInfo['qq']) || !empty($userInfo['phone']))) {
				$userInfo['is_complete'] 	= 1;
				$userInfo['integrity'] 		= $this->getIntegrity($userInfo);		# 计算用户信息完整度
			}
		}
		
		return $userInfo;
	}
	
	# 修改用户信息
	public function userSave($fields) {
		$uid 		= $this->uid;
		$userModel  = new UserModel();
		$status     = $userModel->userSave($uid, $fields);
		
		return $status;
	}
	
	# 修改用户的隐私
	public function editPrivacy($privacyFields) {
		$uid 		= $this->uid;
		$userModel  = new UserModel();
		$status     = $userModel->editPrivacy($uid, $privacyFields);
		
		return $status;
	}
	
	# 用户上传头像
	public function uploadHeadImg($imgStream) {
		$uid            = $this->uid;
		$imgController 	= new ImagesController();
		$imgs          	= $imgController->stream2Img(array($imgStream));
		$img 			= array_pop($imgs);
		$userModel      = new UserModel();
		$status 		= $userModel->saveHeadImg($uid, $img);
		
		return $status;
	}
	
	# 计算用户信息完整度
	private function getIntegrity($userInfo) {
		$integrity = 0;
		# 定义权重
		$define = array(
				'head_img' 		=> 20,
				'nick_name'		=> 10,
				'sex'			=> 10,
				'age'			=> 10,
				'sign'			=> 10,
				'dest_wanted'	=> 10,
				'dest_gone'		=> 10,
				'residence'		=> 10,
				'preferList'    => 10,
		);
		if ($userInfo) {
			foreach ($userInfo as $field => $value) {
				if (!empty($value)) {
					if (isset($define[$field])) {
						$integrity += $define[$field];
					}
				}
			}
		}
		
		return $integrity;
	}
	
}