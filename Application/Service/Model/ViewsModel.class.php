<?php
namespace Service\Model;

// import('Service.Cache.Redis');	# 导入Redis类
/* require_once dirname(__FILE__).'/../Cache/Redis.class.php';	# 使用redis类库
use Cache\Redis\Redis; */

/**
 * 计数器相关的业务逻辑
 * @author zhenkai.ding
 *
 */
class ViewsModel extends BaseModel {
	
	public function getPvByPostId($postId) {
		$map 			= array();
		$map['post_id'] = $postId;
		$hitCount 		= $this->where($map)->getField("cnt");
		$hitCount       = empty($hitCount) ? 0 : intval($hitCount);
		
		return $hitCount;
	}
	
	public function getPvByPostIds(array $postIds) {
		$hitCounts      = array();
		
		$map 			= array();
		if (!empty($postIds)) {
			$map['post_id'] = array('in', $postIds);
			$hitCounts 		= $this->where($map)->field("post_id, cnt")->select();
			$hitCounts      = $this->setKeyByField($hitCounts, 'post_id');
		}
		
		return $hitCounts;
	}
	
	# 浏览量加一
	public function incCount($postId, $uid = null) {
		
		$this->inc($postId);
		
/* 		if ($uid !== null) {
			$redis = new Redis();
			$key = $uid.'#'.$postId;
			$res = $redis->get($key);
			if (empty($res)) {
				$redis->set($key, time(), C('CACHE_TIMEOUT'));
				$this->inc($postId);
			}
		} else {
			$this->inc($postId);
		} */
		
		return true;
	}
	
	public function inc($postId) {
		$postId 	= intval($postId);
		$map 		= array();
		$tableName  = $this->getTableName();
		$sql 		= "insert into ".$tableName." (post_id, cnt) values ($postId, 1) on duplicate key update cnt = cnt + 1";
		$this->execute($sql);
	}
}