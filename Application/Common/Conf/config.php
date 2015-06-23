<?php
return array(
    
    'TMPL_ENGINE_TYPE'=>'Smarty',
    'TMPL_ENGINE_CONFIG'=>array(
        'caching'=>true,
        //'template_dir'=>TMPL_PATH,
        'compile_dir'=>CACHE_PATH,
        'cache_dir'=>TEMP_PATH
    ),
    
	//'配置项'=>'配置值'
    'MODULE_ALLOW_LIST' => array (
                'Webview',
                'Mobile',
                'Api',
                'Sapi',
    ),
		
    'DEFAULT_MODULE'     => 'Mobile', //默认模块
    'URL_MODEL'          => '2', //URL模式
    //加载多出来的配置
    //'LOAD_EXT_CONFIG' => 'user,db',
    //...
    'LOG_RECORD' => true, // 开启日志记录
    'LOG_LEVEL'  =>'EMERG,ALERT,CRIT,ERR', // 只记录EMERG ALERT CRIT ERR 错误
    
    'URL_HTML_SUFFIX'     => '',
    'DEFAULT_CHARSET'     => 'utf-8',
    'DEFAULT_TIMEZONE'    => 'PRC',
    'DEFAULT_AJAX_RETURN' => 'JSON',
     
    'COOKIE_EXPIRE'       => 3600,
    'COOKIE_DOMAIN'       => '',
    'COOKIE_PATH'         => '/',
    'COOKIE_PREFIX'       => '',
     
    # session
    #'SESSION_AUTO_START' => true,
    'SESSION_AUTO_START' => false,
    'SESSION_OPTIONS' => array(),
    'SESSION_PREFIX'  => 'tourpal',
    'HTML_CACHE_ON'    => true,
    'HTML_CACHE_TIME'  => 60,
    'HTML_READ_TYPE'   => 0,           # 0 readfile 1 redirect
    'HTML_FILE_SUFFIX' => '.html',
	
    'ERROR_MESSAGE' => 'error page~',
		
	"BAIDU_PLACE_API" => 'http://api.map.baidu.com/geocoder/v2/?ak=MHSR6t26ifwnNbsNu2q3eMwv&output=json&pois=1&location=%s',
	
	"SHARE_LINK" => 'http://ly.elong.com/Mobile/Index/postdetail?post_id=%s',
	"SHARE_ICON" => 'http://pavo.elongstatic.com/i/tourpal_184x184/0000B3UQ.jpg',
		
	"ELONG_UCENTER" => "https://msecure.elong.com/login/api/user",
		
	'LIKED_MSG' 	=> 1,	# 点赞消息类型
	'COMMENT_MSG' 	=> 2,	# 评论的消息类型
);