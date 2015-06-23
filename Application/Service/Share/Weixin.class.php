<?php
namespace Share\Weinxin;

use Org\Util\String;
/**
 * 微信分享,支持JS-SDK
 * @author zhenkai.ding
 *
 */
class Weixin {
	
	const APPID 		= 'wxc14b93dff30da367';
	const APPSECRET 	= '48350e056da1d2e55da8dfb68fe6738e';
	const CACHE_TIME 	= 3600;
	static private $timestamp 	= '';
	static private $token 		= '';
	static private $ticket 		= '';
	static private $randStr 	= '';
	
	static private $status      = true;
	
	/**
	 * 需要缓存接口返回的数据，因为weixin接口有每天访问限制，设置缓存1小时
	 * @return string $token
	 */
	static private function getToken() {
		$token = S('access_token');
		if (empty($token)) {
			$sprintUrl 	= 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=%s&secret=%s';
			$url    	= sprintf($sprintUrl, self::APPID, self::APPSECRET);
			$res 		= curlPost($url, array(), 10);
			$result 	= json_decode($res, true);
			if (isset($result['access_token'])) {
				$token 	= $result['access_token'];
				S('access_token', $token, self::CACHE_TIME);
			} else {
				\Think\Log::write("get token error : ".$res);
				self::$status = false;
			}
		}
		self::$token = $token;
		
		return $token;
	}
	
	/**
	 * ticket和token一样
	 * @return string $token
	 */
	static private function getTicket(){
		$ticket = S('wx_ticket');
		if (empty($ticket)) {
			$token      = self::getToken();
			$sprintUrl	= 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=%s&type=jsapi';
			$url 		= sprintf($sprintUrl, $token);
			$res 		= curlPost($url, array(), 10);
			$result		= json_decode($res, true);
			if (isset($result['ticket'])) {
				$ticket = $result['ticket'];
				S('wx_ticket', $ticket, self::CACHE_TIME);
			} else {
				\Think\Log::write("get ticket error : ".$res);
				self::$status = false;
			}
		}
		self::$ticket = $ticket;
		
		return $ticket;
	}
	
	/**
	 * 获取时间戳
	 */
	static private function getTime() {
		self::$timestamp = time();
		return self::$timestamp;
	}
	
	/**
	 * 生成随机6位字符串
	 */
	static private function getRandStr() {
		self::$randStr = String::randString();
		return self::$randStr;
	}
	
	/**
	 * 获取签名
	 */
	static private function getSignature($shareUrl) {
		$sprintStr  = 'jsapi_ticket=%s&noncestr=%s&timestamp=%s&url=%s';
		$ticket 	= self::getTicket();
		$randStr    = self::getRandStr();
		$timestamp 	= self::getTime();
		$signature  = sprintf($sprintStr, $ticket, $randStr, $timestamp, $shareUrl);
		$signature  = sha1($signature);
		
		return $signature;
	}
	
	/**
	 * 获取微信分享的配置
	 * @param string $shareUrl
	 */
	public static function getWXConfig($shareUrl) {
		$config 				= array();
		$config['signature'] 	= self::getSignature($shareUrl);
		$config['appId'] 		= self::APPID;
		$config['timestamp'] 	= self::$timestamp;
		$config['nonceStr'] 	= self::$randStr;
		
		return self::$status ? $config : array();
	}

}