<?php
namespace Api\Controller;

use Router\Router\Router;
/**
 * 提供post相关业务逻辑
 * @author zhenkai.ding
 *
 */
class LikedController extends CommonController {
	
	public function _initialize() {
		parent::_initialize();
	}
	
	# 点赞
	public function like() {
		$postId 		= $_REQUEST['post_id'];
		$state 			= $_REQUEST['state'];
		$likedNum	 	= Router::run($postId, $state);
		$res            = array("likedNum" => $likedNum, "state" => $state);
		
		$this->echoRes($res);
		
	}
	
	# 获取post_id下点赞的信息和赞信息
	public function getLikedInfoByPostId() {
		$postId 		= $_REQUEST['post_id'];
		$perNum 		= isset($_REQUEST['perNum']) ? $_REQUEST['perNum'] : 20;
		$offset 		= isset($_REQUEST['offset']) ? $_REQUEST['offset'] : 0;
		$userInfo		= Router::exec('Liked', 'getLikedInfoByPostIdV2', array($postId, $offset, $perNum));
		
		$userInfo['dest'] = isset($userInfo['list'][0]['dest']) ? $userInfo['list'][0]['dest'] : '';	# 把地点拼在外面;
		
		$this->echoRes($userInfo);
	}
	
	# 获取用户点赞的列表
	public function myLiked() {
		$perNum 		= isset($_REQUEST['perNum']) ? $_REQUEST['perNum'] : 20;
		$offset 		= isset($_REQUEST['offset']) ? $_REQUEST['offset'] : 0;
		$likedList		= Router::run($offset, $perNum);
		
		$this->echoRes($likedList);
	}
	
	# 根据用户id获取用户新消息的个数
	public function getNewsNum() {
		$num			= Router::run();
		
		$this->echoRes($num);
	
	}
	
	# 获取用户新消息的列表
	public function getNewsList() {
		$offset 		= isset($_REQUEST['offset']) ? $_REQUEST['offset'] : 0;
		$perNum 		= isset($_REQUEST['perNum']) ? $_REQUEST['perNum'] : 20;
		
		$result			= Router::run($offset, $perNum);
		
		$this->echoRes($result);
		
	}
	
}