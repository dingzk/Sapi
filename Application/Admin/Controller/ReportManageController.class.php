<?php
namespace Admin\Controller;

use Admin\Model\ReportModel;

class ReportManageController extends CommonController {
	
	public function _initialize() {
		parent::_initialize();
        $this->needLogin();
	}

    //根据帖子id删除帖子的举报记录
	public function delReport() {

        $postId         = $_REQUEST['id'];
		$reportModel 	= new ReportModel();
		$res            = $reportModel->delReport($postId);

        $this->ajaxReturn($res, 'json');
	}
}