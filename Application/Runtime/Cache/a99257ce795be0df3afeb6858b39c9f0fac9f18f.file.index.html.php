<?php /* Smarty version Smarty-3.1.6, created on 2015-03-10 20:27:59
         compiled from "./Application/Service/View\Images\index.html" */ ?>
<?php /*%%SmartyHeaderCode:2916854fee34f7e31e5-01014865%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    'a99257ce795be0df3afeb6858b39c9f0fac9f18f' => 
    array (
      0 => './Application/Service/View\\Images\\index.html',
      1 => 1425474288,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '2916854fee34f7e31e5-01014865',
  'function' => 
  array (
  ),
  'has_nocache_code' => false,
  'version' => 'Smarty-3.1.6',
  'unifunc' => 'content_54fee34f80b31',
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_54fee34f80b31')) {function content_54fee34f80b31($_smarty_tpl) {?><html>
<body>

<form action="http://127.0.0.1/tourpal/index.php/Service/Images/upload" method="post"
enctype="multipart/form-data">
<label for="file">Filename:</label>
<input type="file" name="file[]" id="file" /> 
<input type="file" name="file[]" id="file" /> 
<input type="file" name="file[]" id="file" /> 
<br />
<input type="submit" name="submit" value="Submit" />
</form>

</body>
</html><?php }} ?>