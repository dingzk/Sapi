<?php
namespace Api\Controller;

/**
 * 钩子类，用于处理Service模块处理不了的情况
 * @author zhenkai.ding
 *
 */
class HookController extends CommonController {
	
	/**
	 * 标志用户需要登录
	 */
	public function noLogin() {
		$msg = 'please login!';
		$this->resHandler(self::NO_LOGIN, $msg);
		$this->echoRes($msg);
	}
	
	/**
	 * 标志用户信息不完整
	 */
	public function setUserInfoNotComplete() {
		$msg = 'userInfo Not Be Completed!';
		$this->resHandler(self::INFO_NOT_COMPLETE, $msg);
		$this->echoRes($msg);
	}
	
}