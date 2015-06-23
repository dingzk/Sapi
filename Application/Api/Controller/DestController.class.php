<?php
namespace Api\Controller;
use Router\Router\Router;

/**
 * 基于地点搜索的相关逻辑
 * @author zhenkai.ding
 *
 */

class DestController extends CommonController {
	
	public function _initialize() {
		parent::_initialize();
	}
	
	# 搜索suggest
	public function suggest() {
		$place 					= $_REQUEST['dest'];
		$posts                  = array();
		if (!empty($place)) {
			$posts	 	= Router::run($place);
		}
		$this->echoRes($posts);
	}	
	
	# 根据目的地获取发帖列表
	public function getPostsByPlace() {
		
		$place 					= $_REQUEST['dest']; 
		$length 				= isset($_REQUEST['perNum']) ? $_REQUEST['perNum'] : 20;		
		$offset 				= isset($_REQUEST['offset']) ? $_REQUEST['offset'] : 0;		
		
		$posts                  = array();
		if (!empty($place)) {
			$posts	 	= Router::run($place, $offset, $length);
		}
		$this->echoRes($posts);
	
	}
	
	public function getHotCity() {
		$result		= Router::run();
		
		$this->echoRes($result);
	}
	
}