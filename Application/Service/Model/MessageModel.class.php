<?php
namespace Service\Model;

/**
 * 消息总览
 * @author zhenkai.ding
 *
 */
class MessageModel extends BaseModel {
	
	public function addMessage($uid, $msgId, $type) {
		$status 				= false;
		if ($msgId) {
			$data 				= array();
			$data['uid']	 	= $uid;
			$data['msg_id'] 	= $msgId;
			$data['type'] 		= intval($type);
			$res 				= $this->where($data)->field('id')->select();
			if (!$res) {
				$data['created_at'] = date('Y-m-d H:i:s', time());
				$status 			= $this->add($data);
			}
		}

		
		return $status ? true : false;
 	}
 	
 	public function delMessageById($msgId, $type) {
 		$map 			= array();
 		$map['msg_id'] 	= $msgId;
 		$map['type'] 	= intval($type);
 		
 		$status 		= $this->where($map)->delete();
 		
 		return $status === false ? false : true;
 	}
 	
 	public function delMessageByIds($msgIds, $type) {
 		$map 				= array();
 		if ($msgIds) {
 			$map['msg_id'] 	= array('in', (array)$msgIds);
 			$map['type'] 	= intval($type);
 		}
 		
 		$status 		= $this->where($map)->delete();
 		
 		return $status === false ? false : true;
 	}
 	
 	public function getMessage($uid, $offset = 0, $perNum = 20) {
 		$messages 			= array();
 		if ($uid) {
 			$map 			= array();
 			$map['uid'] 	= $uid;
 			if ($offset > 0) {
 				$map['id'] 	= array("lt", intval($offset));
 			}
 			$messages 		= $this->where($map)->field("id, uid, msg_id, type")->order('id desc')->limit($perNum)->select();
 		}
 		
 		return $messages;
 	}
}