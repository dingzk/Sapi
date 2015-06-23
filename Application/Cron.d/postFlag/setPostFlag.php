<?php

# 根据时间来标记帖子的状态
require_once '../common/utils.php';

define("NORMAL_POST", 0);
define("END_POST", 2);
define("LOG_FILE", dirname(__FILE__)."/post_flag.log");

$link 	= getConnect('192.168.40.19', 'tourpal', 'tourpal', 'tourpal');

$sql 	= "select id, start_at, days from posts where is_delete = ".NORMAL_POST;
$result = getRows($sql, $link);

$ids    = array();
$now    = date("Y-m-d");
foreach ($result as $row) {
	$id      = $row['id'];
	$startAt = $row['start_at'];
	$days    = $row['days'];
	$end 	 = date("Y-m-d", strtotime($startAt." +". ($days -1) ." days"));
	if ($now > $end) {
		$ids[] = $id;
	}
}

# 修改
if (!empty($ids)) {
	$idStr 	= implode(",", $ids);
	$sql 	= "update posts set is_delete = ".END_POST."  where id in ($idStr)";
	writeLog(LOG_FILE, $sql);
	query($sql, $link);
}