<?php

namespace Security\DES;

/**
 * des加密解密，和java对接
 * 
 * @author zhenkai.ding
 *        
 */

class DES {
	
	const _IV  		= "12345678";	# str_repeat (chr(0x0),16)
	const _KEY 		= "e67fa90a";
	
	/**
	 * DES加密
	 */
	public static function DESEncrypt($str) {
		$size = mcrypt_get_block_size ( MCRYPT_DES, MCRYPT_MODE_CBC );
		$str  = self::pkcs5Pad ( $str, $size );
		$data = mcrypt_encrypt ( MCRYPT_DES, self::_KEY, $str, MCRYPT_MODE_CBC, self::_IV );
		return base64_encode ( $data );
	}
	
	/**
	 * DES解密
	 */
	public static function DESDecrypt($str) {
		$str = base64_decode ( $str );
		$str = mcrypt_decrypt ( MCRYPT_DES, self::_KEY, $str, MCRYPT_MODE_CBC, self::_IV );
		$str = self::pkcs5Unpad ( $str );
		return $str;
	}
	
	/**
	 * pkcs5填充
	 * 
	 * @param string $text        	
	 * @param int $blocksize        	
	 * @return string
	 */
	private static function pkcs5Pad($text, $blocksize) {
		$pad = $blocksize - (strlen ( $text ) % $blocksize);
		return $text . str_repeat ( chr ( $pad ), $pad );
	}
	
	/**
	 * pkcs5解包
	 * 
	 * @param string $text        	
	 * @return boolean|string
	 */
	private static function pkcs5Unpad($text) {
		$pad = ord ( $text {strlen ( $text ) - 1} );
		if ($pad > strlen ( $text ))
			return false;
		if (strspn ( $text, chr ( $pad ), strlen ( $text ) - $pad ) != $pad)
			return false;
		return substr ( $text, 0, - 1 * $pad );
	}
	
}
?>