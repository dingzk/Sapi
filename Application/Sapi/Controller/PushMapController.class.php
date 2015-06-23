<?php
namespace Sapi\Controller;
use Router\Router\Router;

/**
 * 用户和客户端id的映射
 * @author zhenkai.ding
 *
 */

class PushMapController extends CommonController {
	
	public function _initialize() {
		parent::_initialize();
	}
	
	public function bind() {
		$insertId 		= Router::run($this->clientId);	# 默认是android
		$this->err_code = $insertId ? self::SUCCESS_CODE : self::ERR_CODE;
		
		$this->echoRes();
	}
	
	public function unbind() {
		$status 		=  Router::run($this->clientId);	# 默认是android
		$this->err_code = $status ? self::SUCCESS_CODE : self::ERR_CODE;
		
		$this->echoRes();
	}
	
}