<?php /* Smarty version Smarty-3.1.6, created on 2015-04-20 14:17:13
         compiled from "./Application/Mobile/View\Index\hotcity.html" */ ?>
<?php /*%%SmartyHeaderCode:5380553499e998c322-18112572%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '4362ebb5325101c10ad9818546372c0f80d9d0ac' => 
    array (
      0 => './Application/Mobile/View\\Index\\hotcity.html',
      1 => 1429085810,
      2 => 'file',
    ),
    '743b5ff89cb56017827673f48b187f2cc9276a21' => 
    array (
      0 => 'E:\\xampp\\htdocs\\tourpal\\Application\\Mobile\\View\\Public\\base.html',
      1 => 1429178094,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '5380553499e998c322-18112572',
  'function' => 
  array (
  ),
  'has_nocache_code' => false,
  'version' => 'Smarty-3.1.6',
  'unifunc' => 'content_553499e9a45a7',
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_553499e9a45a7')) {function content_553499e9a45a7($_smarty_tpl) {?>
<?php $_smarty_tpl->tpl_vars['debug'] = new Smarty_variable(true, null, 0);?>                 				  
<?php $_smarty_tpl->tpl_vars['devPath'] = new Smarty_variable('/Public/mobile/entry', null, 0);?>			      
<?php $_smarty_tpl->tpl_vars['distPath'] = new Smarty_variable('/Public/mobile/dist', null, 0);?>               
<?php echo $_smarty_tpl->getSubTemplate ('../Public/header.html', $_smarty_tpl->cache_id, $_smarty_tpl->compile_id, 9999, null, array(), 0);?>

<body>
	<div class="pages">
		<div class="page">
			
    <header class="bar bar-nav">

      <nav>
        <span class="title pull-left" style="margin:0;">首页</span>
        <a class="ico ico-person pull-right" href="mycard" data-rel="link" needlogin="true"></a>
        <a class="ico ico-message pull-right"  href="message" data-rel="link" needlogin="true"><em class="new-message none"></em></a>
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
                <li>
                    <a data-rel="link" href="postlist?city=北京"><img src="http://pavo.elongstatic.com/i/tourpal_184x184/0000x3ZY.jpg" alt="北京"></a>
                    <span>北京</span>
                </li>
                
                <li>
                    <a data-rel="link" href="postlist?city=拉萨"><img src="http://pavo.elongstatic.com/i/tourpal_184x184/0000uw4P.jpg" alt="拉萨"></a>
                    <span>拉萨</span>
                </li>
                
                <li>
                    <a data-rel="link" href="postlist?city=丽江"><img src="http://pavo.elongstatic.com/i/tourpal_184x184/0000uw4Q.jpg" alt="丽江"></a>
                    <span>丽江</span>
                </li>
                
                <li>
                    <a data-rel="link" href="postlist?city=厦门"><img src="http://pavo.elongstatic.com/i/tourpal_184x184/0000wvay.jpg" alt="厦门"></a>
                    <span>厦门</span>
                </li>
            </ul>
        </div>
        <p class="feedback">
          <a class="" href="feedback" data-rel="link">意见反馈</a>
        </p>
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
    <?php echo $_smarty_tpl->getSubTemplate ('../Public/footer.html', $_smarty_tpl->cache_id, $_smarty_tpl->compile_id, 9999, null, array(), 0);?>

</body>
</html><?php }} ?>