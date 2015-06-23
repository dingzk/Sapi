<?php
namespace Protobuf\ProtoHandler;

import("Service.Security.DES");
import("Sapi.Protobuf.ProtoMessage");
use Security\DES\DES;
use Think\Log;

class ProtoHandler{
	
    public static $MAX_TRUNK_SIZE = 5;
    
    /**
     * 解析请求
     * @param String $packed
     * @param String $verify
     * @return object
     */
    public function getReqMessage($packed, $verify) {
        
        $packed 	= rawurldecode($packed);
        if (!$this->verifyData($packed, $verify)) {
        	$reqInfo = new \RequestInfo();
            try {
            	$data 	 = DES::DESDecrypt($packed);
                $reqInfo->parseFromString($data);
            } catch (\Exception $e) {
                Log::write('Parse protobuf obj error: ' . $e->getMessage());
            }
        }
        
        return isset($reqInfo) ? $reqInfo : '';
        
    }
    
	/**
	 * 编码返回数据
	 * @param \ResponseInfo $protobufObj
	 * @return string
	 */
    public function getResMessage(\ResponseInfo $protobufObj) {
    	//序列化protobuf对象
    	$protobuf       = "";
    	$encryptData 	= "";
    	try {
    		$protobuf 			= $protobufObj->serializeToString();
    	} catch (\Exception $e) {
    		Log::write('Serialize protobuf obj error: ' . $e->getMessage());
    	}
    	
    	if (is_string($protobuf) && !empty($protobuf)) {
    		try {
    			$encryptData	= DES::DESEncrypt($protobuf);
    		} catch (\Exception $e) {
    			Log::write('Encrypt protobuf obj error: ' . $e->getMessage());
    		}
    	}
		
    	return $encryptData;
    }
    
    /**
     * 获取并检验数据合法性
     */
    private function verifyData($data, $verify){
        return strcmp($verify, $this->genVerifyStr($data));
    }
    
    
    private function genVerifyStr($data) {
    	$md5Str 		= "";
    	if (!empty($data)) {
    		if (strlen($data) > self::$MAX_TRUNK_SIZE) {
    			$data 	= substr($data, 0, self::$MAX_TRUNK_SIZE);
    		}
    		$arr 		= str_split($data);
    		sort($arr);
    		$sortStr 	= implode("", $arr);
    		$md5Str 	= md5($sortStr);
    	}
    	
    	return $md5Str;

    }
    
}

?>