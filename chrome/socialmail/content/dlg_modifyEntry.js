if(!com) var com={};
if(!com.networklighthouse) com.networklighthouse={};
if(!com.networklighthouse.socailMail) com.networklighthouse.socialMail={};

com.networklighthouse.socialMail.dlg_modify =function(){
	subscriptLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);
	subscriptLoader.loadSubScript("chrome://socialmail/content/sm_storage.js",com.networklighthouse.socialMail);

	var me={};
	
	me.loadWindow=function dlg_loadWindow(){
		//window.arguments
		emailAddr=window.arguments[0];
		task=window.arguments[1];
		type=window.arguments[2];
		data=window.arguments[3];
		
		//positioning
		window.screenX=window.opener.screenX+(window.opener.outerWidth)/2-(window.outerWidth)/2;
		window.screenY=window.opener.screenY+(window.opener.outerHeight)/2-(window.outerHeight)/2;
		
		switch(task){
		case "add":
			setDlgAdd(emailAddr,type,data);
			break;
		case "modify":
			setDlgModify(emailAddr,type,data);
			break;
		case "remove":
			setDlgRemove(emailAddr,type,data);
			break;
		}
	}
	
	function setDlgAdd(emailAddr,type,data){
		label="Add "+type+" to "+emailAddr;
		document.getElementById("dlg_label").value=label;
	}
	
	function setDlgModify(emailAddr,type,data){
		label="Change "+type+" on "+emailAddr;
		document.getElementById("dlg_label").value=label;
		document.getElementById("dlg_txt_input").value=data;
	}
	
	function setDlgRemove(emailAddr,type,data){
		label="Remove "+data+" from "+emailAddr;
		document.getElementById("dlg_label").value=label;
		document.getElementById("dlg_txt_input").hidden=true;
	}
	
	me.action=function(obj){
		emailAddr=window.arguments[0];
		task=window.arguments[1];
		type=window.arguments[2];
		orig_data=window.arguments[3];
		new_data=document.getElementById("dlg_txt_input").value;
		
		switch(task){
		case "add":
			actionAdd(type,emailAddr,orig_data,new_data);
			break;
		case "modify":
			actionModify(type,emailAddr,orig_data,new_data);
			break;
		case "remove":
			actionRemove(type,emailAddr,orig_data,new_data);
			break;
		}
		if (emailAddr==window.opener.document.getElementById("sm_name").getAttribute("email")){
			window.opener.com.networklighthouse.socialMail.sm_updateDisplay(emailAddr);
		}
	}
	
	function actionAdd(type,emailAddr,orig_data,new_data){
		switch(type){
		case "phone":
			com.networklighthouse.socialMail.smDB.addNumber(emailAddr,new_data);
			break;
		case "url":
			com.networklighthouse.socialMail.smDB.addURL(emailAddr,new_data);
			break;
		}
	}
	
	function actionModify(type,emailAddr,orig_data,new_data){
		switch(type){
		case "phone":
			com.networklighthouse.socialMail.smDB.modifyNumber(emailAddr,orig_data,new_data);
			break;
		case "url":
			com.networklighthouse.socialMail.smDB.modifyURL(emailAddr,orig_data,new_data);
			break;
		}
	}
	
	function actionRemove(type,emailAddr,orig_data,new_data){
		switch(type){
		case "phone":
			com.networklighthouse.socialMail.smDB.deleteNumber(emailAddr,orig_data);
			break;
		case "url":
			com.networklighthouse.socialMail.smDB.deleteURL(emailAddr,orig_data);
			break;
		}
	}
	
	return me;
}()