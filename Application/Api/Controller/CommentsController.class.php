<?php
namespace Api\Controller;
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
		$postId 	= $_REQUEST['post_id'];
		$content 	= $_REQUEST['content'];
		$pid 		= empty($_REQUEST['replyToId']) ? 0 : $_REQUEST['replyToId'];
		$status	 	= Router::run($postId, $content, $pid);
		
		$this->echoRes($status);
	}
	
	# 获取一个帖子的相关评论
	public function getComments() {
		$postId 	= $_REQUEST['post_id'];
		$perNum 	= isset($_REQUEST['perNum']) ? $_REQUEST['perNum'] : 20;
		$offset 	= isset($_REQUEST['offset']) ? $_REQUEST['offset'] : 0;
		$comments 	= Router::run($postId, $offset, $perNum);
		
		$this->echoRes($comments);
	}
	
	
}
