<?php
namespace Service\Model;

class PostTagModel extends BaseModel {
	
	public function addPostTag($uid, $postId, $tagIds) {
		$result 		= true;
		if (!$tagIds || !$postId || !$uid) {
			return false;
		}
		$map 				= array();
		$map['uid'] 		= $uid;
		$map['post_id'] 	= $postId;
		$map['tag_id'] 		= array('in', (array) $tagIds);						# 看看是否已经存在
		$tagInfo       		= $this->where($map)->field('tag_id')->select();
		if ($tagInfo) {
			$tagTmpIds   	= $this->getArrFieldVals($tagInfo, 'tag_id');
			$tagIds 		= array_diff($tagIds, $tagTmpIds);					# 找到剩余需要添加进去的id
		}
		
		if ($tagIds) {
			$dataList		= array();
			foreach ($tagIds as $tagId) {
				$dataList[] = array('uid' => $uid, 'post_id' => $postId, 'tag_id' => $tagId);
			}
			$result 	= $this->addAll($dataList);
		}
		
		return $result;
	}
	
	public function delPostTag($uid, $postId) {
		$map 			= array();
		$map['uid'] 	= $uid;
		$map['post_id'] = $postId;
		$status         = $this->where($map)->delete();
		
		return $status === false ? false : true;
	}
	
	public function getTagIdsByPostIds($postIds) {
		$postTagIds 		= array();
	
		if (!empty($postIds)) {
			$map 			= array();
			$map['post_id'] = array("in", $postIds);
			$res 			= $this->where($map)->field("post_id, tag_id")->order('id asc')->select();	# 这里注意保证写入和输出的tag顺序一样
			if (!empty($res)) {
				foreach ($res as $v) {
					$postTagIds[$v['post_id']][] = $v['tag_id'];
				}
			}
		}
	
		return $postTagIds;
	}
	
	public function getTagIdsByPostId($postId) {
		$postTagIds 		= array();
		
		if (!empty($postId)) {
			$map 			= array();
			$map['post_id'] = $postId;
			$res 			= $this->where($map)->field("tag_id")->select();			# 这里注意保证写入和输出的tag顺序一样
			if (!empty($res)) {
				$postTagIds = $this->getArrFieldVals($res, 'tag_id');
			}
		}
		
		return $postTagIds;
	}
	
	private function wrapTagIds(array $postTags) {
		$tagIds 	= array();
		if (!empty($postTags)) {
			foreach ($postTags as $v) {
				$tagIds = array_merge($tagIds, array_values($v)) ;
			}
		}
	
		return array_unique($tagIds);
	}
	
	public function getTagInfoByPostIds($postIds) {
		$tagInfo  		= array();
		
		$postTags 		= $this->getTagIdsByPostIds($postIds);
		$tagModel 		= new TagsModel();
		$tagIds    		= $this->wrapTagIds($postTags);				# 获取所有tagIds
		$tagIdNames 	= $tagModel->getTagNameByIds($tagIds);		# postId-> tagInfo
	
		if (!empty($postTags)) {
			foreach ($postTags as $postId => $tagIdsTmp) {
				foreach ($tagIdsTmp as $tagId) {
					$tagInfo[$postId][]  	= isset($tagIdNames[$tagId]) ? $tagIdNames[$tagId] : array();
				}
			}
		}
	
		return $tagInfo;
	}
	
	public function getTagInfoByPostId($postId) {
		$tagInfo  		= array();
		
		$tagIds 		= $this->getTagIdsByPostId($postId);
		$tagModel 		= new TagsModel();
		$tagInfoTmp 	= $tagModel->getTagNameByIds($tagIds);
		
		$tagInfo        = $this->sortByKey($tagIds, $tagInfoTmp);	# 使其输出和写入的顺序一致
		
		return $tagInfo;
	}
	
	public function getPostIdsByTagId($tagId, $offset = 0, $perNum = 20) {
		$postIds 			= array();
		if ($tagId) {
			$map 			= array();
			$map['tag_id'] 	= $tagId;
			if ($offset > 0) {
				$map['post_id'] = array("lt", intval($offset));								# 按照发帖时间(post_id)逆序排列
			}
			$postIdTmp 		= $this->where($map)->field('post_id')->order("id desc")->limit($perNum)->select();
			$postIds        = $this->getArrFieldVals($postIdTmp, 'post_id');
		}
		
		return $postIds;
	}
	
}