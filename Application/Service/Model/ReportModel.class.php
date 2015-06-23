<?php
namespace Service\Model;

/**
 * 举报相关业务逻辑
 * @author zhenkai.ding
 *
 */
class ReportModel extends BaseModel {
	
	public function addReport($uid, $postId) {
		$data        		= array();
		$data['uid'] 		= $uid;
		$data['post_id'] 	= $postId;
// 		$sql = "replace into `report` (post_id,uid) values ($postId, $uid)";
		$this->add($data, array(), true);
		return true;
	}
}