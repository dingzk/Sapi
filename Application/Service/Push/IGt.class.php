<?php

namespace Push\IGT;
use Think\Exception;
use Think\Log;

require_once (dirname ( __FILE__ ) . '/' . 'protobuf/pb_message.php');
require_once (dirname ( __FILE__ ) . '/' . 'igetui/IGt.Req.php');
require_once (dirname ( __FILE__ ) . '/' . 'igetui/IGt.Message.php');
require_once (dirname ( __FILE__ ) . '/' . 'igetui/IGt.AppMessage.php');
require_once (dirname ( __FILE__ ) . '/' . 'igetui/IGt.ListMessage.php');
require_once (dirname ( __FILE__ ) . '/' . 'igetui/IGt.SingleMessage.php');
require_once (dirname ( __FILE__ ) . '/' . 'igetui/IGt.Target.php');
require_once (dirname ( __FILE__ ) . '/' . 'igetui/template/IGt.BaseTemplate.php');
require_once (dirname ( __FILE__ ) . '/' . 'igetui/template/IGt.LinkTemplate.php');
require_once (dirname ( __FILE__ ) . '/' . 'igetui/template/IGt.NotificationTemplate.php');
require_once (dirname ( __FILE__ ) . '/' . 'igetui/template/IGt.TransmissionTemplate.php');
require_once (dirname ( __FILE__ ) . '/' . 'igetui/template/IGt.NotyPopLoadTemplate.php');
require_once (dirname ( __FILE__ ) . '/' . 'igetui/template/IGt.APNTemplate.php');


class IGeTui {
	var $appkey; 					# 第三方 标识
	var $masterSecret; 				# 第三方 密钥
	var $debug 			= true;		# 调试/记录日志开关
	var $format 		= "json"; 	# 默认为 json 格式
	var $host 			= '';
	var $needDetails 	= false;
	var $serviceMap 	= array ();
	
	public function __construct($host, $appkey, $masterSecret) {
		$this->host 		= $host;
		$this->appkey 		= $appkey;
		$this->masterSecret = $masterSecret;
		$hosts 				= array ();
		if (strlen ($this->host) == 0 || $this->host == NULL) {
			$hosts = $this->getConnOSServerHostList();
		} else {
			array_push($hosts, $this->host);
		}
		$this->getfasthost_nt($hosts);
	}
	
	public function getfasthost_nt($hosts) {
		if (count ( $hosts ) == 1) {
			$this->host = $hosts [0];
		} else {
			$mint 	= 3.0;
			$s_url 	= "";
			for($i = 0; $i < count($hosts); $i++) {
				$start 	= array_sum (explode (" ", microtime ()));
				$opts 	= array (
						'http' => array (
								'method' => "GET",
								'timeout' => 3
						)
				);
				$context = stream_context_create ( $opts );
				try {
					$homepage = file_get_contents ( $hosts [$i], false, $context );
				} catch ( Exception $e ) {
					$log = "host:[" . $this->host."]";
					$this->debug($log);
				}
				$ends 	= array_sum ( explode ( " ", microtime () ) );
			
				if ($homepage == NULL || $homepage = "") {
					$diff = 3.0;
				} else {
					$diff = $ends - $start;
				}
				if ($mint > $diff) {
					$mint 	= $diff;
					$s_url 	= $hosts [$i];
				}
			}
			$this->host = $s_url;
		}
	}
	
	public function getConnOSServerHostList() {
		$la = $this->getConfigOsServerHostList ();
		if ($la != NULL && count ( $la ) != 0)
			return $la;
		if ($la == NULL || count ( $la ) == 0)
			$la = array (
					"http://sdk.open.api.gepush.com/serviceex",
					"http://sdk.open.api.getui.net/serviceex",
					"http://sdk.open.api.igexin.com/serviceex" 
			);
		return $la;
	}
	
	public function getConfigOsServerHostList() {
		$surl 		= 'http://sdk.open.apilist.igexin.com/os_list';
		$homepage 	= trim ( file_get_contents ( $surl ) );
		$csv 		= explode ( "\r\n", $homepage );
		for($i = 0; $i < count ( $csv ); $i ++) {
			if ($csv [$i] == "" || strpos ( $csv [$i], "http" ) != 0)
				unset ( $csv [$i] );
		}
		return $csv;
	}
	
