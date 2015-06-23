<?php
return array(
		
		//'配置项'=>'配置值'
		'MODULE_ALLOW_LIST' => array (
			    'Mobile',
				'Webview',
				'Api',
				'Sapi',
				'Admin'
		),
		
// 		'SHOW_PAGE_TRACE' =>true,
		# MySQL config
		'DB_TYPE'    => 'mysql',
		'DB_HOST'    => '192.168.40.19',
		'DB_NAME'    => 'tourpal',
		'DB_USER'    => 'tourpal',
		'DB_PWD'     => 'tourpal',
		'DB_PORT'    => '3306',
		'DB_PREFIX'  => '',
		'DB_SQL_LOG' => false,
		'DB_FIELDS_CACHE'    => false,
		'DB_FIELDTYPE_CHECK' => false,
		'DB_SQL_BUILD_CACHE' => false,
		'DB_SQL_BUILD_LENGTH' => 20,
		'DB_CHARSET'=>'utf8mb4',	# 为了支持emoji表情
		
		'REDIS_HOST' 		=> '192.168.9.130',
		'REDIS_PORT' 		=> '6379',
		'REDIS_TIMEOUT' 	=> 5,
		'P_CONNECT' 		=> false,
		'REDIS_DEPLOY_TYPE' => true,
		'CACHE_TIMEOUT' 	=> 60*60,
		
/* 		'UPLOAD_IMG_URL' 	=> "http://192.168.14.132:8080/i/upload",
		'ADD_TAG_URL'    	=> "http://192.168.14.132:8080/i/pavo/api/tag",
		'READ_IMG_URL'      => "http://192.168.14.132:8080/i", */
		'UPLOAD_IMG_URL' 	=> "http://pavo.elongstatic.com/i/upload",
		'ADD_TAG_URL'    	=> "http://pavo.elongstatic.com/i/pavo/api/tag",
		'READ_IMG_URL'      => "http://pavo.elongstatic.com/i",
		
);