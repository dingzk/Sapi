<?php
namespace Sapi\Controller;
use Router\Router\Router;

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
	public function post() {
		$commentPostObj	= $this->reqInfo->getCommentReqInfo();
		$postId 		= $commentPostObj->getPostId();
		$content        = $commentPostObj->getContent();
		$pid 			= $commentPostObj->getAtCommentId();
		$pid            = empty($pid) ? 0 : $pid;
		$status	 		= Router::run($postId, $content, $pid);
		$this->err_code = $status ? self::SUCCESS_CODE : self::ERR_CODE;
		
		$this->echoRes();
	}
	
	# 获取一个帖子的相关评论
	public function getComments() {
		$commentListObj 		= $this->reqInfo->getCommentListReqInfo();
		$postId 				= $commentListObj->getPostId();
		list($offset, $perNum) 	= $this->getPageInfo($commentListObj);
		$comments 				= Router::run($postId, $offset, $perNum);
		
		$commentList      		= $comments['list'];				# list
		$hasRest           		= $comments['has_rest'];
		$offset            		= $comments['offset'];
		
		$commonPbController 	= new CommonPbController();
		$postCommentsObj 		= new \PostComments();
		$totalNum 				= Router::exec('Comments', 'getCnt', array($postId));
		$postCommentsObj->setTotalNum($totalNum);
		$postCommentsObj        = $commonPbController->setCommentRespInfo($commentList, $postCommentsObj);
		$postCommentsObj 		= $this->wrapPageInfo($postCommentsObj, $offset, $hasRest);
		
		$this->resInfo->setPostComments($postCommentsObj);
		
		$this->echoRes();
	}
	
	# 删除一个评论
	public function delComment() {
		$commentId 		= $this->reqInfo->getCommentId();
		$status 		= Router::run($commentId);
		$this->err_code = $status ? self::SUCCESS_CODE : self::ERR_CODE;
		
		$this->echoRes();
	}
	
}
