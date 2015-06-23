<?php
return array(
		# MySQL config
		'DB_DEPLOY_TYPE'=> 1, // 设置分布式数据库支持
		'DB_TYPE'    => 'mysql',
		'DB_HOST'    => 'w.tourpal.p.mysql.elong.com,r.tourpal.p.mysql.elong.com',
		'DB_NAME'    => 'tourpal',
		'DB_USER'    => 'tourpal_w,tourpal_r',
		'DB_PWD'     => 'R9s3T6j1K9d7,Y65i1Y7j2U1a8',
		'DB_PORT'    => '6120,6120',
		'DB_RW_SEPARATE' => true,	# 读写分离
		'DB_PREFIX'  => '',
		'DB_SQL_LOG' => true,
		'DB_FIELDS_CACHE'    => true,
		'DB_FIELDTYPE_CHECK' => false,
		'DB_SQL_BUILD_CACHE' => false,
		'DB_SQL_BUILD_LENGTH' => 20,
		'DB_CHARSET'=>'utf8mb4',	# 为了支持emoji表情
		
		'REDIS_HOST' 		=> '172.21.18.138, 10.35.45.148',
		'REDIS_PORT' 		=> '6379, 6379',
		'REDIS_TIMEOUT' 	=> 5,
		'P_CONNECT' 		=> false,
		'REDIS_DEPLOY_TYPE' => true,
		'CACHE_TIMEOUT' 	=> 60*60,
		
		'UPLOAD_IMG_URL' 	=> "http://pavo.elongstatic.com/i/upload",
		'ADD_TAG_URL'    	=> "http://pavo.elongstatic.com/i/pavo/api/tag",
		'READ_IMG_URL'      => "http://pavo.elongstatic.com/i",
		
);