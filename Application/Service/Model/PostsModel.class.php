<?php
namespace Service\Model;

class PostsModel extends BaseModel {
	
	const NORMAL_POST 	= 0;		# 正常的帖子
	const DELETE_POST 	= 1;		# 已经删除的帖子
	const END_POST 		= 2;		# 标记帖子已经过期
	const ONWAY_POST 	= 3;		# 标记帖子在途中
	
	public function addPost($uid, $fields) {
		
		$data 						= array();
		$data['uid'] 				= $uid;
		$data['start_at'] 			= $fields['start_at'];
		$dayTmp 					= intval($fields['days']);
		$data['days'] 				= $dayTmp < 0 ? 1 : $dayTmp;						# 防止客户端传错误的参数
		$data['weixin'] 			= trim($fields['weixin']);
		$data['qq'] 				= trim($fields['qq']);
		$data['phone'] 				= trim($fields['phone']);
		$data['content'] 			= $fields['content'];
		$data['created_at'] 		= date("Y-m-d H:i:s", time());
		$data['is_delete'] 			= self::NORMAL_POST;
		$data['post_place'] 		= isset($fields['post_place']) ? $fields['post_place'] : '';
		$data['dests']				= $fields['dest'];
		
		$insertId           		= null;
		if (!empty($data['uid']) && !empty($data['start_at']) && !empty($data['days']) && !empty($data['content'])) {
			if (!empty($data['weixin']) || !empty($data['qq']) || !empty($data['phone'])) {
				$map 				= array();											# 防止用户重复提交
				$map['uid'] 		= $uid;
				$result 			= $this->where($map)->order("id desc")->find();
				if (empty($result)) {
					$insertId 		= $this->add($data);
				} else {
					$created    	= strtotime($result['created_at']);
					if (time() - $created > 5) {
						$insertId 	= $this->add($data);
					}
				}
			}
		}
		
		return $insertId;
		
	}
	
	# 删除帖子
	public function delPostById($uid, $postId) {
		$status 				= true;
		
		if ($postId && $this->isSelf($uid, $postId)) {
			$data               = array();
			$data['id'] 		= $postId;
			$data['is_delete'] 	= self::DELETE_POST;
			$res 				= $this->save($data);
			$postImgModel 		= new PostImgModel();						# 删掉post_img
			$postImgModel->delPostImg($uid, $postId);
			$postDestModel 		= new PostDestModel();						# 删掉post_dest
			$postDestModel->delPostDest($uid, $postId);
			$likedModel 		= new LikedModel();							# 删掉liked
			$likedModel->delLikedByPostId($postId);
			$postTagModel 		= new PostTagModel();						# 删掉post_tag
			$postTagModel->delPostTag($uid, $postId);
			$commentsModel      = new CommentsModel();						# 删除comments
			$commentsModel->delCommentByPostId($postId);
			
			$status             = $res === false ? false : true;
		}
		
		return $status;
	}
	
	# 标记帖子为已截止
	public function setTimeEnd($uid, $postId) {
		$status 				= false;
		
		if ($postId && $this->isSelf($uid, $postId)) {
			$data               = array();
			$data['id'] 		= $postId;
			$data['is_delete'] 	= self::END_POST;
			$res 				= $this->save($data);
			$status             = $res === false ? false : true;
		}
		
		return $status;
	}
	
	# 判断帖子是不是自己的
	private function isSelf($uid, $postId) {
		
		$data               = array();
		$data['id'] 		= $postId;
		$userTmp 			= $this->where($data)->getField("uid");
		
		return $userTmp == $uid ? true : false;
	}
	
	
	# 根据uid获取分页帖子的ids
	public function getPostIdsPageByUid($uid, $offset = 0, $perNum = 20) {
		$postIds 				= array();
		if (!empty($uid)) {
			$map['uid'] 		= $uid;
			$map['is_delete'] 	= array('NEQ', self::DELETE_POST);						# 只要是不删除就可以找出来;
			if ($offset > 0) {
				$map['id'] = array("lt", intval($offset));								# 按照时间(id)逆序排列
			}
			$posts              = $this->where($map)->field("id")->order("id desc")->limit($perNum)->select();
			$postIds            = $this->getArrFieldVals($posts, "id");
		}
	
		return $postIds;
	}
	
	
	# 根据uid获取用户所有帖子的ids
	public function getPostIdsByUid($uid) {
		
		$postIds 				= array();
		if (!empty($uid)) {
			$map['uid'] 		= $uid;
			$map['is_delete'] 	= array('NEQ', self::DELETE_POST);						 # 只要是不删除就可以找出来;
			$posts              = $this->where($map)->field("id")->order("id desc")->select();
			$postIds            = $this->getArrFieldVals($posts, "id");
		}
		
		return $postIds;
	}
	
