<?php

namespace Webview\Controller;

class IndexController extends CommonController {

    /*首页热门城市*/
	public function hotcity() {
		$this->display ();
	}

	/*个人名片页*/
	public function card() {
		$this->display ();
	}

	/*我的个人名片页*/
	public function mycard() {
		$this->display ();
	}

	/*信息中心*/
	public function message() {
		$this->display ();
	}

	/*帖子列表*/
	public function postlist() {
		$this->display ();
	}

	/*帖子详情页*/
	public function postdetail() {
		$this->display ();
	}

    /*发帖*/
	public function post() {
		$this->display ();
	}

	/*我发过的帖子*/
	public function mypost() {
		$this->display ();
	}

	/*隐私设置*/
	public function setting() {
		$this->display ();
	}

	/*对我感兴趣的人*/
	public function myjoy() {
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
}