<?php
namespace Sapi\Controller;

use Router\Router\Router;
/**
 * 提供post相关业务逻辑
 * @author zhenkai.ding
 *
 */
class PostsController extends CommonController {
	
	public function _initialize() {
		parent::_initialize();
	}
	
	
	public function post() {
		$reqObj				= $this->reqInfo->getPostReqInfo();
		$fields             = array();
		$fields['start_at'] = $reqObj->getStartTime();
		$fields['days']     = $reqObj->getDuration();
		$fields['weixin']   = $reqObj->getWeixin();
		$fields['qq']       = $reqObj->getQq();
		$fields['phone']    = $reqObj->getPhone();
		$fields['content']  = $reqObj->getContent();
		$tags               = $reqObj->getPostTagIterator()->getArrayCopy();
		$fields['tags']     = implode(',', $tags);
		$imgStreams         = $reqObj->getImgsIterator()->getArrayCopy();
		$imgs               = Router::exec("Images", "stream2Img", array($imgStreams));	# 图片相关
		$fields['imgs']     = $imgs;
		
		list($flag, $dests) = $this->getDestArr($reqObj);
// 		$fields['post_place'] = $place;
		$fields['dest'] 	= implode(",", $dests);	# 目的地靠逗号分隔
		$postId 			= Router::run($fields, $flag);
		
		$this->err_code 	=  $postId ? self::SUCCESS_CODE : self::ERR_CODE;
		
		$this->echoRes();
		
	}
	
	private function getDestArr($reqObj) {
		$destInfoArrObj = $reqObj->getDestInfoIterator()->getArrayCopy();
		
		$destArr     = array();
		$flag 		 = TRUE;
		$destInfoArr = $this->parseIterator($destInfoArrObj);
		$map 		 = array('dest' => 1, 'dest_id' => 2); # 索引映射
		if (!empty($destInfoArr)) {
			if (isset($destInfoArr[0][$map['dest_id']]) && !empty($destInfoArr[0][$map['dest_id']])) {
				$destArr = $this->getArrFieldVals($destInfoArr, $map['dest_id']);
			} else {
				$destArr = $this->getArrFieldVals($destInfoArr, $map['dest']);
				$flag    = FALSE;
			}
		}
		
		return array($flag, $destArr);

	}
	
	# 获取repeat类型的protobuf对象内容
	private function parseIterator($destInfoArr) {
		$destArr 	= array();
		if (!empty($destInfoArr)) {
			foreach($destInfoArr as $key => $val) {
				foreach($val as $v) {
					$destArr[] = $v;
				}
			}
		}
		return $destArr;
	}
	
	
	# 我的发帖
	public function myPosts() {
		$userPostObj 				= $this->reqInfo->getPostByUserInfo();
		list($offset, $perNum)  	= $this->getPageInfo($userPostObj);
		$uid                        = $userPostObj->getUid();
		$posts	 					= Router::run($offset, $perNum, $uid);
		
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
	
	public function postDetail() {
		$postId 			= $this->reqInfo->getPostId();
		$detail	 			= Router::run($postId);
		
		$postInfo       	= $detail['postInfo'];  											# 帖子基本信息
		
		$postResObj 		= new \PostResponseInfo();
		$commonPbController = new CommonPbController();
		$postResObj 		= $commonPbController->setPostInfo($postInfo, $postResObj, $detail);
		
		$this->resInfo->setPostInfo($postResObj);
		
		$this->echoRes();
	}
	
	# 删除帖子
	public function delPostById() {
		$postId 		= $this->reqInfo->getPostId();
		$res	 		= Router::run($postId);
		$this->err_code =  $res ? self::SUCCESS_CODE : self::ERR_CODE;
		
		$this->echoRes();
	}
	
	# 关闭帖子
	public function closePostById() {
		$postId 		= $this->reqInfo->getPostId();
		$res	 		= Router::run($postId);
		$this->err_code =  $res ? self::SUCCESS_CODE : self::ERR_CODE;
	
		$this->echoRes();
	}
	
	# 根据经纬度获取地理位置
	# 维度，经度
	private function getLocation($lat, $lng) {
		$baseUrl 			= C("BAIDU_PLACE_API");

		$postUrl 			= sprintf($baseUrl, $lat.",".$lng);
		$placeJson 			= xcurl($postUrl);
		$place      		= '';
		if (!empty($placeJson)) {
			$placeInfo  	= json_decode($placeJson, true);
			if ($placeInfo['status'] == 0) {
				$result     = $placeInfo['result'];
				$place 		= isset($result['formatted_address']) ? $result['formatted_address'] : "";
			}
		}

		return $place;
	}
	
	
}