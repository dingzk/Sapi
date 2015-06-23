<?php

if (!function_exists("mysqlLikeQuote")) {
    /**
     * 对 MYSQL LIKE 的内容进行转义
     *
     * @access      public
     * @param       string      string  内容
     * @return      string
     */
    function mysqlLikeQuote($str) {
        return strtr($str, array("\\\\"=>"\\\\\\\\", '_'=>'\_', '%'=>'\%', '\''=>'\\\\\''));
    }
}


/**
 * 将子项通过字符串拆解出来，形成子项数组
 * 
 * @param String $detail
 */
function explodeSubItems($detail) {
    $items                    = explode("#", $detail);
    
    $subItems                 = array();
    foreach ($items as $item) {
        $piece                = explode(":", $item);
        $subItemId            = $piece[0];
        $subItemValue         = recoverSubItem($piece[1]);
        
        $subItems[$subItemId] = $subItemValue;
    }
    
    return $subItems;
}


/**
 * 自定义的特殊字符恢复原始状态替换
 * 用于子监控项的使用，一些影响解析的字符会使用ASCII码中无法显示的字符替换
 * 
 * @param String $itemValue
 */
function recoverSubItem($itemValue) {
    $value          = "";
    if ($itemValue == "") {
        $value      = "";
    } elseif (is_numeric($itemValue)) {
        $value      = $itemValue;
    } else {
        $value      = str_replace("||", "\r\n", $itemValue);
        $value      = str_replace("\7", "#", $value);
        $value      = str_replace("\6", ":", $value);
        $value      = str_replace("\5", ",", $value);
    }
    
    return $value;
}


/**
 * 递归方式的对变量中的空格trim
 *
 * @access  public
 * @param   mix   $value
 *
 * @return  mix
 */
function cleanCharacterDeep($value) {
    if (empty($value)) {
        return $value;
    } else {
        return is_array($value)?array_map("cleanCharacterDeep", $value):trim($value);
    }
}


/**
 * 递归方式的对对象成员变量或者数组的特殊字符进行转义
 *
 * @access   public
 * @param    mix        $obj      对象或者数组
 *
 * @return   mix                  对象或者数组
 */
function cleanCharacterDeepObj($obj) {
    if (is_object($obj) == true) {
        foreach ($obj as $key=>$val) {
            $obj->$key = cleanCharacterDeep($val);
        }
    } else {
        $obj = cleanCharacterDeep($obj);
    }

    return $obj;
}


/**
 * 递归方式的对变量中的特殊字符进行转义
 * 转义内容包含：
 * 1、trim
 * 2、addslashes
 * 3、htmlspecialchars
 *
 * @access  public
 * @param   mix   $value
 *
 * @return  mix
 */
function addslashesDeep($value) {
    if (empty($value)) {
        return $value;
    } else {
        return is_array($value)?array_map("addslashesDeep", $value):addslashes(trim($value));
    }
}


/**
 * 递归方式的对对象成员变量或者数组的特殊字符进行转义
 *
 * @access   public
 * @param    mix        $obj      对象或者数组
 * @author   Xuan Yan
 *
 * @return   mix                  对象或者数组
 */
function addslashesDeepObj($obj) {
    if (is_object($obj) == true) {
        foreach ($obj as $key=>$val) {
            $obj->$key = addslashesDeep($val);
        }
    } else {
        $obj = addslashesDeep($obj);
    }

    return $obj;
}


/**
 * 递归方式的对变量htmlspecialchars
 */
function htmlspecialcharsRecurs($value) {
    if (empty($value)) {
        return $value;
    } else {
        return is_array($value)?array_map("htmlspecialcharsRecurs", $value):htmlspecialchars(trim($value));
    }
}


/**
 * 递归方式的对变量htmlspecialchars_decode
 */
function striphtmlspecialcharsRecurs($value) {
    if (empty($value)) {
        return $value;
    } else {
        return is_array($value)?array_map("striphtmlspecialcharsRecurs", $value):htmlspecialchars_decode(trim($value));
    }
}


/**
 * 递归方式的对变量中的特殊字符去除转义
 *
 * @access  public
 * @param   mix     $value
 *
 * @return  mix
 */
function stripslashesDeep($value) {
    if (empty($value)) {
        return $value;
    } else {
        return is_array($value)?array_map("stripslashesDeep", $value):stripslashes($value);
    }
}


/**
 * 检测浏览器语言，只提供可用的$availableLanguages作为数组(‘en’, ‘de’, ‘es’)
 *
 * @param Array $availableLanguages
 * @param String $default
 */
