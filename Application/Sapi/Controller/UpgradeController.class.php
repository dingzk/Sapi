<?php
namespace Sapi\Controller;

use Think\Log;
define("CLIENT_PATH", dirname(__FILE__)."/../../../Client/");
define("CONFIG_FILE", "version.json");

/**
 * 版本升级控制
 * @author zhenkai.ding
 *
 */
class UpgradeController extends CommonController {
	
	/**
	 * 检查有没有更新
	 */
	public function check() {
		$config 	= $this->getConfig();
		
		if (!empty($config) && isset($config['client_update'])) {
			$clientInfo     = $config['client_update'];
			$newCode 		= $clientInfo['code'];
			$clientObj 		= $this->reqInfo->getClientInfo();
			$clientCode  	= $clientObj->getVersionCode();
			$updateObj		= new \ClientUpdateInfo();
			if ($clientCode < $newCode) {
				$versionName = $clientInfo['version'];					# 升级
				$versionUrl  = $clientInfo['apk'];
				$updateObj->setNeedUpdate(true);
				$updateObj->setLatestVersionName($versionName);
				$updateObj->setLatestVersionUrl($versionUrl);
			} else {
				$updateObj->setNeedUpdate(false);
			}
			$this->resInfo->setClientUpdateInfo($updateObj);
		}
		
		$this->echoRes();
	}
	
	/**
	 * 检查数据文件有没有更新
	 */
	public function updateDb() {
		$config 	= $this->getConfig();
		
		if (!empty($config) && isset($config['data_update'])) {
			$dbConfig 		= $config['data_update'];
			$reqObj 		= $this->reqInfo->getDataUpdateRequestInfo();
			$fileList 		= $reqObj->getDataFileNameIterator()->getArrayCopy();
			
			if (!empty($fileList)) {
				$dataUpdateResponseInfo = new \DataUpdateResponseInfo();
				foreach ($fileList as $filenameTmp) {
					list($filename, $versionCode) = explode("_", $filenameTmp);
					if (isset($filename) && isset($versionCode)) {
						if (!isset($dbConfig[$filename]['code'])) {
							Log::write("update db file ". $filename ."not be found !");
							continue;
						}
						$versionCodeNow = $dbConfig[$filename]['code'];
						$fileUrl 		= $dbConfig[$filename]['apk'];
						if ($versionCodeNow > $versionCode) {							# 升级数据
							$updateDataObj = new \UpdateData();
							$updateDataObj->setFileName($filename.'_'.$versionCodeNow);
							$updateDataObj->setUrl($fileUrl);
							$dataUpdateResponseInfo->appendUpdateData($updateDataObj);
						}
					}
				}
				$this->resInfo->setDataUpdateInfo($dataUpdateResponseInfo);
			} else {
				Log::write("update db file list empty !");
			}
		}
		
		$this->echoRes();
	}
	
	/**
	 * 读取配置文件
	 */
	private function getConfig() {
		$config     	= array();
		try {
			$jsonTmp 	= file_get_contents(CLIENT_PATH.CONFIG_FILE);
			$config     = json_decode($jsonTmp, true);
		} catch (\Exception $e) {
			$this->err_code = self::ERR_CODE;
			Log::write("upgrade config file not be found or read error !");
		}
		return $config;
	}
	
	/**
	 * 分发决策
	 */
	private function judge() {
		return true;
	}

	
}