<?php

date_default_timezone_set('PRC');

error_reporting(E_ERROR);
set_time_limit(20000);

/**
 * 连接数据库
 */
function getConnect($host, $user, $passwd, $db) {
    $link = mysql_connect( $host, $user, $passwd ) or die('Could not connect: ' . mysql_error());
    mysql_select_db($db, $link) or die('Could not select database');
    mysql_query("SET NAMES UTF8");
    return $link;
}

/**
 *执行sql,这里需要修改为mysqli来处理
 */
function query($sql, $link) {
    $result = mysql_query($sql, $link);
    return $result;
}

/**
 * 获取一行记录
 */
function getRow($sql, $link, $type = MYSQL_ASSOC) {
    $result = query($sql, $link);
    return @ mysql_fetch_array($result, $type);
}

/**
 * 获取多行记录
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
 * 关闭数据库
 */
function closeMysql($link) {
    mysql_close($link);
}

/**
 * 获取最后一个插入的id
 * @return number
 */
function getLastInsertId() {
    return mysql_insert_id();
}

/**
 * 写入日志־
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
 * 打印出来
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
