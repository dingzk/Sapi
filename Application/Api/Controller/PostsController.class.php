<?php
namespace Api\Controller;

import('Service.Share.Weixin');
use Router\Router\Router;
use Share\Weinxin\Weixin;
/**
 * 提供post相关业务逻辑
 * @author zhenkai.ding
 *
 */
class PostsController extends CommonController {
	
	public function _initialize() {
		parent::_initialize();
	}
	
	
	public function post() {
		
		$fields               = array();
		$fields['dest']       = $_REQUEST['dest'];
		$fields['start_at']   = $_REQUEST['start_at'];
		$fields['days']       = intval($_REQUEST['days']);
		$fields['weixin']     = isset($_REQUEST['weixin']) ? $_REQUEST['weixin'] : '';
		$fields['qq']     	  = isset($_REQUEST['qq']) ? $_REQUEST['qq'] : '';
		$fields['phone']      = isset($_REQUEST['phone']) ? $_REQUEST['phone'] : '';
		$fields['content']    = $_REQUEST['content'];
		$fields['tags']       = isset($_REQUEST['tags']) ? $_REQUEST['tags'] : '';
		$postPlaceTmp 		  = isset($_REQUEST['post_place']) ? $_REQUEST['post_place'] : '';
		$place 			      = ""; 
		if (!empty($postPlaceTmp)) {
			list( $lat, $lng) = explode(",", $postPlaceTmp);
			if (isset($lng) && isset($lat)) {
				$place 		  = $this->getLocation($lat, $lng);
			}
		}
		$fields['post_place'] = $place;
		$imgStr   			  = isset($_REQUEST['imgs']) ? $_REQUEST['imgs'] : '';
		if (!empty($imgStr)) {
			$fields['imgs']   = explode(",", $imgStr);
		}
		
		$postId 	= Router::run($fields, true);											# 修改成按照地点id发帖
		
		$this->echoRes($postId);
		
	}
	
	# 我的发帖
	public function myPosts() {
		
		$length 	= isset($_REQUEST['perNum']) ? $_REQUEST['perNum'] : 20;
		$offset 	= isset($_REQUEST['offset']) ? $_REQUEST['offset'] : 0;
		$posts	 	= Router::run($offset, $length);
		
		$this->echoRes($posts);
		
	}
	
	# 获取指定帖子的详情
	public function postDetail() {
		$postId 		= $_REQUEST['post_id'];
		$shareUrl 		= $_REQUEST['shareUrl'];
		$postDetail	 	= Router::run($postId);
		$shareInfo      = $postDetail['shareInfo'];
		if (!empty($shareUrl)) {
			$config 	= Weixin::getWXConfig($shareUrl);
			$postDetail['shareInfo']['accessWx'] = $config;
		}
		$this->echoRes($postDetail);
	}
	
	# 我发帖的个数
	public function myPostsCount() {
		$res	 	= Router::run();
		$this->echoRes($res);
	}
	
	# 删除帖子
	public function delPostById() {
		$postId 	= $_REQUEST['post_id'];
		$res	 	= Router::run($postId);
		
		$this->echoRes($res);
	}
	
	# 关闭帖子
	public function closePostById() {
		$postId 	= $_REQUEST['post_id'];
		$res	 	= Router::run($postId);
		
		$this->echoRes($res);
	}
	
	# 根据经纬度获取地理位置
	# 维度，经度
	private function getLocation($lat, $lng) {
		$baseUrl 		= C("BAIDU_PLACE_API");

		$postUrl 		= sprintf($baseUrl, $lat.",".$lng);
		$placeJson 		= xcurl($postUrl);
		$place      	= '';
		if (!empty($placeJson)) {
			$placeInfo  = json_decode($placeJson, true);
			if ($placeInfo['status'] == 0) {
				$result     = $placeInfo['result'];
				$place 		= isset($result['formatted_address']) ? $result['formatted_address'] : "";
			}
		}

		return $place;
	}
	
	
}