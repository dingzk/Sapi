<?php
namespace Sapi\Controller;

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
		
		$req 		= $this->reqInfo->getWannaJoinRequest();
		$postId 	= $req->getPostId();
		$state 		= $req->getState();
		
		$likedNum	= Router::run($postId, $state);
		
		$joinResObj = new \WannaJoinResponse();
		$joinResObj->setWannaJoinNum(intval($likedNum));
		$joinResObj->setWannaJoinState($state);
		$this->resInfo->setWannaJoinResponse($joinResObj);
		
		$this->echoRes();
	}
	
	# 获取post_id下点赞的人的用户信息
	public function getLikedInfoByPostId() {
		
		$wannaInfo 				= $this->reqInfo->getUsersWannaJoinRequestInfo();
		$postId    				= $wannaInfo->getPostId();
		list($offset, $perNum)  = $this->getPageInfo($wannaInfo);
		
		$userInfo				= Router::run($postId, $offset, $perNum);
		
		$userList      			= $userInfo['list'];				# list
		$hasRest           		= $userInfo['has_rest'];
		$offset            		= $userInfo['offset'];
		
        $commonPbController     = new CommonPbController();
        $userInfoListObj        = $commonPbController->setUserInfoList($userList);
		$userInfoListObj 		= $this->wrapPageInfo($userInfoListObj, $offset, $hasRest);
		$this->resInfo->setUserInfoList($userInfoListObj);
		
		$this->echoRes();
	}
	
	# 升级版本
	public function getLikedInfoByPostIdV2() {
		
		$wannaInfo 				= $this->reqInfo->getUsersWannaJoinRequestInfo();
		$postId    				= $wannaInfo->getPostId();
		list($offset, $perNum)  = $this->getPageInfo($wannaInfo);
		
		$userInfo				= Router::run($postId, $offset, $perNum);
		
		$LikedUserInfoList      = $userInfo['list'];				# list
		$hasRest           		= $userInfo['has_rest'];
		$offset            		= $userInfo['offset'];

        $commonPbController     = new CommonPbController();
        $likedMessageListObj    = $commonPbController->setLikedMessageList($LikedUserInfoList);
		$likedMessageListObj 	= $this->wrapPageInfo($likedMessageListObj, $offset, $hasRest);
		
		$this->resInfo->setLikedMessageList($likedMessageListObj);
		
		$this->echoRes();
	}
	
	# 获取用户点赞的列表
	public function myLiked() {
		$userPostObj 				= $this->reqInfo->getPostByUserInfo();
		list($offset, $perNum)  	= $this->getPageInfo($userPostObj);
		$posts	 					= Router::run($offset, $perNum);
		
		$postList                   = $posts['list'];				# list
		$hasRest                    = $posts['has_rest'];
		$offset                   	= $posts['offset'];
		
		$commonPbController     	= new CommonPbController();
		$postResponseInfoListObj	= new \PostResponseInfoList();
		$postResponseInfoListObj	= $commonPbController->setPostResponseInfo($postList, $postResponseInfoListObj);
		
		$postResponseInfoListObj   = $this->wrapPageInfo($postResponseInfoListObj, $offset, $hasRest);
		
		$this->resInfo->setPostInfoList($postResponseInfoListObj);
		
		$this->echoRes();
	}
	
	# 根据用户id获取用户新消息的个数
	public function getNewsNum() {
		
		$num			= Router::run();
		$this->resInfo->setWannaJoinNum(intval($num));
		
		$this->echoRes();
	
	}
	
	# 获取用户新消息的列表
	public function getNewsList() {
		
		$likedMsgReqObj 		= $this->reqInfo->getUsersWannaJoinRequestInfo();
		list($offset, $perNum) 	= $this->getPageInfo($likedMsgReqObj);
		
		$result					= Router::run($offset, $perNum, FALSE);	# 标记为已读的逻辑走单独的接口
		$LikedUserInfoList      = $result['list'];				# list
		$hasRest           		= $result['has_rest'];
		$offset            		= $result['offset'];

        $commonPbController     = new CommonPbController();
        $likedMessageListObj    = $commonPbController->setLikedMessageList($LikedUserInfoList);
		$likedMessageListObj 	= $this->wrapPageInfo($likedMessageListObj, $offset, $hasRest);
		
		$this->resInfo->setLikedMessageList($likedMessageListObj);
		
		$this->echoRes();
	}
	
	# 标记为已读
	public function setRead() {
		$ids 			= $this->reqInfo->getSetReadIdIterator()->getArrayCopy();
		$ids            = array_filter($ids);
		$status			= Router::run($ids);	# 标记为已读的逻辑走单独的接口
		if (!$status) {
			$this->err_code = self::ERR_CODE;
		} else {
			$this->err_code = self::SUCCESS_CODE;
		}
		$this->echoRes();
	}
	
}