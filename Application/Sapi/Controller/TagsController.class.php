<?php
namespace Sapi\Controller;

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
	
	public function getPostsByTagName () {
		$tagInfoReq 				= $this->reqInfo->getPostByTagInfo();
		$tagName					= $tagInfoReq->getTag();
		list($lastId, $length) 		= $this->getPageInfo($tagInfoReq);	# list不能使用在非数字索引的数组
		
		$pageInfo					= Router::run($tagName, $lastId, $length);
		$postList               	= $pageInfo['list'];
		$hasRest                	= $pageInfo['has_rest'];
		$offset                 	= $pageInfo['offset'];

		$commonPbController     	= new CommonPbController();
		$postResponseInfoListObj	= new \PostResponseInfoList();
		$postResponseInfoListObj	= $commonPbController->setPostResponseInfo($postList, $postResponseInfoListObj);
		
		$postResponseInfoListObj    = $this->wrapPageInfo($postResponseInfoListObj, $offset, $hasRest);
		
		$this->resInfo->setPostInfoList($postResponseInfoListObj);
		
		$this->echoRes();
	}
	
}