<?php
namespace Sapi\Controller;

use Router\Router\Router;
/**
 * 提供举报相关业务逻辑
 * @author zhenkai.ding
 *
 */
class ReportController extends CommonController {
	
	public function addReport() {
		$postId = $this->reqInfo->getPostId();
		$status = Router::run($postId);
		
		$this->err_code = $status ? self::SUCCESS_CODE : self::ERR_CODE;
		
		$this->echoRes();
	}
}