function get_client_language($availableLanguages, $default = 'en') {
    if (isset($_SERVER['HTTP_ACCEPT_LANGUAGE'])) {
        $langs      = explode(',', $_SERVER['HTTP_ACCEPT_LANGUAGE']);
        foreach ($langs as $value){            // start going through each one
            $choice = substr($value,0,2);
            if(in_array($choice, $availableLanguages)){
                return $choice;
            }
        }
    }

    return $default;
}


/**
 * 创建一个合法的uri
 *
 * @param String $file
 * @param String $mime
 */
function create_uri_data($file, $mime) {
    $contents = file_get_contents($file);
    $base64   = base64_encode($contents);
    echo "data:$mime;base64,$base64";
}


/**
 * 将一个字串中含有全角的数字字符、字母、空格或'%+-()'字符转换为相应半角字符
 *
 * @access  public
 * @param   string       $str         待转换字串
 *
 * @return  string       $str         处理后字串
 */
function makeSemiangle($str) {
    $arr = array('０'=>'0', '１'=>'1', '２'=>'2', '３'=>'3', '４'=>'4', '５'=>'5', '６'=>'6', '７'=>'7', '８'=>'8', '９'=>'9',
                 'Ａ'=>'A', 'Ｂ'=>'B', 'Ｃ'=>'C', 'Ｄ'=>'D', 'Ｅ'=>'E', 'Ｆ'=>'F', 'Ｇ'=>'G', 'Ｈ'=>'H', 'Ｉ'=>'I', 'Ｊ'=>'J',
                 'Ｋ'=>'K', 'Ｌ'=>'L', 'Ｍ'=>'M', 'Ｎ'=>'N', 'Ｏ'=>'O', 'Ｐ'=>'P', 'Ｑ'=>'Q', 'Ｒ'=>'R', 'Ｓ'=>'S', 'Ｔ'=>'T',
                 'Ｕ'=>'U', 'Ｖ'=>'V', 'Ｗ'=>'W', 'Ｘ'=>'X', 'Ｙ'=>'Y', 'Ｚ'=>'Z', 'ａ'=>'a', 'ｂ'=>'b', 'ｃ'=>'c', 'ｄ'=>'d',
                 'ｅ'=>'e', 'ｆ'=>'f', 'ｇ'=>'g', 'ｈ'=>'h', 'ｉ'=>'i', 'ｊ'=>'j', 'ｋ'=>'k', 'ｌ'=>'l', 'ｍ'=>'m', 'ｎ'=>'n',
                 'ｏ'=>'o', 'ｐ'=>'p', 'ｑ'=>'q', 'ｒ'=>'r', 'ｓ'=>'s', 'ｔ'=>'t', 'ｕ'=>'u', 'ｖ'=>'v', 'ｗ'=>'w', 'ｘ'=>'x',
                 'ｙ'=>'y', 'ｚ'=>'z', '（'=>'(', '）'=>')', '〔'=>'[', '〕'=>']', '【'=>'[', '】'=>']', '〖'=>'[', '〗'=>']',
                 '“'=>'[', '”'=>']', '‘'=>'[', '’'=>']', '｛'=>'{', '｝'=>'}', '《'=>'<', '》'=>'>', '％'=>'%', '＋'=>'+',
                 '—'=>'-', '－'=>'-', '～'=>'-', '：'=>':', '。'=>'.', '、'=>',', '，'=>'.', '、'=>'.', '；'=>',', '？'=>'?',
                 '！'=>'!', '…'=>'-', '‖'=>'|', '”'=>'"', '’'=>'`', '‘'=>'`', '｜'=>'|', '〃'=>'"', '　'=>' ');

    return strtr($str, $arr);
}


/**
 * 获取客户端IP地址
 *
 */
function getClientIp() {
    if (getenv("HTTP_CLIENT_IP") && strcasecmp(getenv("HTTP_CLIENT_IP"), "unknown")) {
        $ip = getenv("HTTP_CLIENT_IP");
    }
    else if (getenv("HTTP_X_FORWARDED_FOR") && strcasecmp(getenv("HTTP_X_FORWARDED_FOR"), "unknown")) {
        $ip = getenv("HTTP_X_FORWARDED_FOR");
    }
    else if (getenv("REMOTE_ADDR") && strcasecmp(getenv("REMOTE_ADDR"), "unknown")) {
        $ip = getenv("REMOTE_ADDR");
    }
    else if (isset($_SERVER["REMOTE_ADDR"]) && $_SERVER["REMOTE_ADDR"] && strcasecmp($_SERVER["REMOTE_ADDR"], "unknown")) {
        $ip = $_SERVER["REMOTE_ADDR"];
    }
    else {
        $ip = "unknown";
    }
    return $ip;
}


