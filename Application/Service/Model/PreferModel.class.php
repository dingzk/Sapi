<?php
namespace Service\Model;

/**
 * 旅行偏好相关逻辑
 * @author zhenkai.ding
 *
 */
class PreferModel extends BaseModel {

	const BASE_TAG = 0;			# 基础标签
	const SELF_TAG = 1;			# 自定义的标签
	
	public function getIdsByTagNames(array $tagNames) {
		$tagNames       = array_unique($tagNames);
		$tagNames       = array_map('trim', $tagNames);
	
		$tagIds         = array();
		if (!empty($tagNames)) {
			$map 			 = array();
			$map['tag'] 	 = array('in', $tagNames);
			$tagNameRes      = $this->where($map)->field("id, tag")->select();
			if (!empty($tagNameRes)) {
				$tagIds		 = $this->getArrFieldVals($tagNameRes, 'id');
			}
			if (count($tagNameRes) != count($tagNames)) {
				$tagNamesDb  = $this->getArrFieldVals($tagNameRes, 'tag');
				$tagNameSelf = array_diff($tagNames, $tagNamesDb);			# 用户自定义的标签
				$tagIds      = array_merge((array)$tagIds, (array)$this->addTags($tagNameSelf));
			}
		}
	
		return $tagIds;
	
	}
	
	public function addTags(array $tags) {
		$insertIds				= array();
		if (!empty($tags)) {
			$data 				= array();
			foreach ($tags as $tag) {
				$data['tag'] 	= $tag;
				$data['status'] = self::SELF_TAG;
				$insertId 		= $this->add($data);
				$insertIds[] 	= $insertId;
			}
		}
		$insertIds = array_filter($insertIds);
	
		return $insertIds;
	}
	
	public function getTags() {
		$map 			= array();
		$map['status'] 	= self::BASE_TAG;
		$tagsTmp        = $this->where($map)->field("tag")->select();
		$tagNames       = $this->getArrFieldVals($tagsTmp, 'tag');
		return $tagNames;
	}
	
	public function getTagNameByIds(array $tagIds) {
		$tagNames 		= array();
		if (!empty($tagIds)) {
			$map 		= array();
			$map['id'] 	= array('in', $tagIds);
			$tagNames 	= $this->where($map)->field('id, tag')->select();
			$tagNames 	= $this->setKeyByField($tagNames, 'id');
		}
	
		return $tagNames;
	}
	
}