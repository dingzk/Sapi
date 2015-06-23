<?php
namespace Security\AES;
/**
 * aes加密解密，和c#/java对接
 * @author zhenkai.ding
 *
 */

class AES {
	
	const _IV  		= "\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0";	# str_repeat (chr(0x0),16)
	const _KEY 		= "8398603532015180";
	
	public static function AESEncrypt($input, $key = self::_KEY, $iv = self::_IV) {
		$size 	= mcrypt_get_block_size(MCRYPT_RIJNDAEL_128, MCRYPT_MODE_CBC);	# 128位，cbc模式, 生成blocksize
		$input 	= self::pkcs5Pad($input, $size);								# 填充 初始向量必须和blockzise一样长
		$data 	= mcrypt_encrypt(MCRYPT_RIJNDAEL_128, $key, $input, MCRYPT_MODE_CBC, $iv);
	
		$data 	= base64_encode($data);											# 结果使用base64编码
		return $data;
	}
	
	private static function pkcs5Pad ($text, $blocksize) {
		$pad = $blocksize - (strlen($text) % $blocksize);
		return $text . str_repeat(chr($pad), $pad);
	}
	
	public static function AESDecrypt($input, $key = self::_KEY, $iv = self::_IV) {
		$decrypted = mcrypt_decrypt(
				MCRYPT_RIJNDAEL_128,
				$key,
				base64_decode($input),
				MCRYPT_MODE_CBC,
				$iv
		);
		$decrypted = self::trimEnd($decrypted);
		
		return $decrypted;
	}
	
	public static function trimEnd($text){
		$len 	= strlen($text);
		$c 		= $text[$len-1];
		if(ord($c) <$len){
			for($i=$len-ord($c); $i<$len; $i++){
				if($text[$i] != $c){
					return $text;
				}
			}
			return substr($text, 0, $len-ord($c));
		}
		return $text;
	}
}

