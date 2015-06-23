<?php

date_default_timezone_set('PRC');

error_reporting(E_ERROR);
set_time_limit(20000);

/**
 * ��ݿ�����
 */
function getConnect($host, $user, $passwd, $db) {
    $link = mysql_connect( $host, $user, $passwd ) or die('Could not connect: ' . mysql_error());
    mysql_select_db($db, $link) or die('Could not select database');
    mysql_query("SET NAMES UTF8");
    return $link;
}

/**
 * ִ��sql
 */
function query($sql, $link) {
    $result = mysql_query($sql, $link);
    return $result;
}

/**
 * ��ȡһ�н��
 */
function getRow($sql, $link, $type = MYSQL_ASSOC) {
    $result = query($sql, $link);
    return @ mysql_fetch_array($result, $type);
}

/**
 * ��ȡ����
 */
function getRows($sql, $link, $type = MYSQL_ASSOC) {
    $rows   = array();
    $result = query($sql, $link);
    while ($row = @ mysql_fetch_array($result, $type)) {
        $rows[] = $row;
    }
    return $rows;
}

/**
 * �ر�����
 */
function closeMysql($link) {
    mysql_close($link);
}

/**
 * �ҵ��������id
 * @return number
 */
function getLastInsertId() {
    return mysql_insert_id();
}

// �������������

/**
 * ���ͱ�����Ϣ
 * @param String $message
 */
function sendMessage($title, $content, $groupName = 'dingzhenkai') {
//     $subject = iconv("utf8", "gbk", $title);
    $title = urlencode($title);
    $subject = $title;
    $url = "http://alarms.ops.qihoo.net:8360/intfs/alarm_intf?group_name=$groupName&subject=$subject&content=$content";
    $res = file_get_contents($url);
    return;
}

/**
 * ��¼��־
 * @param String $filename
 * @param String $content
 * @param string $info
 */
function writeLog($filename, $content, $info = "INFO") {
    date_default_timezone_set('PRC');
    $c  = "[".date("Y-m-d H:i:s", time())."] [" . $info ."] " . $content.PHP_EOL;
    file_put_contents($filename, $c, FILE_APPEND);
    return;
}

/**
 * ������Ѻõı������
 */
function dump($var, $echo = true, $label = null, $strict = true) {
    $label = ($label === null)?'':rtrim($label) . ' ';
    if (!$strict) {
        if (ini_get('html_errors')) {
            $output = print_r($var, true);
            $output = "<pre>" . $label . htmlspecialchars($output, ENT_QUOTES) . "</pre>";
        } else {
            $output = $label . print_r($var, true);
        }
    } else {
        ob_start();
        var_dump($var);
        $output = ob_get_clean();
        if (!extension_loaded('xdebug')) {
            $output = preg_replace('/\]\=\>\n(\s+)/m', "] => ", $output);
            $output = '<pre>' . $label . htmlspecialchars($output, ENT_QUOTES) . '</pre>';
        }
    }
    if ($echo) {
        echo ($output);
        return null;
    } else
        return $output;
}

/**
 * �������json��������⣬��ʾ��
 *
 * @param unknown $data
 * @return string
 */
function json_encode_ex($data) {
    $data = urlencode_arr($data);
    $str = json_encode($data);
    return urldecode($str);
}

function urlencode_arr($data) {
    foreach ($data as &$val) {
        if (is_array($val)) {
            $val = urlencode_arr($val);
        } elseif (is_string($val)) {
            $val = urlencode($val);
        }
    }
    return $data;
}

function httpPost($url, $data = array()) {
	$curl 			= curl_init ( $url );
	curl_setopt ( $curl, CURLOPT_RETURNTRANSFER, 1 );
	curl_setopt ( $curl, CURLOPT_BINARYTRANSFER, 1 );
	curl_setopt ( $curl, CURLOPT_POST, 1 );
	curl_setopt ( $curl, CURLOPT_CONNECTTIMEOUT, 60 );
	curl_setopt ( $curl, CURLOPT_TIMEOUT, 60 );
	curl_setopt ( $curl, CURLOPT_POSTFIELDS, $data );
	$curl_version 	= curl_version ();
	if ($curl_version ['version_number'] >= 462850) {
		curl_setopt ( $curl, CURLOPT_CONNECTTIMEOUT_MS, 30000 );
		curl_setopt ( $curl, CURLOPT_NOSIGNAL, 1 );
	}
	// 通过代理访问接口需要在此处配置代理
	// curl_setopt($curl, CURLOPT_PROXY, '192.168.1.18:808');
	// 请求失败有3次重试机会
	$result 		= exeBySetTimes (3, $curl);
	curl_close($curl);
	// 		$this->debug("发送请求 post:{$data} return:{$result}");

	return $result;
}

function exeBySetTimes($count, $curl) {
	$result = curl_exec($curl);
	if (curl_errno($curl)) {
		if ($count > 0) {
			$count --;
			$result = exeBySetTimes($count, $curl);
		}
	}
	return $result;
}