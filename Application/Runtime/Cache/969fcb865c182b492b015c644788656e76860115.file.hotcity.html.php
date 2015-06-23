<?php /* Smarty version Smarty-3.1.6, created on 2015-03-16 11:11:05
         compiled from "./Application/Webview/View\Index\hotcity.html" */ ?>
<?php /*%%SmartyHeaderCode:731554f9563385d183-44890534%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '969fcb865c182b492b015c644788656e76860115' => 
    array (
      0 => './Application/Webview/View\\Index\\hotcity.html',
      1 => 1426241182,
      2 => 'file',
    ),
    'eae92c57f4f864e5215efcbe7e6daf1ed8619a6c' => 
    array (
      0 => 'E:\\xampp\\htdocs\\tourpal\\Application\\Webview\\View\\Public\\base.html',
      1 => 1426241182,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '731554f9563385d183-44890534',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.6',
  'unifunc' => 'content_54f9563394e57',
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_54f9563394e57')) {function content_54f9563394e57($_smarty_tpl) {?>
<?php $_smarty_tpl->tpl_vars['debug'] = new Smarty_variable(true, null, 0);?>                                   
<?php $_smarty_tpl->tpl_vars['devPath'] = new Smarty_variable('/Public/webview/entry', null, 0);?>			   
<?php $_smarty_tpl->tpl_vars['distPath'] = new Smarty_variable('/Public/webview/dist', null, 0);?>               
<?php echo $_smarty_tpl->getSubTemplate ('../Public/header.html', $_smarty_tpl->cache_id, $_smarty_tpl->compile_id, null, null, array(), 0);?>

<body>
	<div class="pages">
		<div class="page">
			
    <header class="bar bar-nav">

      <nav>
        <span class="title">首页</span>
        <a class="ico ico-person pull-right" href="mycard" data-rel="link"></a>
        <a class="ico ico-message pull-right"  href="message" data-rel="link"><em class="new-message none"></em></a>
      </nav>
    </header>
    <div class="page-content">
       <br/>
       <form class="input-group ">
          <div class="input-row button-line">
            <label>城市</label>
            <input id="city_selector" type="text" class="name" placeholder="请选择城市" readonly="readonly" >
            <span class="icon icon-search" id="btn_search"></span>
            <div class="triangle-right-buttom"></div>
          </div>
        </form>
        <div class="hot-city">
           <h5><span>热门城市</span></h5>
           <ul class="hot-city-list">
           </ul>
        </div>
    </div>
    
      <script type="text/template" id="hot_city_tpl">
        {{each data as item}}
        <li>
            <a data-rel="link" href="postlist?city={{item.name}}"><img src="{{item.url}}" alt="{{item.name}}"></a>
            <span>{{item.name}}</span>
        </li>
        {{/each}}
      </script>
    

		</div>
	</div>
    <?php echo $_smarty_tpl->getSubTemplate ('../Public/footer.html', $_smarty_tpl->cache_id, $_smarty_tpl->compile_id, null, null, array(), 0);?>

</body>
<html><?php }} ?>