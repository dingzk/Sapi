<?php
namespace Cache\Redis;

use Think\Log;

/**
 * redis相关的操作, 支持 Master/Slave 的负载集群
 * 
 * @author zhenkai.ding
 * 
 */
class Redis {
	
	private $_deploy; 					# 是否是读写分离
    private $options = array();			# 缓存连接参数
	
	private $_linkHandler = null; 		# 当前连接的标识符
	private $linkHandler = array ();	# 相关链接
	
	public function __construct($options = array()) {
		if ( !extension_loaded('redis') ) {
			E(L('_NOT_SUPPORT_').':redis');
		}
		
		$this->_deploy = C('REDIS_DEPLOY_TYPE') ? C('REDIS_DEPLOY_TYPE') : 1; # redis分布式
		
		if(empty($options)) {
			$options = array (
					'host'          => C('REDIS_HOST') ? C('REDIS_HOST') : '127.0.0.1',
					'port'          => C('REDIS_PORT') ? C('REDIS_PORT') : '6379',
					'timeout'       => C('REDIS_TIMEOUT') ? C('REDIS_TIMEOUT') : false,
					'persistent'    => C('P_CONNECT') ? C('P_CONNECT') : false,
			);
		}
		$this->options =  $options;
		
	}
	
	/**
	 * 初始化数据库连接
	 * @access protected
	 * @param boolean $master 主服务器
	 * @return void
	 */
	protected function initConnect($master=true) {
		if(!empty($this->_deploy))
			// 采用分布式redis
			$this->_linkHandler = $this->multiConnect($master);
		else {
			// 默认单redis
			if ( !$this->_linkHandler ) $this->_linkHandler = $this->connect();
		}
	}
	
	/**
	 * 连接分布式redis服务器
	 * @access protected
	 * @param boolean $master 主服务器
	 * @return void
	 */
	private function multiConnect($master = FALSE) {
		$_config                = array();
		$hosts 			    	= explode(',',$this->options['host']);
		$_config['host']        = array_map('trim', $hosts);
		$posts               	= explode(',',$this->options['port']);
		$_config['port']        = array_map('trim', $posts);
		$_config['timeout']    	= $this->options['timeout'];
		$_config['persistent']  = $this->options['persistent'];
		if ($master) {
			$no = 0;
		} else {
			$no = floor(mt_rand(0,count($_config['host'])-1));   // 每次随机连接的数据库
		}
		$redis_config = array(
				'host'  		=>  isset($_config['host'][$no])?$_config['host'][$no]:$_config['host'][0],
				'port'  		=>  isset($_config['port'][$no])?$_config['port'][$no]:$_config['port'][0],
				'timeout'       =>  $_config['timeout'],
				'persistent'   	=>  $_config['persistent'],
		);
		Log::write('Redis connect host:'.$redis_config['host'].' port:'.$redis_config['port'].' no:'.$no);
		
		return $this->connect($redis_config, $no);
	}
	
	/**
	 * 连接redis方法
	 * @access protected
	 */
	protected function connect($config = array(), $linkNum = 0) {
		if (empty($config)) {
			$config = $this->options;
		}
		if (!isset($this->linkHandler[$linkNum])) {
			$this->linkHandler[$linkNum] = new \Redis ();
			$func = $config ['persistent'] ? 'pconnect' : 'connect';
			try {
				$config ['timeout'] === false ? $this->linkHandler[$linkNum]->$func ( $config ['host'], $config ['port'] ) : $this->linkHandler[$linkNum]->$func ( $config ['host'], $config ['port'], $config ['timeout'] );
			} catch (\Exception $e) {
				Log::write('getInstance of Redis error !' . $e->getMessage());
    		}
		}

		return $this->linkHandler[$linkNum];
	}
	
	/**
	 * string 类型 set
	 * @access public
	 */
	public function set($key, $value, $expire = 0) {
		$this->initConnect(true);
		if ($expire == 0) {
			$result = $this->_linkHandler->set ( $key, $value );
		} else {
			$result = $this->_linkHandler->setex ( $key, $expire, $value );
		}
		
		return $result;
	}
	
	/**
	 * string 类型 get
	 * @access public
	 */
	public function get($key) {
		$this->initConnect(false);
		$func = is_array ( $key ) ? 'mGet' : 'get';
		
		return $this->_linkHandler->{$func}($key);
	}
	
	/**
	 * 批量设置hash
	 * @access public
	 */
	public function hmset($key, $arr) {
		$this->initConnect(true);
		$result = '';
		if ($arr) {
			$result = $this->_linkHandler->hmset($key, $arr);
		}
		
		return $result;
	}
	
	/**
	 * 获取一个hash key
	 * @access public
	 */
	public function hgetall($key) {
		$this->initConnect(false);
		
		return $this->_linkHandler->hgetall($key);
	}
	
	
}