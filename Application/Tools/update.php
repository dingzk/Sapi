<?php
require 'utils.php';

$link = getConnect("r.tourpal.p.mysql.elong.com:6120", 'tourpal_r', 'Y65i1Y7j2U1a8', 'tourpal');

// $link = getConnect("w.tourpal.p.mysql.elong.com:6120", 'tourpal_w', 'R9s3T6j1K9d7', 'tourpal');

// mysql -hw.tourpal.p.mysql.elong.com -utourpal_w -pR9s3T6j1K9d7 -P6120  tourpal
// mysql -hr.tourpal.p.mysql.elong.com -utourpal_r  -pY65i1Y7j2U1a8 -P6120  tourpal


$sql1 = "select id, place from dest where id in (select distinct dest_id from post_dest)";
$res1 = getRows($sql1, $link);

# 旧的映射关系
$idPlaceOld = array();
$placeArr 	= array();
foreach ($res1 as $value) {
	$place 					= $value['place'];
	if (mb_strlen($place, 'UTF-8') >2) {
		$lastChar 				= mb_substr($place, -1, 1, 'UTF-8');
		if (in_array($lastChar, array("东","西","南","北","市"))) {
			$place = mb_substr($place, 0, mb_strlen($place, 'UTF-8')-1, 'UTF-8');
		}
	}
	if ($place == '峨眉') {
		$place = '峨眉山市';
	} elseif ($place == '陵水') {
		$place = '陵水黎族自治县';
	} elseif ($place == '五台山') {
		$place = '五台山风景名胜区';
	}

	$destId             	= $value['id'];
	$idPlaceOld[$destId]	= $place;
}

# 新的映射关系
$sql2 		= "select id, place from dest_v2 ";
$res2 		= getRows($sql2, $link);
foreach ($res2 as $v) {
	$placeIdNew[$v['place']] =  $v['id'];
}

# 逐一修改dest_id字段
$sql = "select * from post_dest";
$res = getRows($sql, $link);
foreach ($res as $val) {
	$id         = $val['id'];
	$uid        = $val['uid'];
	$postId        = $val['post_id'];
	$destId 	= $val['dest_id'];
	$created_at 	= $val['created_at'];
	$placeTmp      = $idPlaceOld[$destId];
	
	if (empty($placeTmp)) {
		$array = array('30'=>'丽江', '55'=>'洱海','63'=>'台湾','70'=>'天津','71'=>'天津','89'=>'青海','118'=>'香港');
		$placeTmp = $array[$id];
	}
	
	# 新的dest_id
	if (isset($placeIdNew[$placeTmp]) || isset($placeIdNew[$placeTmp."市"]) || isset($placeIdNew[$placeTmp."区"]) || isset($placeIdNew[$placeTmp."县"])) {
		$newDestId 	= isset($placeIdNew[$placeTmp]) ? $placeIdNew[$placeTmp] : $placeIdNew[$placeTmp."市"];
		if (empty($newDestId)) {
			$newDestId = isset($placeIdNew[$placeTmp."县"]) ? $placeIdNew[$placeTmp."县"] : $placeIdNew[$placeTmp."区"];
		}
		if (!empty($newDestId)) {
			# 插入
			$sql3 = "replace into post_dest_v2 (id, uid, post_id, dest_id, created_at) values ($id, $uid, $postId, $newDestId, '$created_at')";
// 			query($sql3, $link);
		}
	} else {
		echo "id: ".$id,"postId : ".$postId," place: ".$placeTmp.PHP_EOL;
	}
} 