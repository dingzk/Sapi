<?php
namespace Api\Controller;

use Router\Router\Router;

/**
 * 我的消息列表
 * @author zhenkai.ding
 *
 */
class MessageController extends CommonController {
	
	public function _initialize() {
		parent::_initialize();
	}
	
	public function getMsgList() {
		$length 	= isset($_REQUEST['perNum']) ? $_REQUEST['perNum'] : 20;
		$offset 	= isset($_REQUEST['offset']) ? $_REQUEST['offset'] : 0;
		$msgList	= Router::run($offset, $length);
		
		$this->echoRes($msgList);
	}
}
