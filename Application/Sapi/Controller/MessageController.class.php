<?php
namespace Sapi\Controller;

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
	
	# 消息列表
	public function getMsgList() {
		list($offset, $perNum)  = $this->getPageInfo($this->reqInfo);
		$pageInfo	 			= Router::run($offset, $perNum);
		
		$msgList                = $pageInfo['list'];				# list
		$hasRest                = $pageInfo['has_rest'];
		$offset                 = $pageInfo['offset'];
		
		$commonPbController     = new CommonPbController();
		$msgListObj 			= new \CommonMessageList();
		$msgListObj 			= $commonPbController->setCommonMessage($msgList, $msgListObj);
		
		$msgListObj 			= $this->wrapPageInfo($msgListObj, $offset, $hasRest);
		
		$this->resInfo->setCommonMessageList($msgListObj);
		
		$this->echoRes();
	}

}