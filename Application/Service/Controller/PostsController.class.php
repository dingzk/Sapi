<?php
namespace Service\Controller;

use Service\Model\PostsModel;
use Service\Model\PostImgModel;
use Service\Model\PostDestModel;
use Service\Model\DestModel;
use Service\Model\TagsModel;
use Service\Model\PostTagModel;
use Service\Model\LikedModel;

/**
 * 提供post相关业务逻辑
 * @author zhenkai.ding
 *
 */
class PostsController extends CommonController {
	
	public function _initialize() {
		parent::_initialize();
	}
	
	/**
	 * 发帖
	 * @param array $fields
	 * @param string $flag 使用地点名称或者id
	 * @return boolean
	 */
	public function post($fields, $flag = FALSE) {
		
		$uid 				= $this->uid;
		
		$status     		= true;														# 提交成功与否的标志
		$postsModel 		= new PostsModel();
		$postId 			= $postsModel->addPost($uid, $fields);						# 添加目的地,可以添加多个,如果地点找不到,也要在标识在posts表中,用于运营
		$destStr			= $fields['dest'];
		if ($postId && !empty($destStr)) {
			$destTmp        = $this->splitStr($destStr);								# 添加地点
			if ($flag) {
				$destIds    = $destTmp;													# 按照地点id发帖
			} else {
				$destModel  = new DestModel();											# 按照地点名称发帖
				$destIds    = $destModel->getIdsByDests($destTmp);						# 找不到目的地的情况,因为在posts表中有记录,这里等后期产品处理
			}
			if (!empty($destIds)) {
				$postDestModel 	= new PostDestModel();
				$postDestIds 	= $postDestModel->addDests($uid, $postId, $destIds);
				if (empty($postDestIds)) {												# 只要添加上即可算成功
					$status 	= false;
				}
			}
			if (isset($fields['tags']) && !empty($fields['tags'])) {					# 添加标签
				$tagModel   = new TagsModel();
				$tags 		= $this->splitStr($fields['tags']);
				$tagIds     = $tagModel->getIdsByTagNames($tags);
				if (!empty($tagIds)) {
					$postTagModel 	= new PostTagModel();
					$postTagIds 	= $postTagModel->addPostTag($uid, $postId, $tagIds);
					if (empty($postTagIds)) {
						$status = false;
					}
				}
			}
			if (isset($fields['imgs']) && !empty($fields['imgs'])) {					# 添加图片
				$imgModel 	= new PostImgModel();
				$imgs 		= $fields['imgs'];
				$imgIds 	= $imgModel->addImg($uid, $postId, $imgs);
				if (empty($imgIds)) {
					$status = false;
				}
			}
			
		}
		
		return $status && $postId ? $postId : false;
		
	}
	
	/**
	 * 根据地点名称获取地点的id
	 * @param string $destStr
	 * @return array
	 */
	private function getDestIdByNameStr($destStr) {
		$destIds                    = array();
		if (!empty($destStr)) {
			$dests          		= explode(",", $destStr);
			if (count($dests) > 0) {
				$destModel 			= new DestModel();
				$destIds            = $destModel->getIdsByDests($dests);
			}
		}
		
		return $destIds;
		
	}
	
	/**
	 * 按照规则分隔字符串
	 * @param string $str
	 * @return array
	 */
	private function splitStr($str, $split = ",") {
		$arr     = array();
		
		if (!empty($str)) {
			$arr = explode($split, $str);
			$arr = array_map("trim", $arr);
			$arr = array_filter($arr);	# 小心变成null
			$arr = empty($arr) ? array() : $arr;
		}
		
		return $arr;
		
	}
	
	# 我的所有发帖记录
	public function myPosts($offset = 0, $perNum = 20, $uid = NULL) {
		$uid 			= empty($uid) ? $this->uid : $uid;
		
		$postList 		= array();
		$postsModel 	= new PostsModel();
		$postIds    	= $postsModel->getPostIdsPageByUid($uid, $offset, $perNum + 1);			# 获取相关所有的post_id, 多获取一个用于判断后面还有没有
		if (!empty($postIds)) {
			$postsModel = new PostsModel();
			$postList	= $postsModel->getPostsByIds($uid, $postIds);							# 按照顺序输出
		}
		$pageInfo 		= $this->getPage($postList, $perNum, 'id');
		
		return $pageInfo;
	}
	
	# 获取指定帖子的详情
	public function postDetail($postId) {
		$uid 						= $this->uid;
		
		$detail         		 	= array();
		$postModel 					= new PostsModel();
		$postInfo 					= $postModel->getPostDetailById($uid, $postId);					# 帖子详情
		if (!empty($postInfo)) {
			$likedModel     		= new LikedModel();
			$likedInfo      		= $likedModel->getLikedDetailByPostId($postId);					# 点赞详情
			$shareInfo              = $this->wrapShareInfo($postInfo);								# 分享的详情
			$detail['postInfo'] 	= (array)$postInfo;
			$detail['likedInfo'] 	= (array)$likedInfo;
			$detail['shareInfo']    = $shareInfo;	
		}
		
		return $detail;
	}
	
	# 包装分享信息
	private function wrapShareInfo(array $postInfo) {
		$shareInfo 	= array();
		if (!empty($postInfo)) {
			$postId 				=  $postInfo['id'];
			$shareInfo['link'] 		= sprintf(C('SHARE_LINK'), $postId);							# 分享帖子的链接
			$shareInfo['img_url'] 	= C('SHARE_ICON');
			$shareInfo['title'] 	= '找驴友啦！';
			list(,$month,$date)     = explode('-', $postInfo['start_at']);
			$shareInfo['desc'] 		= '想和'.$postInfo['user']['nick_name'].'，在'.$month.'月'.$date.'日'.'，一起去'.$postInfo['dest'].'。自由行，不跟团，挺靠谱的，约吗？';
		}
		
		return $shareInfo;
	}
	
	# 我发帖的个数
	public function myPostsCount() {
		$uid 				= $this->uid;
		$postModel 			= new PostsModel();
		$ids                = $postModel->getPostIdsByUid($uid);
		
		return count($ids);
	}
	
	# 删除帖子
	public function delPostById($postId) {
		if ($postId) {
			$postsModel = new PostsModel();
			$res 		= $postsModel->delPostById($this->uid, $postId);
			return $res;
		}
		
		return false;
	}
	
	# 关闭帖子
	public function closePostById($postId) {
		if ($postId) {
			$postsModel = new PostsModel();
			$res 		= $postsModel->setTimeEnd($this->uid, $postId);
			return $res;
		}
		
		return false;
	}
	
	# 根据帖子id获取用户id
	public function getUserIdByPostId($postId) {
		$uid     = null;
		if ($postId) {
			$postsModel = new PostsModel();
			$uid        = $postsModel->getPostInfoById($postId, 'uid');
		}
		
		return $uid;
	}
	
	
}