/**
 * 字符串截取，将字符串截取为指定长度的字符串，被截取部分使用...替换
 * 支持中文和其他编码
 *
 * @static
 * @access public
 *
 * @param string $str     需要转换的字符串
 * @param string $start   开始位置
 * @param string $length  截取长度
 * @param string $charset 编码格式
 * @param string $suffix  截断显示字符
 *
 * @return string
 *
 */
function msubstr($str, $start = 0, $length, $charset = "utf-8", $suffix = true) {
    if (function_exists("mb_substr")) {
        if ($suffix && strlen($str) > $length) {
            return mb_substr($str, $start, $length, $charset)."...";
        } else {
            return mb_substr($str, $start, $length, $charset);
        }
    } elseif (function_exists("iconv_substr")) {
        if ($suffix && strlen($str) > $length) {
            return iconv_substr($str, $start, $length, $charset)."...";
        } else {
            return iconv_substr($str, $start, $length, $charset);
        }
    }

    $re["utf-8"]  = "/[\x01-\x7f]|[\xc2-\xdf][\x80-\xbf]|[\xe0-\xef][\x80-\xbf]{2}|[\xf0-\xff][\x80-\xbf]{3}/";
    $re["gb2312"] = "/[\x01-\x7f]|[\xb0-\xf7][\xa0-\xfe]/";
    $re["gbk"]    = "/[\x01-\x7f]|[\x81-\xfe][\x40-\xfe]/";
    $re["big5"]   = "/[\x01-\x7f]|[\x81-\xfe]([\x40-\x7e]|\xa1-\xfe])/";

    preg_match_all($re[$charset], $str, $match);
    $slice = join("", array_slice($match[0], $start, $length));
    if ($suffix) {
        return $slice."…";
    }

    return $slice;
}


/**
 * 获得当前格林威治时间的时间戳
 *
 * @return  integer
 */
function gmtTime() {
    return (time() - date("Z"));
}


/**
 * 清除项目Runtime目录下的所有数据
 *
 */
function clearCache() {
    #Dir::delDir(APP_NAME."./Runtime");
    @mkdir(APP_NAME."./Runtime", 0777);
    @chmod(APP_NAME."./Runtime", 0777);
}


/**
 * curl加强版
 *
 * @param String  $url
 * @param Array   $ref
 * @param Array   $post
 * @param String  $ua
 * @param Boolean $print
 * @param Int     $timeout
 */
function xcurl($url, $post = array(), $timeout = 5, $ref = null, $ua = "Mozilla/5.0 (X11; Linux x86_64; rv:2.2a1pre) Gecko/20110324 Firefox/4.2a1pre", $print = false) {
    $ch           = curl_init();
    
    if(!empty($ref)) {
        curl_setopt($ch, CURLOPT_REFERER, $ref);
    }
    
    curl_setopt($ch, CURLOPT_AUTOREFERER, true);
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_HEADER, 0);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); // curl_exec可以返回结果
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $timeout);
    curl_setopt($ch, CURLOPT_TIMEOUT, $timeout);
    
    if(!empty($ua)) {
        curl_setopt($ch, CURLOPT_USERAGENT, $ua);
    }

    if(count($post) > 0){
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $post);
    }

    $output       = curl_exec($ch);
    if (curl_errno($ch)) {
        Think\Log::write("Curl failed, Error info: ".curl_error($ch));
    }
    
    curl_close($ch);

    if($print) {
        print($output);
    } else {
        return $output;
    }
}


/**
 * curl提交数据
 *
 * @param String $url
 * @param Array  $post
 * @param Int     $timeout
 */
function curlPost($url, $post = array(), $timeout = 5, $header = array()) {
    $ch       = curl_init();

    curl_setopt($ch, CURLOPT_URL, $url);
    if (!empty($header)) {
    	curl_setopt ($ch, CURLOPT_HTTPHEADER , $header );  //构造header
    }
    
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
    curl_setopt($ch, CURLOPT_TIMEOUT, $timeout);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $post);

    $response = curl_exec($ch);
    curl_close($ch);

    return $response;
}


/**
 * 使用file_get_contents发送http消息，同时获取返回结果
 * 默认超时时间15秒
 *
 *
 * @param String $url
 * @param Array $post    post表单内容
 * @param String $timeout
 *
 * @return mix
 */
function request($url, $post = "", $timeout = 15) {
    $context = array();
    if (is_array($post)) {
        $post = requestData($post);
    }

    $context["http"] = array("timeout"=>$timeout, "method"=>"POST",
                             "header"=>"Content-Type: application/x-www-form-urlencoded\r\n"."Content-Length: ".strlen($post)."\r\n"."Connection: Close\r\n"."Cache-Control: no-cache\r\n", "content"=>$post);

    return file_get_contents($url, false, stream_context_create($context));
}


