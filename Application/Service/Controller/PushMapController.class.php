<?php
namespace Service\Controller;

use Service\Model\PushMapModel;
/**
 * 用户客户端id和用户的映射关系
 * @author zhenkai.ding
 *
 */
class PushMapController extends CommonController {
	
	const ANDROID = 0;	# 安卓
	const IOS = 1;		# ios
	
	public function _initialize() {
		parent::_initialize();
	}
	
	
	public function bind($clientId, $os = self::ANDROID) {
		$uid 		= $this->uid;
		$pushMap 	= new PushMapModel();
		$insertId 	= $pushMap->bindClientId($uid, $clientId, $os);
		return $insertId;
	}
	
	
	public function unbind($clientId, $os = self::ANDROID) {
		$uid 		= $this->uid;
		$pushMap 	= new PushMapModel();
		$status 	= $pushMap->unbindClientId($uid, $clientId, $os);
		return $status;
	}
	
	public function getClientId($uid = NULL) {
		$uid 		= empty($uid) ? $this->uid : $uid;
		$pushMap 	= new PushMapModel();
		$clientIds 	= $pushMap->getCIdByUid($uid);
		return $clientIds;
	}
}