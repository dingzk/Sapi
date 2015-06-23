<?php /* Smarty version Smarty-3.1.6, created on 2015-04-20 14:17:13
         compiled from "E:\xampp\htdocs\tourpal\Application\Mobile\View\Public\header.html" */ ?>
<?php /*%%SmartyHeaderCode:7458553499e9a510a9-37834079%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    'ee95671fce1fc55c2653e42ff7ee216e7f81ab04' => 
    array (
      0 => 'E:\\xampp\\htdocs\\tourpal\\Application\\Mobile\\View\\Public\\header.html',
      1 => 1429262956,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '7458553499e9a510a9-37834079',
  'function' => 
  array (
  ),
  'variables' => 
  array (
    'title' => 0,
    'distPath' => 0,
    'cssArr' => 0,
    'debug' => 0,
    'src' => 0,
    'devPath' => 0,
    'mainjs' => 0,
  ),
  'has_nocache_code' => false,
  'version' => 'Smarty-3.1.6',
  'unifunc' => 'content_553499e9aae5d',
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_553499e9aae5d')) {function content_553499e9aae5d($_smarty_tpl) {?><!DOCTYPE html>
<html lang="zh-cn">
<head>

    <?php $_smarty_tpl->tpl_vars['title'] = new Smarty_variable("艺龙驴友", null, 0);?>
    <?php $_smarty_tpl->tpl_vars['cssArr'] = new Smarty_variable(array("/tourpal/main"), null, 0);?>
    <?php $_smarty_tpl->tpl_vars['mainjs'] = new Smarty_variable("/tourpal/main", null, 0);?>

<meta charset="UTF-8">
<title><?php echo $_smarty_tpl->tpl_vars['title']->value;?>
</title>
<meta name="apple-mobile-app-status-bar-style" content="white" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0" />
<link rel="apple-touch-icon" href="<?php echo $_smarty_tpl->tpl_vars['distPath']->value;?>
/tourpal/imgs/icon.png" />
<link rel="apple-touch-startup-image" href="<?php echo $_smarty_tpl->tpl_vars['distPath']->value;?>
/tourpal/imgs/start.png" />
<meta name="format-detection" content="telephone=no" />
<meta name="description" content="" />
<meta name="keywords" content="" />
<?php  $_smarty_tpl->tpl_vars['src'] = new Smarty_Variable; $_smarty_tpl->tpl_vars['src']->_loop = false;
 $_from = $_smarty_tpl->tpl_vars['cssArr']->value; if (!is_array($_from) && !is_object($_from)) { settype($_from, 'array');}
foreach ($_from as $_smarty_tpl->tpl_vars['src']->key => $_smarty_tpl->tpl_vars['src']->value){
$_smarty_tpl->tpl_vars['src']->_loop = true;
?>
<?php if ($_smarty_tpl->tpl_vars['debug']->value){?>
<link rel="stylesheet" href="<?php echo $_smarty_tpl->tpl_vars['distPath']->value;?>
<?php echo $_smarty_tpl->tpl_vars['src']->value;?>
.css" />
<?php }else{ ?>
<link rel="stylesheet" href="<?php echo $_smarty_tpl->tpl_vars['distPath']->value;?>
<?php echo $_smarty_tpl->tpl_vars['src']->value;?>
.min.css" />
<?php }?>
<?php } ?>
<?php if ($_smarty_tpl->tpl_vars['debug']->value){?>
<script type="text/javascript" data-main="<?php echo $_smarty_tpl->tpl_vars['devPath']->value;?>
<?php echo $_smarty_tpl->tpl_vars['mainjs']->value;?>
.js" src="/Public/mobile/lib/require.js"></script>
<?php }else{ ?>
<script type="text/javascript" data-main="<?php echo $_smarty_tpl->tpl_vars['distPath']->value;?>
<?php echo $_smarty_tpl->tpl_vars['mainjs']->value;?>
.min.js" src="<?php echo $_smarty_tpl->tpl_vars['distPath']->value;?>
/require.min.js"></script>
<?php }?>
</head><?php }} ?>