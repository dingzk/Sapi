<?php
namespace Service\Controller;

use Service\Model\MessageModel;
use Service\Model\LikedModel;
use Service\Model\CommentsModel;
/**
 * 消息相关
 * @author zhenkai.ding
 *
 */
class MessageController extends CommonController {
	
	private $liked_msg;			# 点赞消息类型
	private $comment_msg;		# 评论消息类型
	
	public function _initialize() {
		parent::_initialize();
		$this->liked_msg 	= C('LIKED_MSG');
		$this->comment_msg 	= C('COMMENT_MSG');
	}
	
	# 获取消息列表
	public function getMsgList($offset = 0, $perNum = 20) {
		$uid          		 = $this->uid;
		$pageInfo     		 = array();
		$messageList  		 = array();
		$messageModel 		 = new MessageModel();
		$messages     		 = $messageModel->getMessage($uid, $offset, $perNum + 1);
		if ($messages) {
			$likedMsgs		 = array();
			$commentMsgs 	 = array();
			list($likedIds, $commentIds) = $this->getMsgIds($messages);
			if ($likedIds) {
				$likedMsgs	 = $this->getLikedMsgListByIds($likedIds);
				$likedMsgs   = $this->setType($likedMsgs, $this->liked_msg);
			}
			if ($commentIds) {
				$commentMsgs = $this->getCommentMsgListByIds($commentIds);
				$commentMsgs = $this->setType($commentMsgs, $this->comment_msg);
			}
			$msgs 			 = array_merge((array)$likedMsgs, (array)$commentMsgs);
			$msgHashMap   	 = $this->getHashMap($messages);
			$messageList     = $this->wrapMsg($msgHashMap, $msgs);
		}
		$pageInfo		 = $this->getPage($messageList, $perNum);
		
		return $pageInfo;
	}
	
	# 区别消息类型
	private function setType($arr, $type) {
		if (!empty($arr)) {
			foreach ($arr as &$value) {
				$value['type'] = $type;
			}
		}
		
		return $arr;
	}
	
	# 获取相对应的消息id
	private function getMsgIds($messages) {
		$likedIds  		= array();
		$commentIds 	= array();
		if ($messages) {
			foreach ($messages as $msg) {
				$id     = $msg['id'];
				$type 	= intval($msg['type']);
				$msgId 	= $msg['msg_id'];
				switch ($type) {
					case $this->liked_msg:
						$likedIds[] 	= $msgId;
						break;
					case $this->comment_msg:
						$commentIds[] 	= $msgId;
						break;
					default:
						break;
				}
			}
		}
		
		return array($likedIds, $commentIds);
	}
	
	private function wrapMsg($msgIdMap, $msgInfo) {
		$msgList = array();
		if ($msgIdMap) {
			foreach ($msgIdMap as $id => $hashKey) {
				$msgList[$id] 	= array();
				if (isset($msgInfo[$hashKey])) {
					$msgInfoTmp 			= $msgInfo[$hashKey];
					$msgId                  = $msgInfoTmp['id'];
					unset($msgInfoTmp['id']);
					$msgList[$id]			= $msgInfoTmp;
					$msgList[$id]['msg_id'] = $msgId;		# message表中的msg_id
					$msgList[$id]['id'] 	= $id;			# message表中的id
				}
			}
		}
		
		return $msgList;
	}
	
	private function getHashMap(array $arr) {
		$map = array();
		if ($arr) {
			foreach ($arr as $v) {
				if (isset($v['id']) && isset($v['type']) && isset($v['msg_id'])) {
					$map[$v['id']] = $v['msg_id'].'#'.$v['type'];
				}
			}
		}
		
		return $map;
	}
	
	private function getHashKey(array $arr, $field = 'id', $type) {
		$hashKeyArr = array();
		if ($arr) {
			foreach ($arr as $v) {
				if (isset($v[$field])) {
					$hashKey 				= $v[$field].'#'.$type;
					$hashKeyArr[$hashKey] 	= $v;
				}
			}
		}
		
		return $hashKeyArr;
	}
	
	# 根据ids找到对应的消息(默认按照顺序输出)
	private function getLikedMsgListByIds($ids) {
		$likeList   	= array();
		$likedModel 	= new LikedModel();
		$likedListTmp   = $likedModel->getLikedInfoByIds($ids);
		$likeList   	= $likedModel->wrapNewsList($likedListTmp, false);
		$likeList		= $this->getHashKey($likeList, 'id', $this->liked_msg);
		
		return $likeList;
	}
	
	private function getCommentMsgListByIds($ids) {
		$commentList 	= array();
		$commentsModel 	= new CommentsModel();
		$commentListTmp = $commentsModel->getCommentsByIds($ids);
		$commentList    = $commentsModel->wrapCommentMsgList($commentListTmp);
		$commentList	= $this->getHashKey($commentList, 'id', $this->comment_msg);
		
		return $commentList;
	}
	
	
	
}