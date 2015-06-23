<?php /*%%SmartyHeaderCode:1209355484376a5c6a4-71005112%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    'c3516c087e036b7a2a2b7bcc361ded0314702ab3' => 
    array (
      0 => './Application/Webview/View\\Index\\post.html',
      1 => 1430125470,
      2 => 'file',
    ),
    'eae92c57f4f864e5215efcbe7e6daf1ed8619a6c' => 
    array (
      0 => 'E:\\xampp\\htdocs\\tourpal\\Application\\Webview\\View\\Public\\base.html',
      1 => 1429178094,
      2 => 'file',
    ),
    '3a9b873e2939d23154315a44bb6cf25e3b32d600' => 
    array (
      0 => 'E:\\xampp\\htdocs\\tourpal\\Application\\Webview\\View\\Public\\header.html',
      1 => 1426233454,
      2 => 'file',
    ),
    '48e32331598daa0c3a2bc70635a567760cb1e0fe' => 
    array (
      0 => 'E:\\xampp\\htdocs\\tourpal\\Application\\Webview\\View\\Public\\footer.html',
      1 => 1425301041,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '1209355484376a5c6a4-71005112',
  'has_nocache_code' => false,
  'version' => 'Smarty-3.1.6',
  'unifunc' => 'content_55484376d3143',
  'cache_lifetime' => 3600,
),true); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_55484376d3143')) {function content_55484376d3143($_smarty_tpl) {?>                 				   
			   
               
<!DOCTYPE html>
<html lang="zh-cn">
<head>

            
<meta charset="UTF-8">
<title>找驴友</title>
<meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black" />
<meta name="format-detection" content="telephone=no" />
<meta name="description" content="" />
<meta name="keywords" content="" />
<link rel="stylesheet" href="/Public/webview/dist/tourpal/main.css" />
<script type="text/javascript" data-main="/Public/webview/entry/tourpal/main.js" src="/Public/webview/lib/require.js"></script>
</head>
<body>
	<div class="pages">
		<div class="page">
			
   <header class="bar bar-nav">
   		<nav>
        <span class="title">发帖</span>
        <button class="btn btn-negative pull-right btn-post">完成</button>
        <nav>
    </header>
    <div class="page-content">
    	<div class="page-post">
	    	<form class="input-group" id="post_form">
			  <div class="input-row">
			   <div class="pull-left">
				  	<em class="ico ico-dest"></em> 
				  	<span id="dest_list">
				    </span>
				</div>
			    <input type="text" placeholder="点此输入目的地" id="dest_selector" readonly="readonly" class="pull-right">
			    <input type="text" name="dest" data-check="checkDest" style="display:none;" class="mustneed">
			  </div>
			  <div class="input-row border-none">
			    <label><em class="ico ico-date"></em> 出发时间：</label>
			    <input type="text" placeholder="点此选择出发时间" id="date_selector" readonly="readonly" name="start_at" data-check="checkStart" class="mustneed">
			  </div>
			  <div class="input-row">
			    <label class="pl">旅行时间：</label>
			    <input type="number" placeholder="点此输入" name="days" data-check="checkDays" class="mustneed">天
			  </div>
			  <div class="input-row border-none">
			    <label><em class="ico ico-phone"></em> 微信：</label>
			    <input type="text" placeholder="至少输入一个联系方式" name="weixin" data-check="checkWeixin" class="needone">
			  </div>
			   <div class="input-row border-none">
			    <label class="pl">QQ：</label>
			    <input type="number" placeholder="点此输入" name="qq" data-check="checkQQ" class="needone">
			  </div>
			   <div class="input-row">
			    <label class="pl">手机：</label>
			    <input type="number" placeholder="点此输入" name="phone" data-check="checkPhone" class="needone">
			  </div>
			  <br>
			  <textarea placeholder="请详细描述旅途概要及相关旅伴，让更多朋友找到你" rows="4" name="content" data-check="checkContent" class="mustneed border-none" maxlength="150" ></textarea>
			   <div class="input-row position-switch">
			    <label style="width:100%"><em class="ico ico-positiondis"></em><em>点击显示我的位置</em></label>
			   	<input type="text" name="post_place" class="none">
			   </div>
			   <ul class="img-list">
			   		<li style="margin-right:0;">
			   			<label class="add-btn"></label>
			   			<em class="ico ico-addpic"></em>
			   		</li>
			   </ul> 
			</form>
		</div>
    </div>

		</div>
	</div>
    
</body>
</html><?php }} ?>