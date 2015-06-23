<?php
namespace Service\Model;
use Think\Model;

class BaseModel extends Model {
	
	public function _initialize() {
		parent::_initialize();
	}
	
	# 获取数组中的某一个字段的值
	protected function getArrFieldVals($arr, $field) {
		$fieldVals 		= array();
		if (!empty($arr)) {
			foreach ($arr as $value) {
				if (isset($value[$field])) {
					$fieldVals[] = $value[$field];
				}
			}
		}
		return $fieldVals;
	}
	
	# 把数组中的某一个字段作为key
	protected function setKeyByField($arr, $field) {
		$arrKey 	= array();
		if (!empty($arr)) {
			foreach ($arr as $value) {
				if (isset($value[$field])) {
					$arrKey[$value[$field]] = $value;
				}
			}
		}
		return $arrKey;
	}
	
	# 根据字段名称获取offset
	protected function getOffsetByField($arr, $field) {
		$offset         = 0;
		$num 			= count($arr);
		if ($num) {
			$offset 	= isset($arr[$num - 1][$field]) ? $arr[$num - 1][$field] : 0;
			$offset     = intval($offset);
		}
		 
		return $offset;
	}
	
	# 按照给定的id顺序来对数组排序
	protected function sortByKey($keys, $sortArr) {
		$sortRes         = array();
		foreach ($keys as $key) {
			if (isset($sortArr[$key])) {
				$sortRes[$key] = $sortArr[$key];
			}
		}
		
		return $sortRes;
	}
}