<?php
namespace Service\Controller;

use Service\Model\CommentsModel;
/**
 * 评论相关业务逻辑
 * @author zhenkai.ding
 *
 */
class CommentsController extends CommonController {
	
	public function _initialize() {
		parent::_initialize();
	}
	
	# 添加评论
	public function post($postId, $content, $pid = 0) {
		$uid 			= $this->uid;
		$commentsModel 	= new CommentsModel();
		$status 		= $commentsModel->post($postId, $uid, $content, $pid);
		
		return $status;
	}
	
	# 获取一个帖子的相关评论
	public function getComments($postId, $offset = 0, $perNum = 20) {
		$myId           = $this->uid;
		$commentsModel 	= new CommentsModel();
		$commentList 	= $commentsModel->getCommentsByPostId($postId, $offset, $perNum + 1);		# 按顺序输出
		$commentList    = $commentsModel->wrapCommentList($myId, $commentList);						# 包装评论信息
		$pageInfo		= $this->getPage($commentList, $perNum);									# 通用分页模块
		
		return $pageInfo;
	}
	
	# 获取帖子评论个数
	public function getCnt($postId) {
		$commentsModel 	= new CommentsModel();
		$totalNum 		= $commentsModel->getCntByPostId($postId);
		
		return $totalNum;
	}
	
	public function delComment($commentId) {
		$uid 			= $this->uid;
		$commentsModel 	= new CommentsModel();
		$status         = $commentsModel->delCommentByUid($uid, $commentId);
		
		return $status;
	}
	
}
