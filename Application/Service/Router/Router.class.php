<?php
namespace Router\Router;


/**
 * 路由模块,把方法映射到基础服务类
 * @author zhenkai.ding
 * @date 2015/3/4
 */

class Router{
	
	const SERVICE_MODULE = 'Service';	# 公共服务的数据逻辑模块
	
	/**
	 * 应用程序初始化
	 * @access public
	 * @return void
	 */
	
	static public function init() {
		
	}
	
	/**
	 * 运行应用实例 入口文件使用的快捷方法使用自动获取的控制器和方法名称
	 * @access public
	 * @return void
	 */
	
	static public function run() {
		
		$args = func_get_args();
		
		return self::exec(CONTROLLER_NAME, ACTION_NAME, $args);
		
	}
	
	
	/**
	 * 执行应用程序
	 * @access public
	 * @return void
	 */
	
	static public function exec($controllerName, $action, array $args = array()) {
		
		$returnValue 	= '';
		//创建控制器实例(知道为什么这里反射参数使用的是对象名而不是类名吗?)
		$module 		= A(self::SERVICE_MODULE."/".$controllerName);
		
		try{
			if(!preg_match('/^[A-Za-z](\w)*$/', $action)){
				// 非法操作
				throw new \ReflectionException();
			}
			//执行当前操作
			$method 	=   new \ReflectionMethod($module, $action);
			if($method->isPublic() && !$method->isStatic()) {
				$class  =   new \ReflectionClass($module);
				// URL参数绑定检测
				if($method->getNumberOfParameters()>0){
					$params =  $method->getParameters();
					
					$args 	= array_values($args); //去掉键值对应
					foreach ($params as $k => $param){
						$name = $param->getName();
						if (isset($args[$k])) {
							$vars[] = $args[$k];
						} elseif ($param->isDefaultValueAvailable()) {
							$vars[] = $param->getDefaultValue();
						} else {
							E(L('_PARAM_ERROR_').':'.$name);
						}
					}
					array_walk_recursive($vars, 'think_filter');
					$returnValue = $method->invokeArgs($module, $vars);
				} else {
					$returnValue = $method->invoke($module);
				}
			}else{
				// 操作方法不是Public 抛出异常
				throw new \ReflectionException();
			}
		} catch (\ReflectionException $e) {
			// 方法调用发生异常后 引导到__call方法处理
			$method 		= new \ReflectionMethod($module,'__call');
			$returnValue 	= $method->invokeArgs($module,array($action,''));
		}
		return $returnValue;
	}
}