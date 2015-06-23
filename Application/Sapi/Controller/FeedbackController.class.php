<?php
namespace Sapi\Controller;

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
		$feedbackReqObj = $this->reqInfo->getFeedback();
		$data   		= array();
		$data['bugs'] 	= $feedbackReqObj->getBugs();
		$data['qq'] 	= $feedbackReqObj->getQq();
		$data['email'] 	= $feedbackReqObj->getEmail();
		$data['phone'] 	= $feedbackReqObj->getPhone();
		
		$res 			= Router::run($data);
		
		$this->err_code = $res ? self::SUCCESS_CODE : self::ERR_CODE;
		
		$this->echoRes();
		
	}
	
}