/**
 * 将post表单数据格式数据转换为get方式的数据参数
 *
 * @param Array $arg
 */
function requestData($arg = "") {
    $s = $sep = "";
    foreach ($arg as $k=>$v) {
        $k = urlencode($k);
        if (is_array($v)) {
            $s2 = $sep2 = "";
            foreach ($v as $k2=>$v2) {
                $k2   = urlencode($k2);
                $s2  .= "$sep2{$k}[$k2]=".urlencode(stripslashesDeep($v2));
                $sep2 = "&";
            }
            $s .= $sep.$s2;
        } else {
            $s .= "$sep$k=".urlencode(stripslashesDeep($v));
        }
        $sep = "&";
    }

    return $s;
}


/**
 * 创建一个IN查询条件，方便使用
 *
 * @param Array $itemList    数据列表
 * @param String $fieldName 字段名称
 */
function createIN($itemList, $fieldName = "") {
    if (empty($itemList)) {
        return $fieldName." IN ('') ";
    } else {
        if (!is_array($itemList)) {
            $itemList   = explode(",", $itemList);
        }
        $itemListTmp    = "";
        $itemList       = array_unique($itemList);
        foreach ($itemList as $item) {
            if ($item !== "") {
                $itemListTmp .= $itemListTmp?",'$item'":"'$item'";
            }
        }

        if (empty($itemListTmp)) {
            return $fieldName." IN ('') ";
        } else {
            return $fieldName." IN (".$itemListTmp.") ";
        }
    }
}


function echoFlush($str) {
    echo str_repeat(" ", 4096);
    echo $str;
}


/**
 * utf8字符转Unicode字符
 *
 * @param string $char 要转换的单字符
 * @return void
 */
function utf8ToUnicodeA($char) {
    switch (strlen($char)) {
        case 1:
            return ord($char);
        case 2:
            $n  = (ord($char[0]) & 0x3f) << 6;
            $n += ord($char[1]) & 0x3f;
            return $n;
        case 3:
            $n  = (ord($char[0]) & 0x1f) << 12;
            $n += (ord($char[1]) & 0x3f) << 6;
            $n += ord($char[2]) & 0x3f;
            return $n;
        case 4:
            $n  = (ord($char[0]) & 0x0f) << 18;
            $n += (ord($char[1]) & 0x3f) << 12;
            $n += (ord($char[2]) & 0x3f) << 6;
            $n += ord($char[3]) & 0x3f;
            return $n;
    }
}


/**
 * utf8字符串分隔为unicode字符串
 * @param string $str 要转换的字符串
 * @param string $pre
 * @return string
 */
function segmentToUnicodeA($str, $pre = "") {
    $strLength = mb_strlen($str, "UTF-8");

    $arr = array();
    for ($i = 0; $i < $strLength; $i++) {
        $s = mb_substr($str, $i, 1, "UTF-8");
        if ($s != " " && $s != "　") {
            $arr[] = $pre."ux".utf8ToUnicodeA($s);
        }
    }
    $arr = array_unique($arr);

    return implode(" ", $arr);
}


/**
 * 清除符号表中定义的特殊符号，将所有的特殊字符全部替换为空
 *
 * @param string $str 要清除符号的字符串
 * @return string
 */
function clearSymbolA($str) {
    static $symbols = NULL;
    if ($symbols === NULL) {
        $symbols = file_get_contents(__PUBLIC__."table/symbol.table");
        $symbols = explode("\r\n", $symbols);
    }

    return str_replace($symbols, "", $str);
}

/* 递归调用addslashes，为字符串中的'或者"等加上反斜线转义 */
function new_addslashes($string)
{
	if(get_magic_quotes_gpc()) 
	{
		return $string;
	} 
	else 
	{
		if(!is_array($string)) return addslashes($string);
		foreach($string as $key => $val) $string[$key] = new_addslashes($val);
		return $string;
	}
}

/* 递归调用htmlspecialchars，防止xss攻击 */
function new_html_special_chars($string) 
{
	if(!is_array($string)) return htmlspecialchars($string);
	foreach($string as $key => $val) $string[$key] = new_html_special_chars($val);
	return $string;
}

/* 日志函数 */
function write_log($content)
{  
    $path = C('APP_LOG_PATH')."game_cloud.".date("Y-m-d").".log";
    $prefix = "[".date("Y-m-d H:i:s")."] ";
   
    $content = $prefix.$content."\n";
    error_log($content, 3, $path);
}