	public function connect() {
		$timeStamp 				= $this->micro_time ();
		$sign 					= md5 ( $this->appkey . $timeStamp . $this->masterSecret );	# 计算sign值
		$params 				= array ();
		$params ["action"] 		= "connect";
		$params ["appkey"] 		= $this->appkey;
		$params ["timeStamp"] 	= $timeStamp;
		$params ["sign"] 		= $sign;
		$data 					= $this->createParam ( $params );
		$result 				= $this->httpPost ( $data );
		$rep 					= json_decode ( $result, true );
		if ('success' == $rep ['result']) {
			return true;
		}
		$log = "appKey Or masterSecret is Auth Failed";
		$this->debug($log);
		return false;
	}
	
	/**
	 * 指定用户推送消息
	 * 
	 * @param	IGtMessage message
	 * @param	IGtTarget target
	 * @return Array {result:successed_offline,taskId:xxx} || {result:successed_online,taskId:xxx} || {result:error}
	 * 
	 */
	public function pushMessageToSingle($message, $target) {
		$params 						= array();
		
		$params ["action"] 				= "pushMessageToSingleAction";
		$params ["clientData"] 			= base64_encode ($message->get_data ()->get_transparent ());
		$params ["transmissionContent"] = $message->get_data ()->get_transmissionContent ();
		$params ["isOffline"] 			= $message->get_isOffline ();
		$params ["offlineExpireTime"] 	= $message->get_offlineExpireTime ();
		$params ["pushNetWorkType"] 	= $message->get_pushNetWorkType ();		# 增加pushNetWorkType参数(0:不限;1:wifi;2:4G/3G/2G)
		
		$params ["appId"] 				= $target->get_appId ();
		$params ["clientId"] 			= $target->get_clientId ();
		$params ["alias"] 				= $target->get_alias ();
		$params ["type"] 				= 2;									# 默认都为消息
		$params ["pushType"] 			= $message->get_data ()->get_pushType ();
		
		return $this->httpPostJSON ( $params );
	}
	
	public function pushAPNMessageToSingle($appId, $deviceToken, $message) {
		$params 			= array ();
		
		$params ['action'] 	= 'apnPushToSingleAction';
		$params ['appId'] 	= $appId;
		$params ['appkey'] 	= $this->appkey;
		$params ['DT'] 		= $deviceToken;
		$params ['PI'] 		= base64_encode ($message->get_data()->get_pushInfo()->SerializeToString());
		
		return $this->httpPostJSON ( $params );
	}
	
	/**
	 * 获取消息ID
	 * 
	 * @param	IGtMessage message, String taskGroupName
	 * @return String contentId
	 * 
	 */
	public function getContentId($message, $taskGroupName = null) {
		$params 		= array ();
		
		if (! is_null ( $taskGroupName ) && trim ( $taskGroupName ) != "") {
			if (strlen ( $taskGroupName ) > 40) {
				$this->debug("TaskGroupName is OverLimit 40");
			}
			$params ["taskGroupName"] = $taskGroupName;
		}
		
		$params ["action"] 				= "getContentIdAction";
		$params ["appkey"] 				= $this->appkey;
		$params ["clientData"] 			= base64_encode ( $message->get_data ()->get_transparent () );
		$params ["transmissionContent"] = $message->get_data ()->get_transmissionContent ();
		$params ["isOffline"] 			= $message->get_isOffline ();
		$params ["offlineExpireTime"] 	= $message->get_offlineExpireTime ();
		$params ["pushNetWorkType"] 	= $message->get_pushNetWorkType ();		# 增加pushNetWorkType参数(0:不限;1:wifi;2:4G/3G/2G)
		
		$params ["pushType"] 			= $message->get_data ()->get_pushType ();
		$params ["type"] 				= 2;
		if ($message instanceof \IGtAppMessage) {
			$params ["speed"] 		= $message->get_speed ();					# contentType 1是appMessage，2是listMessage
		}
		if ($message instanceof \IGtListMessage) {
			$params ["contentType"] = 1;
		} else {
			$params ["contentType"] 	= 2;
			$params ["appIdList"] 		= $message->get_appIdList();
			$params ["phoneTypeList"] 	= $message->get_phoneTypeList();
			$params ["provinceList"] 	= $message->get_provinceList();
			$params ["tagList"] 		= $message->get_tagList();
		}
		
		$rep 							= $this->httpPostJSON ( $params );
		
		return $rep ['result'] == 'ok' ? $rep ['contentId'] : '';
	}
	
