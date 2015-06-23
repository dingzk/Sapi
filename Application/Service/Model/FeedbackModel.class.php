<?php
namespace Service\Model;

class FeedbackModel extends BaseModel {
	
	public function addData($uid, $data) {
		$insertId 				= false;
		if (!empty($data)) {
			if (empty($uid)) {
				# 用户不登录
				$ip 			= getClientIp();
				$uid 			= ip2long($ip);
			}
			$map 				= array();
			$map['uid'] 		= $uid;
			$res				= $this->where($map)->order("id desc")->find();
				
			$d       			= array();
			$d['uid']			= $uid;
			$d['bugs']			= $data['bugs'];
			
			$addMsg             = ""; 
			if (!empty($data['phone'])) {
				$addMsg.= " 电话: ".$data['phone'];
			}
			if (!empty($data['qq'])) {
				$addMsg.= " qq: ".$data['qq'];
			}
			if (!empty($data['email'])) {
				$addMsg.= " 邮箱: ".$data['email'];
			}
			$d['bugs']		   .= $addMsg;
			
			$d['created_at']	= date("Y-m-d H:i:s", time());
				
			if (empty($res)) {
				$insertId 		= $this->add($d);
			} else {
				$created    	= strtotime($res['created_at']);
				if (time() - $created > 5) {	# 防止用户重复提交，大于5秒才可以重新提交
					$insertId 	= $this->add($d);
				}
			}

		}

		
		return $insertId;
	}
}