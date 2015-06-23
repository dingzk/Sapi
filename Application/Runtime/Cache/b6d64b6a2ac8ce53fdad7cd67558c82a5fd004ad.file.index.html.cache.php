<?php /* Smarty version Smarty-3.1.6, created on 2015-06-03 14:46:52
         compiled from "./Application/Api/View\Images\index.html" */ ?>
<?php /*%%SmartyHeaderCode:29862551ccd274bf545-63389973%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    'b6d64b6a2ac8ce53fdad7cd67558c82a5fd004ad' => 
    array (
      0 => './Application/Api/View\\Images\\index.html',
      1 => 1432520393,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '29862551ccd274bf545-63389973',
  'function' => 
  array (
  ),
  'cache_lifetime' => 3600,
  'version' => 'Smarty-3.1.6',
  'unifunc' => 'content_551ccd274e893',
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_551ccd274e893')) {function content_551ccd274e893($_smarty_tpl) {?><html>
<body>

<form action="http://127.0.0.1/tourpal/index.php/Api/Images/upload" method="post"
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