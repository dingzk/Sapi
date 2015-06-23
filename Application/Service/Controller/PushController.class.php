<?php
namespace Service\Controller;

import("Sapi.Protobuf.ProtoHandler");	# 导入proto类
import("Service.Push.IGt");				# 导入push类库
use Push\IGT\IGeTui;
use Think\Log;

/**
 * 提供push相关逻辑
 * @author zhenkai.ding
 */

class PushController extends CommonController {
	
	const APPKEY 		= 'w6vxbhpIDG9emzV5ytutA9';
	const APPID 		= '26h8y3XpK59AJZwNgqKrp5';
	const MASTERSECRET 	= 'DcwUyU3HAa51vOSqgXLes7';
	const HOST 			= 'http://sdk.open.api.igexin.com/apiex.htm';
	
	public function _initialize() {
		# 不需要初始化父类
	}
	
	public function push($postId, $type = 1) {
		$title     			= '艺龙驴友';
		$postsController 	= new PostsController();
		$uid            	= $postsController->getUserIdByPostId($postId);
		if (!$uid) {
			Log::write('[push]: find uid error, postId: '.$postId);
			return ;
		}
		$pushMapController 	= new PushMapController();
		$clientIds         	= $pushMapController->getClientId($uid);
		if (empty($clientIds)) {
			Log::write('[push]: find cliendIds empty, postId: '.$postId.' uid: '. $uid);
			return ;
		}
		$likedController 	= new LikedController();
		$pushLikedNum    	= $likedController->getNewsNum($uid);
		foreach ($clientIds as $clientId) {
			if ($pushLikedNum) {
				$content        = $pushLikedNum.'位驴友求同行，约吗？';
				$protoObj 		= $this->wrapPushData($title, $content, $type);
				Log::write("[push]: clientId : ".$clientId." liked num: ".$pushLikedNum);
				$this->send($clientId, $protoObj);
			}
		}
	}
	
	private function wrapPushData($title, $content, $type) {
		$pushObj 	= new \PushMessage();
		$pushObj->setType($type);
		$pushObj->setTitle($title);
		$pushObj->setContent($content);
		$protoStr 	= $pushObj->serializeToString();
		
		return $protoStr;
	}
	
	private function send($clientId, $protoObj) {
		$igt 		= new IGeTui (self::HOST, self::APPKEY, self::MASTERSECRET);
		$template 	= $this->IGtTransmissionTpl($protoObj);
		$message 	= new \IGtSingleMessage();							# 个推信息体
		$message->set_isOffline(true); 									# 是否离线
		$message->set_offlineExpireTime(3600 * 12 * 1000); 				# 离线时间
		$message->set_data($template); 									# 设置透传模板
		$message->set_PushNetWorkType(0); 								# 设置是否根据WIFI推送消息，1为wifi推送，0为不限制推送
		
		$target 	= new \IGtTarget();									# 接收方
		$target->set_appId(self::APPID);
		$target->set_clientId($clientId);
		$res 		= $igt->pushMessageToSingle($message, $target);
		return ;
	}
	
	private function IGtTransmissionTpl($protoObj) {
		$template = new \IGtTransmissionTemplate();
		$template->set_appId(self::APPID);
		$template->set_appkey(self::APPKEY);
		$template->set_transmissionType(2);								# 透传消息类型
		$template->set_transmissionContent($protoObj);					# 透传内容
		return $template;
	}
	
}