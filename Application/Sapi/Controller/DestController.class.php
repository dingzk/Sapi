<?php
namespace Sapi\Controller;
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
	
	# 根据目的地获取发帖列表
	public function getPostsByPlace() {
		$destInfo 					= $this->reqInfo->getPostByDestInfo();
		$place 						= $destInfo->getDest();
		list($lastId, $length)      = $this->getPageInfo($destInfo);		# list不能使用在非数字索引的数组
		
		$pageInfo	 				= Router::run($place, $lastId, $length);
		$postList                   = $pageInfo['list'];					# list
		$hasRest                    = $pageInfo['has_rest'];
		$offset                   	= $pageInfo['offset'];
		
		$commonPbController     	= new CommonPbController();
		$postResponseInfoListObj	= new \PostResponseInfoList();
		$postResponseInfoListObj	= $commonPbController->setPostResponseInfo($postList, $postResponseInfoListObj);
		
		$postResponseInfoListObj    = $this->wrapPageInfo($postResponseInfoListObj, $offset, $hasRest);
		
		$this->resInfo->setPostInfoList($postResponseInfoListObj);
		
		$this->echoRes();
	}
	
	# 获取热门城市
	public function getHotCity() {
		$cityList			= Router::exec("Dest", "getHotCityForApp");
		$commonPbController = new CommonPbController();
		$this->resInfo 		= $commonPbController->setHotCity($cityList, $this->resInfo);
		
		$this->echoRes();
	}
	
}