<?php
namespace Sapi\Controller;

/**
 * 钩子类，用于处理Service模块处理不了的情况
 * @author zhenkai.ding
 *
 */
class HookController extends CommonController {
	
	/**
	 * 没有登录时候的回调函数
	 */
	public function noLogin() {
		$this->err_code = self::NO_LOGIN;
		$this->echoRes();
	}
	
	/**
	 * 标志用户信息不完整
	 */
	public function setUserInfoNotComplete() {
		$this->err_code = self::INFO_NOT_COMPLETE;
		$this->echoRes();
	}
	
}