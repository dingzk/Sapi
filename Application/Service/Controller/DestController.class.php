<?php
namespace Service\Controller;

use Service\Model\DestModel;
use Service\Model\PostDestModel;
use Service\Model\PostsModel;

/**
 * 基于地点搜索的相关逻辑
 * @author zhenkai.ding
 *
 */
class DestController extends CommonController {
	
	public function _initialize() {
		parent::_initialize();
	}
	
	# 模糊搜索
	public function suggest($place) {
		$suggests 			= array();
		if (!empty($place)) {
			$destModel 		= new DestModel();
			$destInfo 		= $destModel->getSuggestByDest($place);
			$suggests       = empty($destInfo) ? array() : $destInfo;
		}
		
		return array('list' => $suggests);
	}
	
	# 根据目的地获取发帖列表
	public function getPostsByPlace($place, $offset = 0, $perNum = 20) {
		$uid                    = $this->uid;
		$postList				= array();
		if (!empty($place)) {
			$destModel 			= new DestModel();
			$destIds 			= $destModel->getChildIds($place);
			if (!empty($destIds)) {
				$postDestModel 	= new PostDestModel();
				$postIds   		= $postDestModel->getPostIdByDestIds($destIds, $offset, $perNum + 1);	# 获取相关所有的post_id, 多获取一个用于判断后面还有没有
				if (!empty($postIds)) {
					$postsModel = new PostsModel();
					$postList	= $postsModel->getPostsByIds($uid, $postIds);							# 按照顺序输出
				}
			}
		}
		$pageInfo = $this->getPage($postList, $perNum, 'id');
		
		return $pageInfo;
	}
	
	# 获取热门城市(h5)
	public function getHotCity() {
		$hots = $this->getHotCityForApp();
		
		return $hots;
	}
	
	
	# 获取热门城市(app)
	public function getHotCityForApp() {
		$size = C('TAG_NAME_HOTCITY');
		$hots = array(
					array(
							"name" => "北京",
							"url" => "http://pavo.elongstatic.com/i/".$size."/0000yPGD.jpg",
							"desc" => "东方古都 长城故乡",
					),
					array(
							"name" => "成都",
							"url" => "http://pavo.elongstatic.com/i/".$size."/0000yPGG.jpg",
							"desc" => "来了就不想走的城市",
					),
					array(
							"name" => "杭州",
							"url" => "http://pavo.elongstatic.com/i/".$size."/0000yPGI.jpg",
							"desc" => "最忆是杭州",
					),
					array(
							"name" => "拉萨",
							"url" => "http://pavo.elongstatic.com/i/".$size."/0000yPHD.jpg",
							"desc" => "每一步都是天堂",
					),
					array(
							"name" => "丽江",
							"url" => "http://pavo.elongstatic.com/i/".$size."/0000yPHF.jpg",
							"desc" => "七彩云南 梦幻丽江",
					),
					array(
							"name" => "南京",
							"url" => "http://pavo.elongstatic.com/i/".$size."/0000yPHH.jpg",
							"desc" => "一城山水绕金陵",
					),
					array(
							"name" => "三亚",
							"url" => "http://pavo.elongstatic.com/i/".$size."/0000yPI3.jpg",
							"desc" => "天涯芳草 海角明珠",
					),
					array(
							"name" => "厦门",
							"url" => "http://pavo.elongstatic.com/i/".$size."/0000yPI4.jpg",
							"desc" => "面朝大海 心向厦门",
					),
					array(
							"name" => "上海",
							"url" => "http://pavo.elongstatic.com/i/".$size."/0000yPI5.jpg",
							"desc" => "东方明珠",
					),
					array(
							"name" => "西安",
							"url" => "http://pavo.elongstatic.com/i/".$size."/0000yPIE.jpg",
							"desc" => "华夏故都 山水之城",
					),
		);
		
		return $hots;
	}
	

}
