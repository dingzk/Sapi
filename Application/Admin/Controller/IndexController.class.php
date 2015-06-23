<?php

namespace Admin\Controller;

class IndexController extends CommonController {
	public function _initialize() {
        $this->needLogin();
    }

    /*test*/
	public function index() {
		$this->assign('endTime', date('Y-m-d'));
        $this->assign('startTime', date("Y-m-d", strtotime("1 days ago"))); 
		$this->display ('PostManage/index');
	}

}