	/**
	 * 获取apn contentId
	 * 
	 * @param	$appId
	 * @param	$message
	 * @return string
	 * 
	 */
	public function getAPNContentId($appId, $message) {
		$params 			= array ();
		
		$params ["action"] 	= "apnGetContentIdAction";
		$params ["appkey"] 	= $this->appkey;
		$params ["appId"] 	= $appId;
		$params ["PI"] 		= base64_encode($message->get_data()->get_pushInfo()->SerializeToString());
		
		$rep 				= $this->httpPostJSON ($params);
		
		return $rep ['result'] == 'ok' ? $rep ['contentId'] : '';
	}
	
	/**
	 * 取消消息
	 * 
	 * @param	String $contentId
	 * @return boolean
	 * 
	 */
	public function cancleContentId($contentId) {
		$params 				= array ();
		
		$params ["action"] 		= "cancleContentIdAction";
		$params ["contentId"] 	= $contentId;
		
		$rep 					= $this->httpPostJSON ($params);
		
		return $rep ['result'] == 'ok' ? true : false;
	}
	
	/**
	 * 批量推送信息
	 * 
	 * @param	String $contentId
	 * @param	Array $targetList
	 * @return Array {result:successed_offline,taskId:xxx} || {result:successed_online,taskId:xxx} || {result:error}
	 * 
	 */
	public function pushMessageToList($contentId, $targetList) {
		$params 				= array ();
		
		$params ["action"] 		= "pushMessageToListAction";
		$params ["contentId"] 	= $contentId;
		$params ["targetList"] 	= $targetList;
		$params ["type"] 		= 2;
		$needDetails 			= getenv ("needDetails");
		if ('true' == $needDetails) {
			$params ["needDetails"] = true;
		} else {
			$params ["needDetails"] = false;
		}
		
		return $this->httpPostJSON ( $params );
	}
	
	/**
	 * 根据deviceTokenList群推
	 * 
	 * @param	$appId
	 * @param	$contentId
	 * @param	$deviceTokenList
	 * @return mixed
	 */
	public function pushAPNMessageToList($appId, $contentId, $deviceTokenList) {
		$params 				= array ();
		
		$params ["action"] 		= "apnPushToListAction";
		$params ["appkey"] 		= $this->appkey;
		$params ["appId"] 		= $appId;
		$params ["contentId"] 	= $contentId;
		$params ["DTL"] 		= $deviceTokenList;
		$needDetails 			= getenv ("needDetails");
		if ('true' == $needDetails) {
			$params ["needDetails"] = true;
		} else {
			$params ["needDetails"] = false;
		}
		
		return $this->httpPostJSON ( $params );
	}
	
	public function pushMessageToApp($message, $taskGroupName = null) {
		$contentId 				= $this->getContentId ( $message, $taskGroupName );
		
		$params 				= array ();
		$params ["action"] 		= "pushMessageToAppAction";
		$params ["appkey"] 		= $this->appkey;
		$params ["contentId"] 	= $contentId;
		$params ["type"] 		= 2;
		
		return $this->httpPostJSON ( $params );
	}
	
	public function stop($contentId) {
		$params 				= array ();
		
		$params ["action"] 		= "stopTaskAction";
		$params ["appkey"] 		= $this->appkey;
		$params ["contentId"] 	= $contentId;
		
		try {
			$rep 	= $this->httpPostJSON ( $params );
			if ("ok" == $rep ["result"]) {
				return true;
			}
		} catch ( Exception $e ) {
			$log = "host:[" . $this->host . "]" . "取消任务失败：" . $e->getTraceAsString ();
			$this->debug($log);
		}
		return false;
	}
	