	# 根据postId获取帖子的信息
	public function getPostInfoById($postId, $field = NULL) {
		
		$map 				= array();
		$map['id'] 			= $postId;
		$map['is_delete'] 	= array('NEQ', self::DELETE_POST);						 	# 只要是不删除就可以找出来;
		
		if (!empty($field)) {
			$postInfo = $this->where($map)->getField($field);
		} else {
			$postInfo = $this->where($map)->find();
			if (isset($postInfo['dests'])) {
				unset($postInfo['dests']);
			}
			if (isset($postInfo['_timestamp'])) {
				unset($postInfo['_timestamp']);
			}
		}
		
		return empty($postInfo) ? array() : $postInfo;
	}
	
	# 根据post_ids获取帖子信息
	public function getPostInfoByIds($postIds) {
		
		$posts 					= array();
		$postIds   				= array_filter($postIds);
		if (!empty($postIds)) {
			$map['id'] 			= array("in", $postIds);
			$map['is_delete'] 	= array('NEQ', self::DELETE_POST);						# 只要是不删除就可以找出来
			$postInfoTmp  		= $this->where($map)->order("id desc")->select();
			if (!empty($postInfoTmp)) {
				$posts			= $this->setKeyByField($postInfoTmp, "id");
				$posts			= $this->sortByKey($postIds, $posts);				# 按照输入的post_ids的顺序输出posts
			}
		}
		
		return $posts;
	}
	
	
	# 根据postIds获取用户信息
	public function getUserInfoByPostIds(array $postIds) {
		$userInfo 		= array();
		$userIds 		= $this->getUserIdsByPostIds($postIds);
		if (!empty($userIds)) {
			$userModel 	= new UserModel();
			$userInfo  	= $userModel->getUserInfoByIds($userIds);
		}
		
		return $userInfo;
	}
	
	# 根据postIds获取用户ids
	public function getUserIdsByPostIds(array $postIds) {
		$userIds 			  = array();
		if (!empty($postIds)) {
			$map['id'] 		  = array("in", $postIds);
			$map['is_delete'] = array('NEQ', self::DELETE_POST);
			$userIdsTmp 	  = $this->distinct(true)->where($map)->field("uid")->order("uid asc")->select();
			$userIds    	  = $this->getArrFieldVals($userIdsTmp, "uid");
		}
		
		return $userIds;
	}
	
	
	# 获取发帖分页的列表详情
	public function getPostsByIds($uid, $postIds) {
		$posts 					= array();
		$lists                  = array();
		if (!empty($postIds)) {
			$postIds            = array_unique($postIds);							# 防止帖子id重复，影响下面的排序
			$postsModel 		= new PostsModel();
			$posts 				= $postsModel->getPostInfoByIds($postIds);			# 拼上目的地和图片还有用户信息
			$postImgModel 		= new PostImgModel();
			$imgs 		  		= $postImgModel->getImgByPostIds($postIds);			# 获取本页相关的图片
			$postUserInfo 		= $postsModel->getUserInfoByPostIds($postIds);		# 获取本页相关的用户信息
			$likedModel   		= new LikedModel();
			$likedNum 	  		= $likedModel->getLikedNumByPostIds($postIds);		# 获取每个帖子下点赞的个数
			$postDestModel 		= new PostDestModel();
			$placeInfo 			= $postDestModel->getDestInfoByPostIds($postIds);	# 获取发帖目的地点相关信息
			$likedPostIds   	= $likedModel->isLikedByIds($uid, $postIds);		# 获取用户对哪些id点过赞
			$viewsModel         = new ViewsModel();									# 获取帖子有多少浏览量
			$pvs                = $viewsModel->getPvByPostIds($postIds);
			$postTagModel       = new PostTagModel();								# 获取帖子的标签
			$tagInfo 			= $postTagModel->getTagInfoByPostIds($postIds);		
			
			$posts				= $this->sortByKey($postIds, $posts);				# 按照postIds输出的顺序再排序
			$lists   			= $this->wrapPosts($uid, $posts, $imgs, $placeInfo, $postUserInfo, $likedNum, $likedPostIds, $pvs, $tagInfo);
			$lists				= array_values($lists);								# 去掉数字索引
		}
		
		return $lists;
	}
	
