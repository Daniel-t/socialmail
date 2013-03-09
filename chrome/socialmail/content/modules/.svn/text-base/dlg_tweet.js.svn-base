if(!com) var com={};
if(!com.networklighthouse) com.networklighthouse={};
if(!com.networklighthouse.socialMail) com.networklighthouse.socialMail={};
if(!com.networklighthouse.socialMail.twitter) com.networklighthouse.socialMail.twitter={};

com.networklighthouse.socialMail.twitter.dlg_tweet =function(){

	var me={};
	
	me.twh=null;
	
	me.loadWindow=function dlg_loadWindow(){
		//window.arguments
		this.twh=window.arguments[0];
		var text=window.arguments[1];
		var tweet=window.arguments[2];
		var task=window.arguments[3];
		
		//positioning
		window.screenX=window.opener.screenX+(window.opener.outerWidth)/2-(window.outerWidth)/2;
		window.screenY=window.opener.screenY+(window.opener.outerHeight)/2-(window.outerHeight)/2;
		switch(task){
		default:
		case "tweet":
			setDlgTweet(text);
			break;
		case "retweet":
			setDlgRetweet(text);
			break;
		case "reply":
			setDlgReply(tweet);
			break;
		}
	}
	
	function setDlgTweet(text){
		label="TWEET";
		document.getElementById("dlg_label").value=label;
		document.getElementById("dlg_txt_input").value=text;
	}
	
	function setDlgRetweet(text){
		label="RETWEET";
		document.getElementById("dlg_label").value=label;
		document.getElementById("dlg_txt_input").value=text;
	}
	
	function setDlgReply(tweet){
		label="REPLY";
		document.getElementById("dlg_label").value=label;
		document.getElementById("dlg_replyBox").hidden=false;
		document.getElementById("dlg_desc").textContent=tweet.text;
	}
	
	me.action=function(obj){
		this.twh=window.arguments[0];
		tweet=window.arguments[2];
		task=window.arguments[3];
	
		text=document.getElementById("dlg_txt_input").value;
		
		switch(task){
		default:
		case "tweet":
		case "retweet":
			this.twh.statuses.update(twhCallback,
				twhFailedCallback,
		        task,
		        "json",
		        text,
		        null,
		        "SocialMail");
			break;
		case "reply":
			this.twh.statuses.update(twhCallback,
					twhFailedCallback,
			        task,
			        "json",
			        text,
			        tweet.id,
			        "SocialMail");
		}
	}
	
	function twhCallback(twh,answer,context){
		debugger;
	}
	
	function twhFailedCallback(twh,req,context){
		debugger;
	}
	
	return me;
}()