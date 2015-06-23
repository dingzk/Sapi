<?php
namespace Sapi\Controller;

use Router\Router\Router;
/**
 * 提供打点相关统计
 * @author zhenkai.ding
 *
 */
class StatController extends CommonController {
	
	public function _initialize() {
		parent::_initialize();
	}
	
	public function dot() {
		$dotData 					= $this->reqInfo->getStatisticsData();
		$clientObj  				= $this->reqInfo->getClientInfo();
		
		$clientInfo						= array();
		$clientInfo['build_model']		= $clientObj->getBuildModel();
		$clientInfo['channel_id']		= $clientObj->getChannelId();
		$clientInfo['version_code']		= $clientObj->getVersionCode();
		$clientInfo['mid']				= $clientObj->getMid();
		
		$clientStr                  	= implode("|", $clientInfo);
		
		$data       = $dotData.' '.$clientStr;
		Router::run($data);
		$this->echoRes();
	}
	
}