<?php /* Smarty version Smarty-3.1.6, created on 2015-03-16 11:11:17
         compiled from "./Application/Webview/View\Index\post.html" */ ?>
<?php /*%%SmartyHeaderCode:5119550649d54e7c57-49932122%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    'c3516c087e036b7a2a2b7bcc361ded0314702ab3' => 
    array (
      0 => './Application/Webview/View\\Index\\post.html',
      1 => 1426233454,
      2 => 'file',
    ),
    'eae92c57f4f864e5215efcbe7e6daf1ed8619a6c' => 
    array (
      0 => 'E:\\xampp\\htdocs\\tourpal\\Application\\Webview\\View\\Public\\base.html',
      1 => 1426241182,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '5119550649d54e7c57-49932122',
  'function' => 
  array (
  ),
  'has_nocache_code' => false,
  'version' => 'Smarty-3.1.6',
  'unifunc' => 'content_550649d555ba2',
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_550649d555ba2')) {function content_550649d555ba2($_smarty_tpl) {?>
<?php $_smarty_tpl->tpl_vars['debug'] = new Smarty_variable(true, null, 0);?>                                   
<?php $_smarty_tpl->tpl_vars['devPath'] = new Smarty_variable('/Public/webview/entry', null, 0);?>			   
<?php $_smarty_tpl->tpl_vars['distPath'] = new Smarty_variable('/Public/webview/dist', null, 0);?>               
<?php echo $_smarty_tpl->getSubTemplate ('../Public/header.html', $_smarty_tpl->cache_id, $_smarty_tpl->compile_id, null, null, array(), 0);?>

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
			    <label><em class="ico ico-dest"></em> 目的地：</label>
			    <input type="text" placeholder="点此输入" id="dest_selector" readonly="readonly" name="dest" data-check="checkDest" class="mustneed">
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
			  <textarea placeholder="请详细描述旅途概要及相关旅伴，让更多朋友找到你" rows="4" name="content" data-check="checkContent" class="mustneed" maxlength="150"></textarea>
			   <ul class="img-list">
			   		<li>
			   			<label class="add-btn"></label>
			   			<em class="ico ico-addpic"></em>
			   		</li>
			   </ul>
			  </div>  
			</form>
		</div>
    </div>

		</div>
	</div>
    <?php echo $_smarty_tpl->getSubTemplate ('../Public/footer.html', $_smarty_tpl->cache_id, $_smarty_tpl->compile_id, null, null, array(), 0);?>

</body>
<html><?php }} ?>