<?php
namespace Api\Controller;

use Router\Router\Router;

class ImagesController extends CommonController {
	
	public function _initialize() {
		parent::_initialize();
	}
	
	
	public function index() {
		$this->display();
	}
	
	// 添加tag时候使用
	public function addTag() {
		$tagName 	= C('TAG_NAME_184x184');
		
		$result 	= Router::run($tagName);
		$ret 		= $this->wrapData($result);
		echo $ret;
		
		exit;
	}
	

	public function upload() {
		$id     		= $_REQUEST['id'];
		$result 		= Router::run();
		$result['id'] 	= $id;
		
		$ret 	= $this->wrapData($result);
		
		echo '<script> window.parent.postMessage('.$ret.', "*");</script>';
		
		exit;
	}
	
	# 为安卓写的图片上传接口
	public function uploadImg() {
		$imgs        	= Router::exec("Images", "upload");
		$this->err_code = !is_array($imgs) ? 1 : 0;
		$result['imgs'] = $imgs;
		$ret 			= $this->wrapData($result);
		echo $ret;
		
		exit;
	}
}