	/**
	 * 拼装帖子相关的附加信息
	 * 
	 * @param int   $uid 			当前用户的id
	 * @param array $posts			帖子原始信息
	 * @param array $imgs			帖子相关的图片信息
	 * @param array $placeInfo		帖子相关的地点信息
	 * @param array $postUserInfo	帖子相关的用户信息
	 * @param array $likedNum		帖子相关的点赞信息
	 * @param array $likedPostIds	该用户对哪些帖子点过赞
	 * @param array $pvs			帖子对应的浏览量信息
	 * @param array $tagInfo		帖子对应的标签信息
	 * 
	 * @return array $posts
	 */
	private function wrapPosts($uid, array $posts, array $imgs, array $placeInfo, array $postUserInfo, array $likedNum, array $likedPostIds, array $pvs, array $tagInfo) {
		if (!empty($posts)) {
			foreach ($posts as $postId => &$post) {
				$post['thumb'] 		= isset($imgs['thumb'][$postId]) ? $imgs['thumb'][$postId] : array();
				$post['preview'] 	= isset($imgs['preview'][$postId]) ? $imgs['preview'][$postId] : array();
				$placeArr           = isset($placeInfo[$postId]) ? $placeInfo[$postId] : array();						# 计算目的地
				$destArr 			= $this->getArrFieldVals($placeArr, "place");
				$post['dest']   	= !empty($destArr) ? implode(",", $destArr) : '';									# 多个目的地用','分隔
				$post['created_at'] = strtotime($post['created_at']);													# 格式化时间
				$post['start_at'] 	= date("Y-m-d", strtotime($post['start_at']));										# 格式化时间
				$post['end_at'] 	= date("Y-m-d", strtotime($post['start_at']." +". ($post['days'] -1) ." days")); 	# 偏移天数
				$post['user'] 		= isset($postUserInfo[$post['uid']]) ? $postUserInfo[$post['uid']] : array(); 		# 用户信息
				$post['is_my']  	= $uid == $post['uid'] ? 1 : 0;														# 是不是自己发的帖子
				$post['is_liked']   = in_array($postId, $likedPostIds) ? 1 : 0;											# 是否点过赞
				$post['like_num']   = isset($likedNum[$postId]) ? $likedNum[$postId]['num'] : 0;						# 读取该帖子有多少人点赞
				$post['pv']   		= isset($pvs[$postId]) ? $pvs[$postId]['cnt'] : 0;									# 读取该帖子有多少人浏览
				
				$tagTmpArr 			= isset($tagInfo[$postId]) ? $tagInfo[$postId] : array();
				$post['tags']   	= $this->getArrFieldVals($tagTmpArr, 'tag');										# 读取该帖子的标签数组
				
				unset($post['dests']);																					# 删除掉没用的字段
				unset($post['_timestamp']);
			}
		}
		
		return $posts;
	}
	
	# 根据postId获取帖子的所有详细信息
	public function getPostDetailById($uid, $postId) {
		$postInfo 				= array();
		$postInfo 				= $this->getPostInfoById($postId);
		if (empty($postInfo)) {
			return $postInfo;
		}
		$postImgModel   		= new PostImgModel();
		$imgs           		= $postImgModel->getImgByPostId($postId);												# 获取相应的图片
		$postInfo['thumb'] 		= isset($imgs['thumb']) ? $imgs['thumb'] : array();
		$postInfo['preview'] 	= isset($imgs['preview']) ? $imgs['preview'] : array();
		
		$postDestModel          = new PostDestModel();																	# 获取目的地
		$destArr                = $postDestModel->getDestByPostId($postId);
		$postInfo['dest']   	= !empty($destArr) ? implode(",", $destArr) : '';										# 多个目的地用','分隔
		
		$postInfo['created_at'] = strtotime($postInfo['created_at']);													# 格式化时间
		$postInfo['start_at'] 	= date("Y-m-d", strtotime($postInfo['start_at']));										# 格式化时间
		$postInfo['end_at'] 	= date("Y-m-d", strtotime($postInfo['start_at']." +". ($postInfo['days'] -1) ." days"));# 偏移天数
		
		$userModel              = new UserModel();
		$postInfo['user'] 		= $userModel->getUserInfoById($postInfo['uid']); 										# 用户信息
		$postInfo['is_my']  	= $uid == $postInfo['uid'] ? 1 : 0;														# 是不是自己发的帖子
		
		$likedModel             = new LikedModel();
		$likedRes               = $likedModel->isLikedByIds($uid, array($postId));
		$postInfo['is_liked']   = empty($likedRes) ? 0 : 1;																# 是否点过赞
		$postInfo['like_num']   = $likedModel->getLikedNum($postId);													# 读取该帖子有多少人点赞
		
		$viewsModel 			= new ViewsModel();
		$postInfo['pv']   		= $viewsModel->getPvByPostId($postId);													# 读取该帖子有多少人浏览
		
		$postTagModel           = new PostTagModel();
		$tagTmpArr              = $postTagModel->getTagInfoByPostId($postId);
		$postInfo['tags']   	= $this->getArrFieldVals($tagTmpArr, 'tag');											# 读取该帖子的标签数组
		
		$viewsModel = new ViewsModel();																					# 浏览量自增
		$viewsModel->incCount($postId, $uid);
		
		return $postInfo;
	}
	
	
}