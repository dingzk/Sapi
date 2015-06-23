<?php
namespace Service\Model;

/**
 * 评论相关的业务逻辑
 * @author zhenkai.ding
 *
 */
class CommentsModel extends BaseModel {
	
	const NO_READ 			= 0;	# 评论消息未读
	const IS_READ 			= 1;	# 评论消息被读
	
	private $msg_type;				# 消息类别
	
	public function _initialize() {
		parent::_initialize();
		$this->msg_type = C('COMMENT_MSG');
	}
	
	# 发表评论
	public function post($postId, $uid, $content, $pid = 0) {
		$status 				= false;
		if ($uid) {
			$data['post_id']	= $postId;
			$data['uid'] 		= $uid;
			$data['p_id'] 		= $pid;
			$data['p_uid'] 		= $this->getUidByPid($pid);
			$data['content'] 	= $content;
			$data['is_read'] 	= self::NO_READ;
			$data['created_at'] = date('Y-m-d H:i:s', time());
			$insertId 			= $this->add($data);
			$postsModel         = new PostsModel();														# 判断是不是自己评论自己
			$postUid            = $postsModel->getPostInfoById($postId);
			$ownerId 			= $postUid['uid'];
			$addMsgStat			= true;
			if ($uid != $ownerId) {
				$msgModel           = new MessageModel();												# 增加消息
				$addMsgStat			= $msgModel->addMessage($uid, $insertId, $this->msg_type);
			}

			$status             = $addMsgStat !== false && $insertId ? true : false;
		}
		
		return $status ? true : false;
	}
	
	# 用户删除自己的评论
	public function delCommentByUid($uid, $commentId) {
		$map   			= array();
		$map['id'] 		= $commentId;
		$map['uid'] 	= $uid;
		$delCommentStat = $this->where($map)->delete();
		$messageModel   = new MessageModel();															# 删除掉消息
		$delMsgStat   	= $messageModel->delMessageById($commentId, $this->msg_type);	
		
		return $delMsgStat !== FALSE && $delCommentStat !== FALSE ? true : false;
	}
	
	# 根据post_id删除相关评论
	public function delCommentByPostId($postId) {
		$map   			= array();
		$map['post_id'] = $postId;
		$delCommentStat = $this->where($map)->delete();
		$msgIds         = $this->getCommentIdByPostId($postId);
		$messageModel   = new MessageModel();
		$delMsgStat     = $messageModel->delMessageByIds($msgIds, $this->msg_type);
		
		return $delMsgStat !== FALSE && $delCommentStat !== FALSE ? true : false;
	}
	
	# 根据评论id获取评论内容
	public function getCommentById($commentId) {
		if ($commentId) {
			$info = $this->find($commentId);
		}
		$info = empty($info) ? array() : $info;
		
		return $info;
	}
	
	# 根据评论ids获取评论内容
	public function getCommentsByIds($commentIds) {
		$info 				= array();
		if ($commentIds) {
			$map 			= array();
			$map['id'] 		= array('in', (array)$commentIds);
			$info       	= $this->where($map)->order('id desc')->select();
		}
		
		return empty($info) ? array() : $info;
	}
	
	# 根据post_id获取相关的评论
	public function getCommentsByPostId($postId, $offset = 0, $perNum = 20) {
		$comments 			= array();
		if ($postId) {
			$map 			= array();
			$map['post_id'] = $postId;
			if ($offset > 0) {
				$map['id'] 	= array("lt", intval($offset));
			}
			$comments 		= $this->where($map)->field("id, post_id, uid, p_id, p_uid, content, created_at")->order('id desc')->limit($perNum)->select();
		}
		
		return $comments;
	}
	
	# 根据Post_id获取对应的id
	public function getCommentIdByPostId($postId) {
		$commentIds 	= array();
		$map 			= array();
		$map['post_id'] = intval($postId);
		$ids 			= $this->where($map)->field('id')->select();
		$commentIds     = $this->getArrFieldVals($ids, 'id');
		
		return $commentIds;
	}
	