	public function getClientIdStatus($appId, $clientId) {
		$params 				= array ();
		
		$params ["action"] 		= "getClientIdStatusAction";
		$params ["appkey"] 		= $this->appkey;
		$params ["appId"] 		= $appId;
		$params ["clientId"] 	= $clientId;
		
		try {
			return $this->httpPostJSON ( $params );
		} catch ( Exception $e ) {
			$log = "host:[" . $this->host . "]" . "获取用户状态失败：" . $e->getTraceAsString ();
			$this->debug($log);
		}
		
	}
	
	public function setClientTag($appId, $clientId, $tags) {
		$params 			 = array ();
		
		$params ["action"] 	 = "setTagAction";
		$params ["appkey"] 	 = $this->appkey;
		$params ["appId"] 	 = $appId;
		$params ["clientId"] = $clientId;
		$params ["tagList"]  = $tags;
		
		try {
			return $this->httpPostJSON ( $params );
		} catch ( Exception $e ) {
			$log = "host:[" . $this->host . "]" . "setTag失败：" . $e->getTraceAsString ();
			$this->debug($log);
		}
		
	}
	
	public function getUserTags($appId, $clientId) {
		$params 				= array ();
		$params ["action"] 		= "getUserTags";
		$params ["appkey"] 		= $this->appkey;
		$params ["appId"] 		= $appId;
		$params ["clientId"] 	= $clientId;
		try {
			return $this->httpPostJson ($params);
		} catch ( Exception $e ) {
			$log = "host:[" . $this->host . "]" . "getUserTags失败：" . $e->getTraceAsString ();
			$this->debug($log);
		}
	}
	
	public function getPushResult($taskId) {
		$params 			= array ();
		$params ["action"] 	= "getPushMsgResult";
		$params ["appkey"] 	= $this->appkey;
		$params ["taskId"] 	= $taskId;
		try {
			return $this->httpPostJson ( $params );
		} catch ( Exception $e ) {
			$log = "host:[" . $this->host . "]" . "getPushResult失败：" . $e->getTraceAsString ();
			$this->debug($log);
		}
	}
	
	public function bindAlias($appId, $alias, $clientId) {
		$params 			= array ();
		
		$params ["action"] 	= "alias_bind";
		$params ["appkey"] 	= $this->appkey;
		$params ["appid"] 	= $appId;
		$params ["alias"] 	= $alias;
		$params ["cid"] 	= $clientId;
		try {
			return $this->httpPostJSON ( $params );
		} catch ( Exception $e ) {
			$log = "host:[" . $this->host . "]" . "bindAlias失败：" . $e->getTraceAsString ();
			$this->debug($log);
		}
	}
	
	public function bindAliasBatch($appId, $targetList) {
		$params 				= array ();
		$aliasList 				= array ();
		
		foreach ( $targetList as $target ) {
			$user 			= array ();
			$user ["cid"] 	= $target->get_clientId ();
			$user ["alias"] = $target->get_alias ();
			array_push($aliasList, $user );
		}
		$params ["action"] 		= "alias_bind_list";
		$params ["appkey"] 		= $this->appkey;
		$params ["appid"] 		= $appId;
		$params ["aliaslist"] 	= $aliasList;
		try {
			return $this->httpPostJSON ( $params );
		} catch ( Exception $e ) {
			$log = "host:[" . $this->host . "]" . "bindAlias失败：" . $e->getTraceAsString ();
			$this->debug($log);
		}
	}
	
	public function queryClientId($appId, $alias) {
		$params 			= array ();
		
		$params ["action"] 	= "alias_query";
		$params ["appkey"] 	= $this->appkey;
		$params ["appid"] 	= $appId;
		$params ["alias"] 	= $alias;
		try {
			return $this->httpPostJSON ( $params );
		} catch ( Exception $e ) {
			$log = "host:[" . $this->host . "]" . "queryClientId失败：" . $e->getTraceAsString ();
			$this->debug($log);
		}
	}
	
