<?php
namespace Service\Model;

class PostDestModel extends BaseModel {
	
	protected    $tableName = 'post_dest_v2';	# 切换数据表操作
	
	# 增加单个目的地
	public function addDest($uid, $postId, $destId) {
		
		$data 					= array();
		
		$data['uid']			= $uid;
		$data['post_id']		= $postId;
		$data['dest_id']		= $destId;
		
		# 判断有没有重复插入
		$insertId 				= $this->where($data)->getField("id");
		if (empty($insertId)) {
			$data['created_at']	= date("Y-m-d H:i:s", time());
			$insertId 			= $this->add($data);
		}
		
		return $insertId;
	}
	
	# 增加多个目的地
	public function addDests($uid, $postId, $destIds) {
		
		$insertIds      = array();
		
		if (!empty($destIds)) {
			foreach ($destIds as $destId) {
				$data 					= array();
				$data['uid']			= $uid;
				$data['post_id']		= $postId;
				$data['dest_id']		= $destId;
				# 判断有没有重复插入
				$insertId 				= $this->where($data)->getField("id");
				if (empty($insertId)) {
					$data['created_at']	= date("Y-m-d H:i:s", time());
					$insertId 			= $this->add($data);
				}
				$insertIds[] 			= $insertId;
			}
			$insertIds	= array_filter($insertIds);
			$insertIds  = empty($insertIds) ? array() : $insertIds;
		}
		
		return $insertIds;
	}
	
	# 删除目的地
	public function delPostDest($uid, $postId) {
		$map 			= array();
		$map['uid'] 	= $uid;
		$map['post_id'] = $postId;
		$status 		= $this->where($map)->delete();
		
		return $status === false ? false : true;
	}
	
	# 获取目的地id下的post_id,递归获取多有子节点id
	public function getPostIdByDestId($destId, $offset = 0, $perNum = 20) {
		$postIds 		= array();
		$map 			= array();
		$map['dest_id'] = $destId;
		if ($offset > 0) {
			# 按照时间(id)逆序排列
			$map['post_id'] = array("lt", intval($offset));
		}
		$result 		= $this->where($map)->field("post_id")->order("post_id desc")->limit($perNum)->select();
		if (!empty($result)) {
			$postIds = $this->getArrFieldVals($result, "post_id");
		}
		
		return $postIds;
	}
	
	# 获取目的地ids下的post_id,递归获取多有子节点id
	public function getPostIdByDestIds($destIds, $offset = 0, $perNum = 20) {
		$postIds 		= array();
		$map 			= array();
		$map['dest_id'] = array('in', $destIds);
		if ($offset > 0) {
			# 按照时间(id)逆序排列
			$map['post_id'] = array("lt", intval($offset));
		}
		$result 		= $this->where($map)->field("post_id")->order("post_id desc")->limit($perNum)->select();
		if (!empty($result)) {
			$postIds = $this->getArrFieldVals($result, "post_id");
		}
	
		return $postIds;
	}
	
	# 根据发帖id获取目的地id
	public function getDestIdByPostId($postId) {
		$destIds 		= array(); 
		$map 			= array();
		$map['post_id'] = $postId;
		$res 			= $this->where($map)->field("dest_id")->select();
		if (!empty($res)) {
			$destIds 	= $this->getArrFieldVals($res, "dest_id"); 
		}
		
		return $destIds;
	}
	
	# 根据发帖id获取目的地
	public function getDestByPostId($postId) {
		$dests          = array();
		$destIds        = $this->getDestIdByPostId($postId);
		if (!empty($destIds)) {
			$destModel 	= new DestModel();						# 要按照顺填写的地点的顺序输出
			$destsTmp   = $destModel->getPlaceByIds($destIds);
			foreach ($destIds as $destId) {
				if (isset($destsTmp[$destId]['place'])) {
					$dests[$destId] = $destsTmp[$destId]['place'];
				}
			}
		}
		
		return $dests;
	}
	
	# 根据发帖ids获取目的地ids
	public function getDestIdsByPostIds($postIds) {
		$postDests 		= array(); 
		
		if (!empty($postIds)) {
			$map 			= array();
			$map['post_id'] = array("in", $postIds);
			$res 			= $this->where($map)->field("post_id, dest_id")->select();
			if (!empty($res)) {
				foreach ($res as $v) {
					$postDests[$v['post_id']][] = $v['dest_id'];
				}
			}
		}
		
		return $postDests;
	}
	
	private function wrapDestIds(array $postDests) {
		$destIds 	= array();
		if (!empty($postDests)) {
			foreach ($postDests as $v) {
				$destIds = array_merge($destIds, array_values($v)) ;
			}
		}
		
		return array_unique($destIds);
	}
	
	# 根据发帖ids获取目的地信息
	public function getDestInfoByPostIds($postIds) {
		
		$placeInfo  = array();
		$postDests 	= $this->getDestIdsByPostIds($postIds);
		$destModel 	= new DestModel();
		$destIds    = $this->wrapDestIds($postDests);			# 获取所有目的地
		$destInfo 	= $destModel->getPlaceByIds($destIds);		# dest_id->place
		
		if (!empty($postDests)) {
			foreach ($postDests as $postId => $destIds) {		# 因为这里可能允许添加多个目的地
				foreach ($destIds as $destId) {
					$placeInfo[$postId][]  	= isset($destInfo[$destId]) ? $destInfo[$destId] : array();
				}
			}
		}
		
		return $placeInfo;
		
	}
	
}