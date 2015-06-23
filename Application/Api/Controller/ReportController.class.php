<?php
namespace Api\Controller;

use Router\Router\Router;
/**
 * 提供举报相关业务逻辑
 * @author zhenkai.ding
 *
 */
class ReportController extends CommonController {
	
	public function addReport() {
		$postId = $_REQUEST['post_id'];
		$status = Router::run($postId);
		
		$this->echoRes($status);
	}
}