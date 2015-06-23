<?php
namespace Service\Model;

class PostImgModel extends BaseModel {
	
	
	# 添加图片
	public function addImg($uid, $postId, $imgs) {
		
		$insertIds 		= array();
		
		if (!empty($imgs)) {
			foreach ($imgs as $img) {
				$data 					= array();
				$data['uid']			= $uid;
				$data['post_id']		= $postId;
				# 过滤重复
				$data['img']			= $img;
				$insertId 				= $this->where($data)->getField("id");
				if (empty($insertId)) {
					$data['created_at']	= date("Y-m-d H:i:s", time());
					$insertId 			= $this->add($data);
				}
				$insertIds[]            = $insertId;
			}
			$insertIds	= array_filter($insertIds);
			$insertIds  = empty($insertIds) ? array() : $insertIds;
			
		}
		
		return $insertIds;
		
	}
	
	# 根据发帖id获取图片
	public function getImgByPostId($postId) {
		$imgs 				= array();
		if (!empty($postId)) {
			$map            = array();
			$map['post_id'] = intval($postId);
			$res 			= $this->where($map)->field("img")->select();
			if (!empty($res)) {
				$imgsTmp    							= $this->getArrFieldVals($res, "img");
				list($wrapUrlsThumb, $wrapUrlsPreview) 	= $this->getImgUrls($imgsTmp);
				foreach ($res as $v) {
					$img 			= $v['img'];
					if (isset($wrapUrlsThumb[$img])) {
						$imgs['thumb'][] 	= $wrapUrlsThumb[$img];
						$imgs['preview'][] 	= $wrapUrlsPreview[$img];
					}
				}
			}
		}
		
		return $imgs;
	}
	
	# 找到图片的id和缩略图的对应关系
	private function getImgUrls(array $imgs) {
		$thumb      		= C("TAG_NAME_THUMB");
		$preview      		= C("TAG_NAME_PREVIEW");
		
		$wrapUrlsThumb   	= $this->wrapImgUrls($imgs, $thumb);
		$wrapUrlsPreview   	= $this->wrapImgUrls($imgs, $preview);
		
		return array((array)$wrapUrlsThumb, (array)$wrapUrlsPreview);
	}
	
	# 根据发帖ids获取图片
	public function getImgByPostIds($postIds) {
		$imgs 				= array();
		if (!empty($postIds)) {
			$postIds        = array_map("intval", $postIds);
			$map['post_id'] = array("in", $postIds);
			$res 			= $this->where($map)->field("post_id, img")->select();
			
			if (!empty($res)) {
				# 按照图片名称索引,使用php的hash比较快
				$imgsTmp    							= $this->getArrFieldVals($res, "img");
				list($wrapUrlsThumb, $wrapUrlsPreview) 	= $this->getImgUrls($imgsTmp);
				foreach ($res as $v) {
					$img 			= $v['img'];
					if (isset($wrapUrlsThumb[$img])) {
						$imgs['thumb'][$v['post_id']][] 	= $wrapUrlsThumb[$img];
						$imgs['preview'][$v['post_id']][] 	= $wrapUrlsPreview[$img];
					}
				}
				
			}

		}
		
		return $imgs;
		
	}
	
	# 删除图片
	public function delPostImg($uid, $postId) {
		$map 			= array();
		$map['uid'] 	= $uid;
		$map['post_id'] = $postId;
		$status         = $this->where($map)->delete();
	
		return $status === false ? false : true;
	}
	
	# 批量拼装地址
	public function wrapImgUrls(array $imgs, $tagName = '', $suffix = ".jpg") {
		$tagName 	= empty($tagName) ? C("TAG_NAME_THUMB") : $tagName;
		
		$urls    	= array();
		
		$baseImgUrl = C("READ_IMG_URL");
		
		if (!empty($imgs)) {
			foreach ($imgs as $img) {
				$urls[$img] = $baseImgUrl."/".$tagName."/".$img."$suffix";
			}
		}
		
		return $urls;
	}
	
	# 拼装单个图片地址
	protected function wrapImgUrl($img, $tagName = '', $suffix = ".jpg") {
		$tagName 	= empty($tagName) ? C("TAG_NAME_THUMB") : $tagName;
		
		$url 		= C("READ_IMG_URL")."/".$tagName."/".$img."$suffix";
		
		return $url;
	}
	
}