	# 根据p_ids找到相对应的用户的ids
	public function getUidsByPids($pids) {
		$uids 			= array();
		if ($pids) {
			$map 		= array();
			$map['id'] 	= array('in', (array)$pids);
			$uidsTmp    = $this->where($map)->field("uid, p_id")->select();
			$uids     	= $this->setKeyByField($uidsTmp, 'p_id');
		}
		
		return $uids;
	}
	
	# 根据p_id找到uid
	public function getUidByPid($pid) {
		$uid        = 0;
		if ($pid) {
			$map 		= array();
			$map['id'] 	= $pid;
			$uid 		= $this->where($map)->getField('uid');
		}

		return $uid ? $uid : 0;
	}
	
	# 获取参与评论的人员的用户信息
	private function getUserInfoForComment($commentList) {
		$userModel      = new UserModel();
		$replyUids		= $this->getArrFieldVals($commentList, 'p_uid');								# 获取被回复的人的uid
		$uids           = $this->getArrFieldVals($commentList, 'uid');									# 获取评论相关的用户信息
		$uids           = array_merge((array)$uids, (array)$replyUids);
		$uids           = array_unique($uids);
		$userList   	= $userModel->getUserInfoByIds($uids);
		
		return $userList;
	}
	
	# 获取被at的人的信息
	private function getReplyToUserInfo($userList, $replyToUid) {
		$userInfo        		= array();
		$replyToName 	 		= '';
		if (isset($userList[$replyToUid])) {															# 这里可以加入用户其他信息
			$replyToName 		= $userList[$replyToUid]['nick_name'];
			$userInfo['uid'] 	= $replyToUid;															
			$userInfo['name'] 	= $replyToName;
		}
		
		return $userInfo;
	}
	
	# 获取帖子评论的个数
	public function getCntByPostId($postId) {
		$map 			= array();
		$map['post_id'] = $postId;
		$cnt 			= $this->where($map)->count();
		
		return $cnt;
	}
	
	# 评论列表，包装评论列表
	public function wrapCommentList($myId, $commentList) {
		if ($commentList) {
			$userList   			= $this->getUserInfoForComment($commentList);						# 获取参与评论的人员的用户信息
			foreach ($commentList as &$comment) {
				$uid 				= $comment['uid'];
				$replyToUid  		= $comment['p_uid'];
				if ($replyToUid) {
					$comment['replyTo'] = $this->getReplyToUserInfo($userList, $replyToUid);
				}
				$comment['created_at']  = strtotime($comment['created_at']);							# 时间转换成秒
				$comment['is_my']		= $myId == $uid ? 1 : 0;										# 该评论是不是自己的
				$comment['user'] 		= isset($userList[$uid]) ? $userList[$uid] : array();			# 对评论用户信息的包装
			}
		}
		
		return $commentList;
	}
	
	# 消息列表，包装评论消息
	public function wrapCommentMsgList($commentList) {
		if ($commentList) {
			$userList   	= $this->getUserInfoForComment($commentList);								# 获取参与评论的人员的用户信息
			$postDestModel  = new PostDestModel();														# 获取评论相关的发帖地点
			$postIds        = $this->getArrFieldVals($commentList, 'post_id');
			$destInfo 		= $postDestModel->getDestInfoByPostIds($postIds); 							# 目的地可能是多个
			
			foreach ($commentList as &$comment) {
				$uid 			 = $comment['uid'];
				$replyToUid  	 = $comment['p_uid'];
				$postId  	 	 = $comment['post_id'];
				if ($replyToUid) {
					$comment['replyTo'] = $this->getReplyToUserInfo($userList, $replyToUid);
				}
				$comment['created_at']  = strtotime($comment['created_at']);							# 时间转换成秒
				$placeArr 		 		= $this->getArrFieldVals ( $destInfo [$postId], "place" );		# 添加评论地点
				$comment['dest'] 		= implode(',', $placeArr);
				$comment['user'] 		= isset($userList[$uid]) ? $userList[$uid] : array();			# 对评论用户信息的包装
			}
		}
		
		return $commentList;
	}
	
}