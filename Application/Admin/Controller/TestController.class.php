<?php
namespace Admin\Controller;
use Think\Controller;
class TestController extends Controller {
    public function index(){
        $this->assign("cookie", serialize($_COOKIE));
        $this->display();
    }
}