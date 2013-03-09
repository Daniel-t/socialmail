if(!com) var com={};
if(!com.networklighthouse) com.networklighthouse={};
if(!com.networklighthouse.socialMail) com.networklighthouse.socialMail={};

com.networklighthouse.socialMail.twitterPrefs=function(){
	Components.utils.import("resource://resources/twitterHelper.jsm"); 
	Components.utils.import("resource://resources/oauthTokenMgr.js"); 

	var me ={};
	
	me.twitterConsumer = { 
		//get these from twitter when you register your app
		consumerKey   : "L4MI3m3Fqa5ubBh4gCTQ"
		, consumerSecret: "as9k95fJ6fdgQoWYQlJm0mVazvURiZbcMbTV4vER3w"
		//these generated during the OAuth Access Token cycle 
		, accessToken: ""
		, accessTokenSecret: ""
		, serviceProvider:{
			 	signatureMethod     : "HMAC-SHA1"
			  , requestTokenURL     : "http://twitter.com/oauth/request_token"
			  , userAuthorizationURL: "http://twitter.com/oauth/authorize" // a stub
			  , accessTokenURL      : "http://twitter.com/oauth/access_token"
		  }
	};
	
	me.requestOAuthToken=function(){
		var consumer=com.networklighthouse.socialMail.twitterPrefs.twitterConsumer;
		var callback=function(url){Components.classes["@mozilla.org/messenger;1"]
            .createInstance(Components.interfaces.nsIMessenger).launchExternalURL(url)};
		TwitterHelper.getAuthUrl(consumer,callback);
		document.getElementById("sm_tw_step2btn").disabled=false;
	}
	
	me.requestOAuthAccess=function(){
		var consumer=com.networklighthouse.socialMail.twitterPrefs.twitterConsumer;
		var oauth_verifier=document.getElementById("sm_tw_oathPin").value;
		var callback=function(consumer,screen_name){
			if (screen_name!=""){
				var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
				document.getElementById("sm_tw_username").value=screen_name;
				var pwdMgr=new oauthTokenMgr("twitter");
				pwdMgr.store(consumer.accessToken,consumer.accessTokenSecret);
				prefs.setCharPref("extensions.socialmail.twitter.username",screen_name);
				alert("Twitter Registration Succeeded");
			} else {
				alert("Twitter Registration Failed");
			}
			//consumer is complete, save the accesstoken and secret
			//XXX screen_name
		};
		TwitterHelper.getAccessToken(consumer,oauth_verifier,callback);
		document.getElementById("sm_tw_oathPin").value="";
		document.getElementById("sm_tw_step2btn").disabled=false;
	}
	
	return me;
}()