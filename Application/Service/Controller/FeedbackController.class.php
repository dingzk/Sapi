<?php
namespace Service\Controller;

use Service\Model\FeedbackModel;
/**
 * 处理用户反馈
 * @author zhenkai.ding
 *
 */
class FeedbackController extends CommonController{
	
	public function _initialize() {
		parent::_initialize();
	}
	
	public function feedBack(array $data) {
		$feedbackModel = new FeedbackModel();
		$data          = array_filter($data);
		$id            = $feedbackModel->addData($this->uid, $data);
		
		return $id;
	}
	
}