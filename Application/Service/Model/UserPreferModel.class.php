<?php
namespace Service\Model;

/**
 * 用户与旅行偏好相关业务逻辑
 * @author zhenkai.ding
 *
 */
class UserPreferModel extends BaseModel {
	
	public function addPreferByIds($uid, $preferIds) {
		$result 		= true;
		if (!$preferIds || !$uid) {
			return false;
		}
		$map 			= array();
		$map['uid'] 	= $uid;
		$status       	= $this->where($map)->delete();		# 先彻底删除再进行添加
		
		$dataList		= array();
		foreach ($preferIds as $preferId) {
			$dataList[] = array('uid' => $uid, 'prefer_id' => $preferId);
		}
		$result 	    = $this->addAll($dataList);
		
		return $result;
	}
	
	public function delPreferByUid($uid) {
		$map 			= array();
		$map['uid'] 	= $uid;
		$this->where($map)->delete();
		
		return true;
	}
	
	public function getPreferByUid($uid) {
		$map 			= array();
		$map['uid'] 	= $uid;
		$preferIdsTmp 	= $this->where($map)->field('prefer_id')->select();
		if ($preferIdsTmp) {
			$preferIds  = $this->getArrFieldVals($preferIdsTmp, 'prefer_id');
		}
		
		$preferModel 	= new PreferModel();
		$preferNameTmp  = $preferModel->getTagNameByIds($preferIds);			# 输出顺序和写入顺序一致
		$preferNames    = $this->sortByKey($preferIds, $preferNameTmp);
		
		return $preferNames;
	}
	
	# 添加旅行偏好
	public function addPreferByNames($uid, $perferList) {
		$status         = false;
		$preferModel 	= new PreferModel();
		$perferList		= (array)$perferList;
		$preferIds 		= $preferModel->getIdsByTagNames($perferList);
		if ($preferIds) {
			$status     = $this->addPreferByIds($uid, $preferIds);
		}
	
		return $status !== false ? true : false;
	}
	
}