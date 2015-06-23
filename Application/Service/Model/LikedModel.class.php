<?php
namespace Service\Model;

class LikedModel extends BaseModel {
	
	const IS_READ = 1;				# 评论消息未读
	const NO_READ = 0;				# 评论消息被读
	
	private $msg_type;				# 消息类别
	
	public function _initialize() {
		parent::_initialize();
		$this->msg_type = C('LIKED_MSG');
	}
	
	# 点赞,并返回点赞的个数
	public function like($uid, $postId, $state) {
		$likedNum 				= 0;
		if (!empty($uid) && !empty($postId)) {
			$postsModel 		= new PostsModel();									# 判断帖子是不是自己发的
			$postUid            = $postsModel->getPostInfoById($postId);
			$ownerId 			= $postUid['uid'];									# 发帖的用户
			if (!empty($postUid) && $uid != $ownerId) {								# 说明是自己发的帖子,不能点赞,或者帖子已经被删除
				$map 				= array();										# 判断有没有点过赞
				$map['uid'] 		= $uid;
				$map['post_id'] 	= $postId;
				$likedId			= $this->where($map)->getField('id');
				$msgModel           = new MessageModel();
				if ($state) {
					if (empty($likedId)) {
						$data               = array();
						$data['uid'] 		= $uid;
						$data['post_id'] 	= $postId;
						$data['created_at'] = date("Y-m-d H:i:s", time());
						$insertId 			= $this->add($data);					# 点赞
						$msgModel->addMessage($ownerId, $insertId, $this->msg_type);	# 增加消息
					}
				} else {
					$this->delete($likedId);										# 取消赞
					$msgModel->delMessageById($likedId, $this->msg_type);			# 删除消息
				}
			}
			
			$likedNum 		= $this->getLikedNum($postId);
		}
		
		return $likedNum;
		
	}
	
	# 获取post_ids下分别有多少人点赞
	public function getLikedNumByPostIds(array $postIds) {
		$nums 					= array();
		if (!empty($postIds)) {
			$map['post_id'] 	= array("in", $postIds);
			$numTmp 			= $this->where($map)->field("count(distinct uid) as num, post_id")->group("post_id")->select();
			$nums               = $this->setKeyByField($numTmp, "post_id");
		}
		
		return $nums;
	}
	
	# 获取post_id下点赞的用户的信息(大家都可以看到)
	public function getLikedUserByPostId($postId, $offset, $perNum = 20) {
		$userInfo 			= array();
		if (!empty($postId)) {
			$likeInfo     	= $this->getLikedInfoByPostIds(array($postId), $offset, $perNum);
			$userIds        = array();															# 赞id和用户id的对应关系
			foreach ($likeInfo as $v) {
				$likedId 				= $v['id'];
				$uid 					= $v['uid'];
				$userIds[$likedId]   	= $uid;
			}
			if (!empty($userIds)) {
				$userModel 				= new UserModel();
				$userInfoTmp  			= $userModel->getUserInfoByIds($userIds);
				# 对点赞的先后顺序排序
				foreach ($userIds as $likedId => $uid) {
					$user       		= $userInfoTmp[$uid];
					$user['liked_id'] 	= $likedId;
					$userInfo[] 		= $user;
				}
			}
		}
		
		return $userInfo;
	}
	
	
	# 获取post_id下点赞的用户的信息以及赞信息
	public function getLikedUserInfoByPostId($postId, $offset, $perNum = 20) {
		$likedUserInfo 			= array();
		if (!empty($postId)) {
			$likeInfo     		= $this->getLikedInfoByPostIds(array($postId), $offset, $perNum);
			if (!empty($likeInfo)) {
				$likedUserInfo  = $this->wrapNewsList($likeInfo, false);
			}
		}
		
		return $likedUserInfo;
	}
	
	# 获取post_id下点赞的个数
	public function getLikedNum($postId) {
		$num 				= 0;
		
		if (!empty($postId)) {
			$map['post_id'] = $postId;
			$num 			= $this->where($map)->count();
		}
		
		return $num;
	}
	
	# 根据用户id获取对postIds中的哪些id点过赞
	public function isLikedByIds($uid, $postIds) {
		
		$likedPostIds       = array();
		
		if (!empty($postIds) && !empty($uid)) {
			$map 				= array();
			$map['uid']     	= $uid;
			$map['post_id']     = array('in', $postIds);
			$result 			= $this->where($map)->select();
			
			$likedPostIds       = $this->getArrFieldVals($result, "post_id");
		}
		
		return !empty($likedPostIds) ? $likedPostIds : array();
	}
	
	# 根据用户id获取用户新消息的个数
	public function getNewLikedByUid($uid) {
		$likedNum 				= 0;
		if ($uid) {
			# 根据用户id获取用户发表了哪些帖子的ids
			$postsModel         = new PostsModel();
			$postIds 			= $postsModel->getPostIdsByUid($uid);
			if (!empty($postIds)) {
				$map['post_id'] = array("in", $postIds);
				$map['is_read'] = self::NO_READ;
				$likedNum 		= $this->where($map)->count();
			}

		}
	
		return $likedNum;
	}
	
	# 根据用户id获取用户给那些人点过赞
	public function getLikedListByUid($uid, $offset = 0, $perNum = 20) {
		$likes                  = array();
		if (!empty($uid)) {
			$map                = array();
			$map['uid'] 		= $uid;
			if ($offset > 0) {
				$map['id'] 		= array("lt", intval($offset));
			}
			$likes 				= $this->where($map)->group("uid, post_id")->order("id desc")->limit($perNum)->select();	# 为点赞的用户去重,这个sql使用到临时表,不过这里有分页,可以考虑优化.
		}
		return (array)$likes;
	}
	
