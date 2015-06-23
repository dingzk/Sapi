<?php
namespace Service\Controller;

use Service\Model\TagsModel;
use Service\Model\PostTagModel;
use Service\Model\PostsModel;
/**
 * 标签相关的操作
 * @author zhenkai.ding
 *
 */

class TagsController extends CommonController {
	
	public function _initialize() {
		parent::_initialize();
	}
	
	public function getTags() {
		$tagModel = new TagsModel();
		$tags     = $tagModel->getTags();	
		return $tags;
	}
	
	# 根据标签进行搜索
	public function getPostsByTagName($tagName, $offset = 0, $perNum = 20) {
		$uid				= $this->uid;
		$pageInfo 			= array();
		$tagModel 			= new TagsModel();
		$tagId 				= $tagModel->getIdByTagName($tagName);
		$postList			= array();
		if ($tagId) {
			$postTagModel 	= new PostTagModel();
			$postIds 		= $postTagModel->getPostIdsByTagId($tagId, $offset, $perNum + 1);
			if ($postIds) {
				$postsModel = new PostsModel();
				$postList	= $postsModel->getPostsByIds($uid, $postIds);							# 按照顺序输出
			}
		}
		$pageInfo = $this->getPage($postList, $perNum, 'id');
		
		return $pageInfo;
	}
}