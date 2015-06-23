<?php
namespace Api\Controller;

use Router\Router\Router;
/**
 * 提供标签相关业务逻辑
 * @author zhenkai.ding
 *
 */

class TagsController extends CommonController {
	
	public function _initialize() {
		parent::_initialize();
	}
	
	public function getTags() {
		$tags 	= Router::run();
		
		$this->echoRes($tags);
	}
	
	public function getPostsByTagName () {
		$tagName 	= $_REQUEST['tag'];
		$length 	= isset($_REQUEST['perNum']) ? $_REQUEST['perNum'] : 20;
		$offset 	= isset($_REQUEST['offset']) ? $_REQUEST['offset'] : 0;
		$pageInfo	= Router::run($tagName, $offset, $length);
		
		$this->echoRes($pageInfo);
	}
	
}