<?php
namespace Sapi\Controller;
use Think\Controller;

import("Sapi.Protobuf.ProtoMessage");

class CommonPbController extends Controller {
	
	public function setUserInfo($userInfo) {
		$userObj = new \UserInfo();
		if (!empty($userInfo)) {
			$userObj->setId($userInfo['id']);																# require
			$userObj->setAge($userInfo['age']);
			$userObj->setHeadImgUrl($userInfo['head_img']);
			$userObj->setHeadImgUrlOrigin($userInfo['head_origin']);
			$userObj->setNickName($userInfo['nick_name']);
			$userObj->setPhone($userInfo['phone']);
			$userObj->setQq($userInfo['qq']);
			$userObj->setSex($userInfo['sex']);
			$userObj->setWeixin($userInfo['weixin']);
			$userObj->setGroupVisible($userInfo['group_visible']);
			$userObj->setVisibleItem($userInfo['visible_item']);
			isset($userInfo['is_complete']) && $userObj->setIsComplete($userInfo['is_complete']);			# optional
			isset($userInfo['integrity']) && $userObj->setIntegrity($userInfo['integrity']);
			isset($userInfo['sign']) && $userObj->setSelfSign($userInfo['sign']);
			isset($userInfo['dest_wanted']) && $userObj->setWannaGoDest($userInfo['dest_wanted']);
			isset($userInfo['dest_gone']) && $userObj->setHaveBeenDest($userInfo['dest_gone']);
			isset($userInfo['residence']) && $userObj->setResidence($userInfo['residence']);
			if (isset($userInfo['peferList']) && !empty($userInfo['peferList'])) {
				$userObj = $this->setTravelPefer($userInfo['peferList'], $userObj);
			}
		}
		
		return $userObj;
	}
	
	private function setTravelPefer($travelPefers, \UserInfo $userObj) {
		if (!empty($travelPefers)) {
			foreach ($travelPefers as $pefer) {
				$userObj->appendTravelPefer($pefer);
			}
		}
		
		return $userObj;
	}
	
	public function setUserInfoList($userList) {
		$userInfoListObj 		= new \UserInfoList();
		if (!empty($userList)) {
			foreach ($userList as $list) {
				$userInfoObj    = $this->setUserInfo($list);
				$userInfoListObj->appendUserInfos($userInfoObj);
			}
		}
		
		return $userInfoListObj;
	}
	
	public function setHotCity($cityList, $obj) {
		if (!empty($cityList)) {
			foreach ($cityList as $v) {
				$cityList = new \HotCity();
				$cityList->setName($v['name']);
				$cityList->setUrl($v['url']);
				$cityList->setDesc($v['desc']);
				$obj->appendHotCitys($cityList);
			}
		}
		
		return $obj;
	}
	
	public function setPostResponseInfo(array $postList, \PostResponseInfoList $postResponseInfoListObj) {
		if ($postList) {
			foreach ($postList as $postInfo) {
				$postResponseInfoObj = new \PostResponseInfo();
				$postResponseInfoObj = $this->setPostInfo($postInfo, $postResponseInfoObj);
				$postResponseInfoListObj->appendPostInfos($postResponseInfoObj);
			}
		}
		
		return $postResponseInfoListObj;
	}
	
	
	public function setPostInfo(array $postInfo, \PostResponseInfo $postResponseInfoObj, $detail = array()) {
		if (!empty($postInfo)) {
			$postResponseInfoObj->setId($postInfo['id']);
			$postResponseInfoObj->setUid($postInfo['uid']);
			$postResponseInfoObj->setCreatedTime($postInfo['created_at']);
			$postResponseInfoObj->setDays($postInfo['days']);
			$postResponseInfoObj->setWeixin($postInfo['weixin']);
			$postResponseInfoObj->setQq($postInfo['qq']);
			$postResponseInfoObj->setPhone($postInfo['phone']);
			$postResponseInfoObj->setContent($postInfo['content']);
			$postResponseInfoObj->setPostPlace($postInfo['post_place']);
			$postResponseInfoObj->setStartTime($postInfo['start_at']);
			$postResponseInfoObj->setFinishTime($postInfo['end_at']);
			$postResponseInfoObj->setDest($postInfo['dest']);
			$postResponseInfoObj->setIsMy($postInfo['is_my']);
			$postResponseInfoObj->setIsLiked($postInfo['is_liked']);
			$postResponseInfoObj->setLikeNum(intval($postInfo['like_num']));
			$postResponseInfoObj->setPv($postInfo['pv']);
			$postResponseInfoObj->setStatus($postInfo['is_delete']);
			
			$postResponseInfoObj = $this->setTags($postInfo['tags'], $postResponseInfoObj);							# 帖子标签
			$userInfoObj 	  = $this->setUserInfo($postInfo['user']);
			$postResponseInfoObj = $postResponseInfoObj->setUserInfo($userInfoObj);									# 插入帖子所属用户信息
			$postResponseInfoObj = $this->setImg($postInfo['thumb'], $postInfo['preview'], $postResponseInfoObj);		# 插入图片相关信息
			
			if (!empty($detail)) {																				# 帖子详情
				$postDetailObj = $this->setPostDetailInfo($detail);
				$postResponseInfoObj->setPostDetailInfo($postDetailObj);
			}
		}
	
		return $postResponseInfoObj;
	}
	
	private function setImg($thumb, $preview, \PostResponseInfo $postResponseInfo) {
		if (!empty($thumb)) {
			foreach ($thumb as $k => $img) {
				$postImg = new \PostImg();
				$postImg->setThumb($img);
				$postImg->setPreview($preview[$k]);
				$postResponseInfo->appendImgs($postImg);
			}
		}
		return $postResponseInfo;
	}
	
