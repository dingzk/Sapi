<?php

namespace Mobile\Controller;

class IndexController extends CommonController {

	/*自动跳转首页*/
	public function index() {
		$this->redirect('Mobile/Index/hotcity');
	}

    /*首页热门城市*/
	public function hotcity() {
		$this->display ();
	}

	/*个人名片页*/
	public function card() {
		$this->needlogin();
		$this->display ();
	}

	/*我的个人名片页*/
	public function mycard() {
		$this->needlogin();
		$this->display ();
	}

	/*个人主页*/
	public function message() {
		$this->needlogin();
		$this->display ();
	}

	/*隐私设置*/
	public function setting() {
		$this->needlogin();
		$this->display ();
	}

	/*帖子列表*/
	public function postlist() {
		$this->display ();
	}

	/*帖子详情*/
	public function postdetail() {
		$this->display ();
	}

    /*发帖*/
	public function post() {
		$this->needlogin();
		$this->display ();
	}

	/*我发过的帖子*/
	public function mypost() {
		$this->needlogin();
		$this->display ();
	}

	/*对我感兴趣的人*/
	public function myjoy() {
		$this->needlogin();
		$this->display ();
	}

	/*愿意同行的人*/
	public function joylist() {
		$this->display ();
	}

	/*意见反馈*/
	public function feedback() {
		$this->display ();
	}

	/*需要登录跳转*/
	public function needlogin() {
		if(!$_COOKIE['SessionToken']){
			$url = urlencode($this->get_url());
			$logOutUrl = sprintf(C('ELONG_H5_LOGIN'), $url);
			redirect($logOutUrl);
		}
	} 
}