<?php
namespace Service\Model;

class DestModel extends BaseModel {
	
	protected    $tableName = 'dest_v2';	# 切换数据表操作
	
	# 固定搜索
	public function getIdByDest($place) {
		
		$map          		= array();
		$map['place'] 		= $place;
		$destId 	  		= $this->where($map)->getField("id");
	
		return $destId;
	}
	
	# 模糊搜索
	public function getSuggestByDest($place) {
		$map          			= array();
		$map['place'] 			= array('like', "$place%");
		$map['pinyin'] 			= array('like', "$place%");
		$map['short_name'] 		= array('like', "$place%");
		$map['_logic'] 			= 'or';
		$suggestInfo            = array();
		$destInfoTmp 	  		= $this->where($map)->field("id, p_id, place, level")->order('id, level asc')->limit(5)->select();
		if (!empty($destInfoTmp)) {
			$suggestInfo = $this->wrapDestDesc($destInfoTmp);				# 这里必须在p_id字段做索引，要不然唇环嵌套查询会有问题
		}
		
		return $suggestInfo;
	}
	
	# 获取描述
	private function wrapDestDesc($dests) {
		if (!empty($dests)) {
			foreach ($dests as &$value) {
				$level 			= $value['level'];
				$dest 			= $value['place'];
				$pid 			= $value['p_id'];
				$pname  		= $this->getParentNameByPid($pid);		# 获取父级的名称
				$value['place'] = $level == 4 ? $pname : $dest;			# 转化景点
				$value['dest'] 	= $dest;
				$value['desc'] 	= empty($pname) ? $dest : $dest." ".$pname;
			}
		}
		
		return $dests;
	}
	
	# 获取父节点的名称
	private function getParentNameByPid($pid) {
		$pName = '';
		if (!empty($pid)) {
			$map 			= array();
			$map['id'] 		= $pid;
			$pName 			= $this->where($map)->getField("place");
		}
		
		return $pName;
	}
	
	# 根据pids获取父节点的名称
	private function getParentNameByPids($pids) {
		$pNames = array();
		if (!empty($pids)) {
			$map 			= array();
			$map['id'] 		= array("in", $pids);
			$pNames 			= $this->where($map)->field("id, place")->select();
		}
		if (!empty($pNames)) {
			$pNames = $this->setKeyByField($pNames, 'id');
		}
		
		return $pNames;
	}
	
	# 获取id下的子节点
	public function getChildIds($place) {
		$childIds 			= array();
		$pid                = $this->getIdByDest($place);
		$childIdTmp         = $this->getChildInfo($pid);
		$childIds           = $this->getArrFieldVals($childIdTmp, 'id');
		
		return $childIds;
	}
	
	# 获取所有id的子节点信息,包括自己
	private function getChildInfo($pid) {
		$lists = array();
		if (!empty($pid)) {
			$path 			= $this->where("id = $pid")->getField("path");
			$map 			= array();
			$map['path'] 	= array('like', $path."%");
			$lists          = $this->where($map)->field("id,level,p_id,place,path")->select();
		}
		
		return empty($lists) ? array() : $lists;
	}
		
	# 获取多个目的地的id
	public function getIdsByDests(array $dests) {
		$destIds      		= array();
		if (count($dests) > 0) {
			$map          	= array();
			$map['place'] 	= array("in", $dests);		# 精确匹配
			$destIdsTmp	  	= $this->where($map)->field("id")->select();
			if (!empty($destIdsTmp)) {
				$destIds  	= $this->getArrFieldVals($destIdsTmp, "id");
			}
		}
		
		return $destIds;
	}
	
	# 根据ids获取目的地
	public function getPlaceByIds($destIds) {
		$places                 = array();
		if (!empty($destIds)) {
			$map                = array();
			$map['id']          = array('in', $destIds);
			$placeArr 			= $this->where($map)->field("id, place, desc")->select();
			$places 			= $this->setKeyByField($placeArr, "id");
		}
		
		return $places;
	}
	
	# 根据id获取目的地
	public function getPlaceById($destId) {
		$place					= '';
		if (!empty($destId)) {
			$map                = array();
			$map['id']          = $destId;
			$place 				= $this->where($map)->getField('place');
		}
		
		return $place;
	}
	
}