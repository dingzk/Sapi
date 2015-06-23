<?php
namespace Service\Model;

// import('Service.Cache.Redis');	# 导入Redis类
require_once dirname(__FILE__).'/../Cache/Redis.class.php';	# 使用redis类库
use Cache\Redis\Redis;

/**
 * 首页的展示逻辑
 * @author zhenkai.ding
 *
 */
class HomePageModel extends BaseModel {
	
	public function getHomePageConfig() {
		
	}
	
}