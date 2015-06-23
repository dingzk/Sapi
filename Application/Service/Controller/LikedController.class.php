<?php
namespace Service\Controller;

use Service\Model\LikedModel;
use Service\Model\UserModel;
use Service\Model\PostsModel;

/**
 * 点赞相关业务逻辑
 * @author zhenkai.ding
 *
 */
class LikedController extends CommonController {
	
	public function _initialize() {
		parent::_initialize();
	}
	
	# 点赞
	public function like($postId, $state) {
		$uid 		= $this->uid;
		$likeModel 	= new LikedModel();
		$userModel  = new UserModel();								# 首先判断该人信息完整不完整
		$userInfo 	= $userModel->getUserInfoById($uid);
		if (empty($userInfo['nick_name']) || empty($userInfo['sex']) || (empty($userInfo['weixin']) && empty($userInfo['qq']) && empty($userInfo['phone']))) {
			$this->hookHandler("setUserInfoNotComplete");			# 使用hook处理用户信息不完整的情况
		}
		$likdNum 	= $likeModel->like($uid, $postId, $state);
		if ($state) {												# 点赞push
			$pushObj   = new PushController();
			$pushObj->push($postId);
		}
		
		return $likdNum;
	}
	
	# 获取post_id下点赞的人的用户信息
	public function getLikedInfoByPostId($postId, $offset = 0, $perNum = 20) {
		$userList 			= array();
		if ($postId) {
			$likeModel 		= new LikedModel();
			$userList   	= $likeModel->getLikedUserByPostId($postId, $offset, $perNum +1 ); 			# 多获取一个看看下面还有没有
		}
		$pageInfo 			= $this->getPage($userList, $perNum, 'liked_id');
		
		return $pageInfo;
	}
	
	# 获取post_id下点赞的人的用户信息,升级版本
	public function getLikedInfoByPostIdV2($postId, $offset = 0, $perNum = 20) {
		$userList 		 	= array();
		if ($postId) {
			$likeModel 		= new LikedModel();
			$userList   	= $likeModel->getLikedUserInfoByPostId($postId, $offset, $perNum +1 ); 		# 多获取一个看看下面还有没有
		}
		$pageInfo 			= $this->getPage($userList, $perNum, 'liked_id');
		
		return $pageInfo;
	}
	
	# 获取我的求同行列表
	public function myLiked($offset = 0, $perNum = 20) {
		$uid 					= $this->uid;
		$likedPosts  			= array();
		$isRest 			 	= 0;
		$lastId				 	= $offset;
		if ($uid) {
			$likeModel 		 	= new LikedModel();
			$LikedListInfo   	= $likeModel->getLikedListByUid($uid, $offset, $perNum+1);
			$likedIds           = $this->getArrFieldVals($LikedListInfo, 'id');
			$postIds 			= $this->getArrFieldVals ($LikedListInfo, 'post_id');
			if (! empty ($postIds)) {
				if (count ($postIds) > $perNum) {
					$isRest = 1;
					array_pop ($postIds); // 再把最后一个去掉
					array_pop ($likedIds); // 再把最后一个去掉
				}
				$lastId 		= min ($likedIds);
				$postModel 		= new PostsModel();
				$likedPosts 	= $postModel->getPostsByIds($uid, $postIds); 			# 按照点赞的先后顺序
			}
		}
		
		return array("list" => $likedPosts, "has_rest" => $isRest, "offset" => $lastId);
	}
	
	# 获取用户新消息的个数
	public function getNewsNum($uid = NULL) {
		$uid        = empty($uid) ? $this->uid : $uid;
		$num       	= 0;
		$likeModel 	= new LikedModel();
		$num		= $likeModel->getNewLikedByUid($uid);
		
		return $num;
	}
	
	# 获取用户新消息的列表	
	public function getNewsList($offset = 0, $perNum = 20, $status = TRUE) {
		$uid       		= $this->uid;
		
		$newsList 		= array();
		$postsModel     = new PostsModel();												# 根据用户id获取用户发表了哪些帖子的ids
		$postIds 		= $postsModel->getPostIdsByUid($uid);
		if (!empty($postIds)) {
			$likeModel 	= new LikedModel();
			$likes 		= $likeModel->getLikedInfoByPostIds($postIds, $offset, $perNum + 1);
			$newsList 	= $likeModel->wrapNewsList($likes, $status);
		}
		$pageInfo 		= $this->getPage($newsList, $perNum, 'id');		
		
		return $pageInfo;
	}
	
	# 把新消息标记为已读
	public function setRead(array $ids) {	# liked表中的ids
		$likeModel 	= new LikedModel();
		$status     = $likeModel->setReadByIds($ids);
		
		return $status;
	}
	
	
}