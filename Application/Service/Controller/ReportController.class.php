<?php
namespace Service\Controller;

use Service\Model\ReportModel;
/**
 * 举报相关的业务逻辑
 * @author zhenkai.ding
 *
 */
class ReportController extends CommonController {
	
	public function _initialize() {
		parent::_initialize();
	}
	
	public function addReport($postId) {
		$uid 			= $this->uid;
		$reportModel 	= new ReportModel();
		$status         = $reportModel->addReport($uid, $postId);
		
		return $status;
	}
}