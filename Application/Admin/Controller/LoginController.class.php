<?php
namespace Admin\Controller;

class LoginController extends CommonController {

    /*登录页面*/
	public function index() {
		$username = I('username');
		$password = I('password');
		if($username == C('USERNAME') && md5($password) == C('PASSWORD') || session('username')){
			session('username', $username);
			redirect('/index.php/Admin/Index');
		}
		$this->display ();
	}

	/*退出登录*/
	public function loginOut() {
		session('username', null);
		redirect('/index.php/Admin/Index');
	}
}
?>