	public function queryAlias($appId, $clientId) {
		$params 			= array ();
		
		$params ["action"] 	= "alias_query";
		$params ["appkey"] 	= $this->appkey;
		$params ["appid"] 	= $appId;
		$params ["cid"] 	= $clientId;
		try {
			return $this->httpPostJSON ( $params );
		} catch ( Exception $e ) {
			$log = "host:[" . $this->host . "]" . "queryAlias失败：" . $e->getTraceAsString ();
			$this->debug($log);
		}
	}
	
	public function unBindAlias($appId, $alias, $clientId = null) {
		$params 			= array ();
		
		$params ["action"] 	= "alias_unbind";
		$params ["appkey"] 	= $this->appkey;
		$params ["appid"] 	= $appId;
		$params ["alias"] 	= $alias;
		
		if (! is_null ( $clientId ) && trim ( $clientId ) != "") {
			$params ["cid"] = $clientId;
		}
		try {
			return $this->httpPostJSON ( $params );
		} catch ( Exception $e ) {
			$log = "host:[" . $this->host . "]" . "unBindAlias失败：" . $e->getTraceAsString ();
			$this->debug($log);
		}
	}
	
	public function unBindAliasAll($appId, $alias) {
		return $this->unBindAlias ( $appId, $alias );
	}
	
	private function debug($log) {
		if ($this->debug) {
// 			echo ($log) . "\r\n";
			Log::write($log);
		}
	}
	
	private function micro_time() {
		list ($usec, $sec) 	= explode ( " ", microtime () );
		$time 				= ($sec . substr ( $usec, 2, 3 ));
		return $time;
	}
	
	private function httpPostJSON($params) {
		$params ["version"]	= "3.0.0.0";
		$data 				= $this->createParam ( $params );
		$result 			= $this->httpPost ( $data );
		$rep 				= json_decode ( $result, true );
		
		if ($rep ['result'] == 'sign_error') {
			if ($this->connect ())
				return $this->httpPostJSON ( $params );
		}
		return $rep;
	}
	
	private function createParam($params) {
		$params ['appkey'] = $this->appkey;
		if ($this->format == 'json') {
			return json_encode ( $params );
		}
	}
	
	private function createSign($params) {
		$sign 	= null;
		foreach ( $params as $key => $val ) {
			if (isset ( $key ) && isset ( $val )) {
				if (is_string ( $val ) || is_numeric ( $val )) { 			# 针对非 array object 对象进行sign
					$sign .= $key . ($val); 								# urldecode
				}
			}
		}
		$sign 	= md5 ( $sign );
		return $sign;
	}
	
	private function httpPost($data) {
		$curl 			= curl_init ( $this->host );
		curl_setopt ( $curl, CURLOPT_RETURNTRANSFER, 1 );
		curl_setopt ( $curl, CURLOPT_BINARYTRANSFER, 1 );
		curl_setopt ( $curl, CURLOPT_USERAGENT, 'GeTui PHP/1.0' );
		curl_setopt ( $curl, CURLOPT_POST, 1 );
		curl_setopt ( $curl, CURLOPT_CONNECTTIMEOUT, 60 );
		curl_setopt ( $curl, CURLOPT_TIMEOUT, 60 );
		curl_setopt ( $curl, CURLOPT_POSTFIELDS, $data );
		$curl_version 	= curl_version ();
		if ($curl_version ['version_number'] >= 462850) {
			curl_setopt ( $curl, CURLOPT_CONNECTTIMEOUT_MS, 30000 );
			curl_setopt ( $curl, CURLOPT_NOSIGNAL, 1 );
		}
		// 通过代理访问接口需要在此处配置代理
		// curl_setopt($curl, CURLOPT_PROXY, '192.168.1.18:808');
		// 请求失败有3次重试机会
		$result 		= $this->exeBySetTimes (3, $curl);
		curl_close($curl);
// 		$this->debug("发送请求 post:{$data} return:{$result}");
		$this->debug("return:{$result}");
		
		return $result;
	}
	
	private function exeBySetTimes($count, $curl) {
		$result = curl_exec($curl);
		if (curl_errno($curl)) {
			$this->debug("请求错误: " . curl_errno($curl));
			if ($count > 0) {
				$count --;
				$result = $this->exeBySetTimes($count, $curl);
			}
		}
		return $result;
	}
}
