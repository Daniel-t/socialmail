
this.sm_genGravatarURL=function sm_genGravatarURL(email){
	$path="http://www.gravatar.com/avatar/";
	$hash=this.MD5.MD5(email);
	
	$size="s=100";
	$default="d="+sm_prefManager.getCharPref("extensions.socialmail.gravatarDefault");
	
	$url=$path+$hash+"?"+$size+"&"+$default;
	
	return($url);
}