	private function setTags(array $tags, \PostResponseInfo $postResponseInfo) {
		if (!empty($tags)) {
			foreach ($tags as $tag) {
				$postResponseInfo->appendPostTag($tag);
			}
		}
	
		return $postResponseInfo;
	}
	
	# 包装部分详细信息
	private function setPostDetailInfo(array $detail) {
		$postDetailObj 			= new \PostDetailInfo();
		if (isset($detail['likedInfo'])) {
			$likedInfo      	= $detail['likedInfo']; # 点赞信息
			$postDetailObj      = $this->setLikedInfo($likedInfo, $postDetailObj);
		}
		if (isset($detail['shareInfo'])) {
			$shareInfo      	= $detail['shareInfo'];	# 分享信息
			$shareInfoObj       = $this->setShareInfo($shareInfo);
			$postDetailObj->setShareInfo($shareInfoObj);
		}
		
		return $postDetailObj;
	}
	
	# 包装用户的分享信息
	private function setShareInfo(array $shareInfo) {
		$shareInfoObj = new \ShareInfo();
		$shareInfoObj->setShareLink($shareInfo['link']);
		$shareInfoObj->setShareIco($shareInfo['img_url']);
		$shareInfoObj->setShareTitle($shareInfo['title']);
		$shareInfoObj->setShareDesc($shareInfo['desc']);
		
		return $shareInfoObj;
	}
	
	# 包装用户的点赞信息
	private function setLikedInfo(array $likedInfo, \PostDetailInfo $postDetailObj) {
		if (!empty($likedInfo)) {
			foreach ($likedInfo as $item) {
				$likedMessageObj = new \LikedMessage();
				$likedMessageObj->setId($item['id']);
				$likedMessageObj->setDest($item['dest']);
				$likedMessageObj->setIsRead($item['is_read']);
				$likedMessageObj->setCreatedAt($item['created_at']);
				$likedMessageObj->setPostId($item['post_id']);
				$userInfoObj 	 = $this->setUserInfo($item['user']);
				$likedMessageObj->setUserInfo($userInfoObj);
				$postDetailObj->appendLikedMessage($likedMessageObj);
			}
		}
		
		return $postDetailObj;
	}

    public function setLikedMessageList(array $likedUserInfoList) {
        $likedMessageListObj  	 = new \LikedMessageList();
        if (! empty ( $likedUserInfoList )) {
            foreach ( $likedUserInfoList as $list ) {
                $likedMessageObj = $this->setLikedMessage($list);
                $likedMessageListObj->appendLikedMessage ( $likedMessageObj );
            }
        }

        return $likedMessageListObj;
    }
    
    public function setCommonMessage(array $commonMsgList, \CommonMessageList $msgListObj) {
    	if ($commonMsgList) {
    		foreach ($commonMsgList as $msg) {
    			$commonMsgObj 	= new \CommonMessage();
    			$commonMsgObj->setCommonId($msg['id']);
    			$type 			= $msg['type'];
    			if ($type == 1) {
    				$commonMsgObj->setLikedMessage($this->setLikedMessage($msg));
    			} elseif ($type == 2) {
    				$commonMsgObj->setCommentMessage($this->setCommentMessage($msg));
    			}
    			$commonMsgObj->setType($type);
    			$msgListObj->appendCommonMessage($commonMsgObj);
    		}
    	}
    	
    	return $msgListObj;
    }
    
    public function setCommentMessage($msg) {
    	$commentMessageObj = new \CommentMessage();
    	$commentMessageObj->setId($msg['id']);
    	$commentMessageObj->setUserInfo($this->setUserInfo($msg['user']));
    	$commentMessageObj->setDest($msg['dest']);
    	$commentMessageObj->setIsRead($msg['is_read']);
    	$commentMessageObj->setCreatedAt($msg['created_at']);
    	$commentMessageObj->setPostId($msg['post_id']);
    	$commentMessageObj->setContent($msg['content']);
    
    	return $commentMessageObj;
    }
    
    public function setLikedMessage(array $msg) {
    	$likedMessageObj = new \LikedMessage ();
    	$likedMessageObj->setId ( $msg['id'] );
    	$likedMessageObj->setPostId( $msg['post_id'] );
    	$likedMessageObj->setUserInfo ( $this->setUserInfo($msg['user']) );
    	$likedMessageObj->setDest ( $msg['dest'] );
    	$likedMessageObj->setIsRead ( $msg['is_read'] );
    	$likedMessageObj->setCreatedAt ( $msg['created_at'] );
    
    	return $likedMessageObj;
    }
    
    public function setCommentRespInfo($commentList, \PostComments $postCommentsObj) {
    	if ($commentList) {
    		foreach ($commentList as $list) {
    			$commentRespInfoObj = new \CommentRespInfo();
    			$commentRespInfoObj->setId($list['id']);
    			$commentRespInfoObj->setContent($list['content']);
    			$commentRespInfoObj->setCommentTime($list['created_at']);
    			$commentRespInfoObj->setIsMy($list['is_my']);
    			$commentRespInfoObj->setUserInfo($this->setUserInfo($list['user']));
    			if (isset($list['replyTo']) && !empty($list['replyTo'])) {
    				$replyTo 		= $list['replyTo'];
    				$commentRespInfoObj->setAtNickName($replyTo['name']);
    				$commentRespInfoObj->setAtUid($replyTo['uid']);
    			}
    			$postCommentsObj->appendCommentInfo($commentRespInfoObj);
    		}
    	}
    
    	return $postCommentsObj;
    }
}