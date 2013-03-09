/*SocialMail provider template notes
 * a provider must provide the following functions
 *   init(prefs)
 *   cleanup(socilMail)//reset display
 *   collect(socialMail,card)
 *   render(socialMail,card)
 *   updateStatus(msg)
 *   isUpdater=bool  //check if this module is good to send updates
 */

this.twitter=function(){
	Components.utils.import("resource://resources/twitterHelper.jsm"); 
	Components.utils.import("resource://resources/oauthTokenMgr.js");
	
	var me={};
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
	me.testConsumer=
	{ consumerKey   : "key"
		, consumerSecret: "secret"
		, accessToken: ""
		, accessTokenSecret: ""
		, serviceProvider:
		  { signatureMethod     : "HMAC-SHA1"
		  , requestTokenURL     : "http://term.ie/oauth/example/request_token.php"
		  , userAuthorizationURL: "http://twitter.com/oauth/authorize" // a stub
		  , accessTokenURL      : "http://twitter.com/oauth/access_token"
		  }
		};

	
	var twh=null;
	var prefs=null;
	me.lastTweet=null;
	me.authed=false;
	me.isUpdater=false;
	me.localUid=0;
	me.record=null; //the sn record
	me.card=null; //the sn record
	
	//XXX needs to be optioned
	me.init=function(smprefs){
		
		this.prefs=smprefs;
		//check for default pref prefHasUserValue
		enabled=this.prefs.getBoolPref("twitter.enabled");
		this.isUpdater=this.prefs.getBoolPref("twitter.updateStatus");
		
		oPrefs=this.prefs;
		oPrefs.QueryInterface(Components.interfaces.nsIPrefBranch2);
		oPrefs.addObserver("twitter",this,false);
		
		com.networklighthouse.socialMail.manageUpdater();
				
		if(enabled){
			var username=this.prefs.getCharPref("twitter.username");
			var pwdMgr=new oauthTokenMgr("twitter");
			keys=pwdMgr.retreive();
			this.twitterConsumer.accessToken=keys.token;
			this.twitterConsumer.accessTokenSecret=keys.secret;
			this.twh = new TwitterHelper(this.twitterConsumer,
		            null,
		            "twitter");
			this.twh.smTweet=this;
			this.localUid=username;
			this.validate();	
		} else {
			//document.getElementById("sm_twitterTab").hidden=true;
		}
	}
	
	me.cleanup=function(sm){
		//XXX sm.sm_clearBox("sm_tweetList");
		//XXX sm.sm_clearBox("sm_ftTweet");
	}
	
	me.collect=function(sm,card){
		//here we have a chance to do direct Twitter discovery
	}
	
	me.render=function(sm,card){
		debugger;
		//var tab=document.getElementById("sm_twitterTab");
		
		if (!enabled){
			return;
		}
		//tab.hidden=false;
		var rec=sm.getSNRecordForSite(card,"twitter.com");
		var url;
		if (rec==null){
			url=null;
		} else {
			url=rec.profile_url;
		}
		//tab=document.getElementById("sm_twitterTab");
		
		//XXX document.getElementById("sm_ftTweetBox").setAttribute("status","off");
		if(url!=null){
			//tab.setAttribute("disabled",false);
			regex=/twitter.com\/(.*)/
			//parse url to get twitter id
			var uid=regex.exec(url)[1];
			sm.twitter.record=rec;
			sm.twitter.card=card;
			sm.twitter.getTimeline(uid);
			sm.twitter.amFriendsWith(uid);
		} /* XXX else {
			tab.setAttribute("disabled",true);
			if (tab.getAttribute("selected")=="true"){
				document.getElementById("sm_tabbox").selectedIndex="0";
			}
			*
			
		}*/
	}
	
	me.updateStatus=function twitter_updateStatus(msg){
		if (this.prefs.getBoolPref("twitter.updateStatus")){
			this.twh.statuses.update(callback,
				errorCallback,
		        "updateStatus",
		        "json",
		        msg,
		        null,
		        "SocialMail");
		}
	}
	
	me.changeLogin=function(subject, data){
		//our job is to re-initialise the twitter object when user/pass changes
		if (data != "addLogin"){
			return;
	    }
		if (subject.httpRealm != "twitter"){
			return;
		}
		enabled=this.prefs.getBoolPref("twitter.enabled");
		if (enabled){
			//true
		//	document.getElementById("sm_twitterTab").hidden=false;
		} else {
			//false
			//tab=document.getElementById("sm_twitterTab");
			//tab.hidden=true;
			//if (tab.getAttribute("selected")){
			//	document.getElementById("sm_tabbox").selectedIndex="0";
			//}
			return;
		}
		var consumer=this.twitterConsumer;
		var pwdMgr=new oauthTokenMgr("twitter");
		var keys=pwdMgr.retreive();
		this.twitterConsumer.accessToken=keys.token;
		this.twitterConsumer.accessTokenSecret=keys.secret;
		this.twh = new TwitterHelper(consumer,
				null,
	   			"twitter");	
		this.localUid=this.prefs.getCharPref("twitter.username");
		this.twh.smTweet=this;
		this.validate();
	}
	
	me.observe=function(subject, topic, data){
		//our job is to re-initialise the twitter object when user/pass changes
		if (topic != "nsPref:changed"){
			return;
	    }
		enabled=this.prefs.getBoolPref("twitter.enabled");
		if (enabled){
			//true
			//	document.getElementById("sm_twitterTab").hidden=false;
		} else {
			//false
			//tab=document.getElementById("sm_twitterTab");
			//tab.hidden=true;
			//if (tab.getAttribute("selected")){
			//	document.getElementById("sm_tabbox").selectedIndex="0";
			//}
			return;
		}
		switch(data) {
	       case "twitter.enabled":
	    	   var consumer=this.twitterConsumer;
				var pwdMgr=new oauthTokenMgr("twitter");
				var keys=pwdMgr.retreive();
				this.twitterConsumer.accessToken=keys.token;
				this.twitterConsumer.accessTokenSecret=keys.secret;
	    	   this.twh = new TwitterHelper(consumer,
	    			null,
	    	   		"twitter");	
	    	   this.localUid=this.prefs.getCharPref("twitter.username");
	    	   this.twh.smTweet=this;
	    	   this.validate();
	         break;
	       case "twitter.updateStatus":
	    	   this.isUpdater=this.prefs.getBoolPref("twitter.updateStatus");
	    	   com.networklighthouse.socialMail.manageUpdater();
	     }
	}
	
	me.validate=function(){
		this.twh.account.verify_credentials(callback,
                errorCallback,
                "validate",
                "json");
	}
	
	me.amFriendsWith=function(person){
		this.twh.friendships.exists(callback,
                errorCallback,
                "amFriends",
                "json",
                this.localUid,
                person);
	}
	
	
	me.getTimeline=function(uid){
		this.twh.statuses.user_timeline(callback,
                errorCallback,
                "getTimeline",
                "json",
                uid,
                null,
                null,
                this.prefs.getIntPref("twitter.numTweets"),
                1);
		document.getElementById("sm_tw_follow").setUserData("uid",uid,null);
		
	}
	
	me.showSMAnnounce=function(){
		var helper=null;
		if (this.twh==null){
			helper = new TwitterHelper(this.twitterConsumer,
		            null,
		            "twitter");
		} else {
			helper=this.twh;
		}
		helper.statuses.user_timeline(callback,
                errorCallback,
                "smAnnounements",
                "json",
                "TB_SocialMail",
                null,
                null,
                1,
                1);
	}
	
	follow=function(person){
		this.twh.friendships.create(callback,
                errorCallback,
                "follow",
                "json",
                person);
	}
	
	function callback(helper,answer,context){
		switch(context){
		case "getTimeline":
			helper.smTweet._getTimeline(helper,answer);
			break;
		case "smAnnounements":
			helper.smTweet._smAnnounements(helper,answer);
			break;
		case "validate":
			helper.smTweet._validate(helper,answer);
			break;
		case "updateStatus":
		case "follow":
			//doNothing
			break;
		case "amFriends":
			helper.smTweet._amFriends(helper,answer);
			break;
		default:
			alert("Twitter Helper: Unknown Context -"+context);
		}
	}
	
	
	function errorCallback(helper,request,context){
		sm=com.networklighthouse.socialMail;
		switch(context){
		case "validate":
			helper.smTweet.authed=false;
			sm.ui.appendErrorMsg("Twitter Login failed.");
			break;
		case "getTimeline":
			helper.smTweet._e_getTimeline(helper,request);
			break;
		case "follow":
			sm.ui.appendErrorMsg("Twitter Follow failed.");
			break;
		case "updateStatus":
			sm.ui.appendErrorMsg("Twitter Update failed.");
			break;
		case "amFriends":
			//had an error, so we'll pretend that all is good
			sm.twitter._amFriends(helper,false);
			break;
		default:
			Application.console.log("SocialMail-Twitter Error Callback for "+context);
			debugger;
		}
	}

	me._getTimeline=function(helper,answer){
		var list=document.getElementById("sm_tweetList");
		var first=true;
		//var first=prefs.getBoolPref("twitter.frontTab");
		
		var record=helper.smTweet.record;
		var card=helper.smTweet.card;
		for (pos in answer){
			var tweet=answer[pos];	
			var attribs=new Array();
			attribs["context"]="sm_contextMenuTweet";
			attribs["image"]="chrome://socialmail/content/media/twitter16.png";
			attribs["userId"]=tweet.user.screen_name;
			attribs["tweet"]=tweet;
			com.networklighthouse.socialMail.addTimeEntry(tweet.text,tweet.created_at,attribs);
		}
		var tweet=answer[pos];
		//XXX document.getElementById("sm_tw_following").value=tweet.user.friends_count;
		//XXX document.getElementById("sm_tw_followers").value=tweet.user.followers_count;
		com.networklighthouse.socialMail.dlog("Twitter response:");
		com.networklighthouse.socialMail.dlog(answer);
		
		debugger;
		
		document.getElementById("sm_twitterPnlName").setAttribute("value",tweet.user.name);
		document.getElementById("sm_twitterPnlScreenName").setAttribute("value",tweet.user.screen_name);
		document.getElementById("sm_twitterPnlDesc").textContent=tweet.user.description;
		document.getElementById("sm_twitterPnlLocation").setAttribute("value",tweet.user.location);
		document.getElementById("sm_twitterPnlFollowers").setAttribute("value",tweet.user.followers_count);
		document.getElementById("sm_twitterPnlFriends").setAttribute("value",tweet.user.friends_count);
		document.getElementById("sm_twitterPnlURL").setAttribute("value",tweet.user.url);
		document.getElementById("sm_twitterURL").setAttribute("value","http://twitter.com/#!/"+tweet.user.screen_name);
		
		document.getElementById("sm_tw_follow").disabled=!( tweet.user.following==false && tweet.user.follow_request_sent==false);	
		
		var attribs=new Array();
		attribs["popup"]="sm_twitterPanel";
		        
		
		com.networklighthouse.socialMail.addSocialNet("twitter.com","http://twitter.com/#!/"+tweet.user.screen_name,attribs)
	}
	
	me._smAnnounements=function(helper,answer){
		
		var tweet=answer[0];
		var first=false;

		//trap option to display on ft
		var box=document.createElement("vbox");
		box.setAttribute("class","sm_tweetBox");
		box.setAttribute("maxwidth","200");
		
		/* XXX
		var desc=document.createElement("description");
		desc.textContent=tweet.text;
		desc.setAttribute("userId",tweet.user.screen_name);
		desc.sm_tweet=tweet;

		var dateLbl=document.createElement("label");
		dateLbl.setAttribute("class","tweetDate");
		dateLbl.setAttribute("value",tweet.created_at);
		box.appendChild(desc);
		box.appendChild(dateLbl);
		document.getElementById("sm_ftTweet").appendChild(box);
		document.getElementById("sm_ftTweetBox").setAttribute("status","on");
		*/
		var attribs=new Array();
		attribs["context"]="sm_contextMenuTweet";
		attribs["image"]="chrome://socialmail/content/media/twitter16.png";
		attribs["tweet"]=tweet;
		com.networklighthouse.socialMail.addTimeEntry(tweet.text,tweet.created_at,attribs);
	}
	
	me._e_getTimeline=function(helper,request){
		list=document.getElementById("sm_tweetList");
		
		item=document.createElement("listitem");
		box=document.createElement("box");
		item.setAttribute("class","sm_tweetBox errorParent");
		box.setAttribute("orient","vertical");
		
		desc=document.createElement("description");
		desc.textContent="Twitter access denied for this user.  This may be "+
						 "because they are configured to be private or your "+
						 "twitter credentials are wrong.";
	
		//desc.appendChild(text);
		box.appendChild(desc);
		item.appendChild(box);
		
		list.appendChild(item);
		document.getElementById("sm_tw_following").value="?";
		document.getElementById("sm_tw_followers").value="?";
	}

	me._validate=function(helper,answer){
		helper.smTweet.authed=true;
	}
	
	me._amFriends=function(helper,answer){
		document.getElementById("sm_tw_follow").disabled=answer;
	}
	
	me.ui={};
	me.ui.actuators={};
	
	me.ui.retweet=function(obj){
		var smui=com.networklighthouse.socialMail.ui;
		var text="RT @";
		text+=obj.getAttribute("userId")+" ";
		text+=obj.value;
		//var tweet=smui.getObject(obj,"sm_tweet");
		var tweet=JSON.parse(obj.getAttribute("tweet"));
		
		//get the description text
		this.actuators.openTweetWindow(text,tweet,"retweet");
	}
	
	me.ui.tweet=function(obj){
		var text="";
		//get the description text
		//var tweet=obj.sm_tweet;
		var tweet=JSON.parse(obj.getAttribute("tweet"));
		this.actuators.openTweetWindow(text,tweet,"tweet");
	}

	me.ui.reply=function(obj){
		var text="";
		var smui=com.networklighthouse.socialMail.ui;
		//get the description text
		//var tweet=obj.value;
		var tweet=JSON.parse(obj.getAttribute("tweet"));
		var text=obj.value;
		this.actuators.openTweetWindow(text,tweet,"reply");
	}
	
	me.ui.followContact=function(){
		uid=document.getElementById("sm_twitterPnlScreenName").value;
		follow(uid);
		document.getElementById("sm_tw_follow").disabled=true;
	}

	me.ui.requestOAuthToken=function(){
		var consumer=com.networklighthouse.socialMail.twitter.twitterConsumer;
		var callback=function(url){com.networklighthouse.socialMail.launchURL(url)};
		TwitterHelper.getAuthUrl(consumer,callback);
	}
	
	me.ui.requestOAuthAccess=function(){
		var consumer=com.networklighthouse.socialMail.twitter.twitterConsumer;
		var oauth_verifier=document.getElementById("sm_tw_oathPin").value;
		var prefs=com.networklighthouse.socialMail.twitter.prefs;
		var callback=function(consumer,screen_name){
			prefs.setCharPref("twitter.username",screen_name);
			prefs.setCharPref("twitter.accessToken",consumer.accessToken);
			prefs.setCharPref("twitter.accessTokenSecret",consumer.accessTokenSecret);
			//consumer is complete, save the accesstoken and secret
			//XXX screen_name
		};
		TwitterHelper.getAccessToken(consumer,oauth_verifier,callback);
	}
	
	
	me.ui.actuators.openTweetWindow=function(text,tweet,task){
		openDialog("chrome://socialMail/content/modules/dlg_tweet.xul","sm_tweetDlg","",com.networklighthouse.socialMail.twitter.twh,text,tweet,task);
	}
	
	return me;
}()


this.modules.push(this.twitter);
this.handlers["twitter.com"]=true;