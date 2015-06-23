<?php
namespace Api\Controller;

use Router\Router\Router;
/**
 * 处理用户反馈
 * @author zhenkai.ding
 *
 */
class FeedbackController extends CommonController{
	
	public function _initialize() {
		parent::_initialize();
	}
	
	public function feedBack() {
		
		$data   		= array();
		$data['bugs'] 	= $_REQUEST['bugs'];
		$data['qq'] 	= $_REQUEST['qq'];
		$data['email'] 	= $_REQUEST['email'];
		$data['phone'] 	= $_REQUEST['phone'];
		
		$res 			= Router::run($data);
		
		$this->echoRes($res);
		
	}
	
}