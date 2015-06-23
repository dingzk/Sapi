<?php
namespace Service\Model;

class PushMapModel extends BaseModel {
	
	# 绑定客户端id
	public function bindClientId($uid, $clientId, $os = 0) {
		$insertId = null;
		if (!empty($uid) && !empty($clientId)) {
			$map 				= array();
			$map['uid'] 		=  $uid;
			$map['client_id'] 	=  $clientId;
			$res 				= $this->where($map)->find();	# 这里没有判断操作系统平台
			if (empty($res)) {
				$map['os']      	= $os;
				$map['created_at']  = date('Y-m-d H:i:s', time());
				$insertId 			= $this->add($map);
			} else {
				$insertId       	= $res['id'];
			}
		}
		return $insertId;
	}
	
	# 解绑客户端id
	public function unbindClientId($uid, $clientId, $os = 0) {
		if (!empty($uid) && !empty($clientId)) {
			$map 				= array();
			$map['uid'] 		=  $uid;
			$map['client_id'] 	=  $clientId;
			$res 				= $this->where($map)->delete();	# 这里没有判断操作系统平台
		}
		return true;
	}
	
	# 根据用户id获取clientId
	public function getCIdByUid($uid) {
		$clientIds      = array(); 
		if (!empty($uid)) {
			$map 		= array();
			$map['uid'] = $uid;
			$map['os']  = 0;
			$res 		= $this->where($map)->field("client_id")->select();
			if (!empty($res)) {
				$clientIds = $this->getArrFieldVals($res, "client_id");
			}
		}
		
		return $clientIds;
	}
}