	# 根据post_id获取点赞id
	public function getLikedIdByPostId($postId) {
		$likedIds 		= array();
		$map 			= array();
		$map['post_id'] = intval($postId);
		$ids 			= $this->where($map)->field('id')->select();
		$likedIds     	= $this->getArrFieldVals($ids, 'id');
		
		return $likedIds;
	}
	
	# 根据帖子id获取点赞的详细信息
	public function getLikedDetailByPostId($postId) {
		$likes 				= $this->getLikedInfoByPostId($postId);						# 暂时没有用到分页
		$detailList 		= $this->wrapNewsList($likes, FALSE);
		
		return $detailList;
	}
	
	# 获取帖子的指定赞信息(id,uid,post_id)(用户个人中心中可以看到)
	public function getLikedInfoByPostIds(array $postIds, $offset = 0, $perNum = 20) {
		$likes                  = array();
		if (!empty($postIds)) {
			$map                = array();
			$map['post_id'] 	= array("in", $postIds);
			if ($offset > 0) {
				$map['id'] 		= array("lt", intval($offset));
			}
			$likes 				= $this->where($map)->group("uid, post_id")->order("id desc")->limit($perNum)->select();	# 为点赞的用户去重,这个sql使用到临时表,不过这里有分页,可以考虑优化.
		}
		
		return (array)$likes;
	}
	
	# 获取指定帖子的所有赞信息
	private function getLikedInfoByPostId($postId) {
		$likes                  = array();
		if (!empty($postId)) {
			$map                = array();
			$map['post_id'] 	= $postId;
			$likes 				= $this->where($map)->group("uid, post_id")->order("id desc")->select();	# 获取指定postId下的所有的赞信息
		}
		return (array)$likes;
	}
	
	# 包装点赞的信息
	public function wrapNewsList(array $likes, $status = TRUE) {
		$newsList               = array();
		if (!empty($likes)) {
			$likeIds        	= array();
			$uids           	= array();
			$postIds    		= array(); 											# 本页相关的目的地
			foreach ($likes as $value) {
				$uids[]     	= $value['uid'];
				$likeIds[] 		= $value['id'];
				$postIds[] 		= $value['post_id'];
			}
			$userModel      	= new UserModel();									# 获取用户信息
			$userInfo 			= $userModel->getUserInfoByIds($uids);
			$postDestModel  	= new PostDestModel();								# 获取发帖地点
			$destInfo 			= $postDestModel->getDestInfoByPostIds($postIds); 	# 目的地可能是多个
			foreach ( $likes as $val ) {											# 进行数据组装
				$id 			= $val ['id'];
				$uid 			= $val ['uid'];
				$postId 		= $val ['post_id'];
				if (isset($destInfo [$postId])) {
					$placeArr 		= $this->getArrFieldVals ( $destInfo [$postId], "place" );
					$newsList [] 	= array (
							'id' => $id,
							"uid" => $uid,
							'post_id' => $postId,
							'name' => $userInfo [$uid] ['nick_name'],
							'user' => $userInfo [$uid],								# 用户的个人信息
							'dest' => implode ( ",", $placeArr ),
							'is_read' => $val ['is_read'],
							'created_at' => strtotime($val ['created_at'])
					);
				}
			}
			
			if ($status) {
				$this->setReadByIds($likeIds);										# 标记为已读
			}
			
		}
		
		return $newsList;
		
	}
	
	# 根据用户id获取用户新消息的总个数
	public function getTotalNewsNum($uid) {
		$num				= 0;
		$postsModel         = new PostsModel();
		$postIds 			= $postsModel->getPostIdsByUid($uid);	# 根据用户id获取用户发表了哪些帖子的ids
		if (!empty($postIds)) {
			$map['post_id'] = array("in", $postIds);
			$num 			= $this->where($map)->count();
		}

		return $num;
	}
	
	# 把新消息标记为已读
	public function setReadByIds($ids) {
		$status 				= false;
		if (!empty($ids)) {
			$map 				= array();
			$data 				= array();
			$data['is_read'] 	= self::IS_READ;
			$data['read_at'] 	= date("Y-m-d H:i:s", time());
			$map['id']          = array("in", $ids);
			$status             = $this->where($map)->save($data);
		}

		return $status;
	}
	
	# 根据帖子id删除该帖子相关点赞信息
	public function delLikedByPostId($postId) {
		$delMsgStat 			= false;
		$delCommentStat			= false;
		if (!empty($postId)) {
			$map 				= array();
			$map['post_id']     = $postId;
			$delMsgStat         = $this->where($map)->delete();
			$msgIds         	= $this->getLikedIdByPostId($postId);
			$messageModel   	= new MessageModel();										# 删除消息
			$delMsgStat     	= $messageModel->delMessageByIds($msgIds, $this->msg_type);
		}
		
		return $delMsgStat !== FALSE && $delCommentStat !== FALSE ? true : false;
	}
	
	# 根据ids找到对应的记录
	public function getLikedInfoByIds($ids) {
		$likes       	= array();
		if ($ids) {
			$map  		= array();
			$map['id'] 	= array('in', (array)$ids);
			$likes   	= $this->where($map)->order("id desc")->select();
		}
		
		return $likes;
	}
	
}