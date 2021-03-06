
if(!com) var com={};
if(!com.networklighthouse) com.networklighthouse={};

com.networklighthouse.socialMail =function(){
	var me={};
	me.className="com.networklighthosue.socialMail";
	
	// toolset
	if (Application.version >= 5.0){
		//TB 5 libraries
		Components.utils.import("resource:///modules/gloda/public.js");
		
	} else {
		//load TB3 libraries
		Components.utils.import("resource://app/modules/gloda/public.js");
	}
	Components.utils.import("resource:///modules/gloda/mimemsg.js");
	Components.utils.import("resource:///modules/MailUtils.js");

	var subscriptLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);

	me.SM_DEBUG=false;
	
	// global vars
	
	me.sm_ABName="SocialMail";
	me.sm_mailTAG="SMDONE-v0.07";
	me.sm_UID="{6b2d3127-cea1-431b-9e68-2b7c1c4192df}";
	
	// SM Addressbook
	me.sm_addressbook=null;
	
	// standard Addressbook
	me.addressBookURI="moz-abmdbdirectory://abook.mab";
	me.addressbook=null;
	
	me.modules=new Array();;
	me.handlers={};
	me.hasConversations=false;
	
	// XXX need to figure out how to load in sub files & objects... eg DB,
	// rapleaf
	subscriptLoader.loadSubScript("chrome://socialmail/content/sm_storage.js",me);
	subscriptLoader.loadSubScript("chrome://socialmail/content/emailGrabber.js",me);
	subscriptLoader.loadSubScript("chrome://socialmail/content/MD5.js",me);
	subscriptLoader.loadSubScript("chrome://socialmail/content/sm_gravatar.js",me);
	subscriptLoader.loadSubScript("chrome://socialmail/content/sm_interface.js",me);
	subscriptLoader.loadSubScript("chrome://socialmail/content/sm_freqgraph.js",me);

	subscriptLoader.loadSubScript("chrome://socialmail/content/modules/twitter.js",me);
	subscriptLoader.loadSubScript("chrome://socialmail/content/modules/emailTab.js",me);
	subscriptLoader.loadSubScript("chrome://socialmail/content/modules/addressBook.js",me);
	subscriptLoader.loadSubScript("chrome://socialmail/content/stringUtils.js",me);

	try {
		Components.utils.import("resource://conversations/hook.js");
		me.hasConversations = true;
	} catch (e) {
		me.hasConversations = false;
	}
	
	window.addEventListener("load", function(e) {com.networklighthouse.socialMail.socialMail_install(); }, false);
	
	me.sm_prefManager = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
	me.prefs = me.sm_prefManager.getBranch("extensions.socialmail.");
	
	me.dlog=function sm_dlog(msg){
		if (this.SM_DEBUG) {
			var dump=function mydump(arr,level) {
			    var dumped_text = "";
			    if(!level) level = 0;

			    var level_padding = "";
			    for(var j=0;j<level+1;j++) level_padding += "    ";

			    if(typeof(arr) == 'object') {  
			        for(var item in arr) {
			            var value = arr[item];

			            if(typeof(value) == 'object') { 
			                dumped_text += level_padding + "'" + item + "' ...\n";
			                dumped_text += dump(value,level+1);
			            } else {
			                dumped_text += level_padding + "'" + item + "' => \"" + value + "\"\n";
			            }
			        }
			    } else { 
			        dumped_text = "===>"+arr+"<===("+typeof(arr)+")";
			    }
			    return dumped_text;
			}

			if (typeof msg == 'object') msg=dump(msg);
			
			Application.console.log(msg);
		}
	}
	
	me.smAB_init=function smAB_init(){
	
		// XXX dodgy hack, manually created the addressbook
		// needs to be automated
		var abManager = Components.classes["@mozilla.org/abmanager;1"].getService(Components.interfaces.nsIAbManager);  
		
		// OLD WAY
		// sm_addressbook=abManager.getDirectory(sm_addressBookURI);
		this.addressbook=abManager.getDirectory(this.addressBookURI);
	
		// ask prefs for url
		var url=null;
		try{
			url=this.sm_prefManager.getCharPref("extensions.socialmail.abURL");
		}catch (e){
			// not set
			url=null;
		}
		if(url==null){
			var propPath=abManager.newAddressBook(this.sm_ABName, "", 2);
			var propURL=this.sm_prefManager.getCharPref(propPath+".filename");
			url="moz-abmdbdirectory://"+propURL;
			this.sm_prefManager.setCharPref("extensions.socialmail.abURL",url);
		}
		this.sm_addressbook=abManager.getDirectory(url);
		debugger;
		for (moduleNum in this.modules){
			var module=this.modules[moduleNum];
			if(module.init){
				module.init(this.prefs);
			}
		}
	}
	
	me.socialMail_install=function socialMail_install() {

		this.smDB.onLoad();
	
		this.smAB_init();
		
		// do we need to run upgrade scripts?
		if (parseFloat(Application.version) < 5.0) {
			//TB3 method
			var current=Application.extensions.get(this.sm_UID).version;
			this.checkUpgrade(current);
		} else {
			//TB5 method
			Application.getExtensions(function(extensions) {
				com.networklighthouse.socialMail.checkUpgrade(extensions.get(com.networklighthouse.socialMail.sm_UID).version);
				});
		}
	
		var os = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
		os.addObserver(this.steelmessageShowListener, "MsgMsgDisplayed", false);	
		os.addObserver(this.observeLoginMgr,"passwordmgr-storage-changed",false);

		//also need to detail with Conversations layout
		if (this.hasConversations){
			  registerHook(this.steelmessageShowListener);
		}
		
		
		oPrefs=this.prefs;
		oPrefs.QueryInterface(Components.interfaces.nsIPrefBranch2);
		oPrefs.addObserver("",this,false);
		
		this.twitter.showSMAnnounce();
	}
	
	me.checkUpgrade=function checkUpgrade(current){
		var ver = -1, firstrun = true;
		try{
			ver = this.prefs.getCharPref("version");
			firstrun = this.prefs.getBoolPref("firstrun");
		}catch(e){
		      // nothing
		}finally{
	      if (firstrun){
	    	  this.sm_prefManager.setBoolPref("extensions.socialmail.firstrun",false);
	    	  this.sm_prefManager.setCharPref("extensions.socialmail.version",current);
	    	  // nothing special at this stage, may want to show pop-up or
				// similar later
	      }		
	      if (ver!=current && !firstrun){ // !firstrun ensures that this
											// section does not get loaded if
											// its a first run.
	    	  this.sm_prefManager.setCharPref("extensions.socialmail.version",current);
	    	  // this is an upgrade
	    	  expireCache(this.sm_addressbook);
	    	  this.smDB.doUpgrade(ver);
	        // Insert code if version is different here => upgrade
	      }
		}
	}
	
	me.observeLoginMgr={
		observe : function(aSubject,aTopic,aData){
			var sm=com.networklighthouse.socialMail;
			for (moduleNum in sm.modules){
				module=sm.modules[moduleNum];
				if(module.loginChange){
					// we launch these off the main thread so that they can't
					// hold up the app
					module.loginChange(aSubject,aData);
				}
			}
				
		}
	}
	
	// This is the main driver function for on view activity
	me.steelmessageShowListener = {
		onMessageStreamed: function(hdr,domNode){
		 this._worker(hdr);
		},
		observe :  function(aSubject,aTopic,aData){
		
			
			// this is the non-steel method, to be retired when steel is
			// finished
			
			var msg=messenger.msgHdrFromURI(aData);
			// XXX var
			// rapApiKey=sm.sm_prefManager.getCharPref("extensions.socialmail.rapleaf.apikey");
			// var
			// doHash=sm.sm_prefManager.getBoolPref("extensions.socialmail.rapleaf.hash");
			// var
			// doHTTPS=sm.sm_prefManager.getBoolPref("extensions.socialmail.rapleaf.https");
			this._worker(msg);
		},
		_worker: function(msg){
			var sm=com.networklighthouse.socialMail;
			sm.dlog("In WORKER");
			var email=sm.parseEmail(msg.author);
			var card=sm.sm_addressbook.cardForEmailAddress(email);
			
			var newCard=false;
			if (card==null){
				// not found so we need a new one
				card=Components.classes["@mozilla.org/addressbook/cardproperty;1"].createInstance(Components.interfaces.nsIAbCard); 
				card.primaryEmail =email;
				// see if we can parse first/last name from the emailheader.
				var email=sm.parseEmail(msg.author);
				var displayName=sm.getNamefromHdr(msg);
				card.displayName=displayName;
				reg1=/(.*), +(.*)/;
				reg2=/(.*) +(.*)/;
				//first sort out any funny encodings
				displayName=sm.unescapeFromMime(displayName);
				
				if (names=reg1.exec(displayName)){
					card.firstName=names[2];
					card.lastName=names[1];
				}else if (names=reg2.exec(displayName)){
					card.firstName=names[1];
					card.lastName=names[2];
				}else {
					card.firstName=displayName;
				}
				newCard=true;
				sm.sm_addressbook.addCard(card);
				
			}
			var tag=msg.getProperty("SocialMail-Status")
			switch (tag){
			default:
				// New steps
			// case "REALLY OLD VERSION, START HERE":
				// OLDEST STEPS
				sm.callEmailGrabber(msg,card);
				sm.sm_incrementCount(msg);
			// case "OLDER VERSIONS, ADDITIONAL STEPS":
				
			// case "OLD VERSION, NO CHANGES IN PROCESS":
			case "SMDONE-v0.03f":				
				msg.setProperty("SocialMail-Status",sm.sm_mailTAG);
			case sm.sm_mailTAG:
			}
			
			sm.sm_updateDisplay(email);		
			
			var doCollect=false;
			if (newCard){
				doCollect=true;
			}else{
				if (sm.useCache(card)){
					// sm_updateDisplay(email);
				} else {
					doCollect=true;
				}
			}
			if (doCollect){
				for (moduleNum in sm.modules){
					module=sm.modules[moduleNum];
					if(module.collect){
						// we launch these off the main thread so that they
						// can't hold up the app
						window.setTimeout(module.collect,5,sm,card);
					}
				}
			}
		},
		handleEvent : function (event) {
		}
		/*
		 * STEEL METHOD DISABLED FOR NOW sm_cleanup();
		 * 
		 * var msg=event.data;
		 * 
		 * 
		 * 
		 * rapApiKey=sm_prefManager.getCharPref("extensions.socialmail.rapleaf.apikey");
		 * doHash=sm_prefManager.getBoolPref("extensions.socialmail.rapleaf.hash");
		 * doHTTPS=sm_prefManager.getBoolPref("extensions.socialmail.rapleaf.https");
		 * 
		 * email=parseEmail(msg.from); var
		 * card=sm_addressbook.cardForEmailAddress(email);
		 * 
		 * var newCard=false; if (card==null){ //not found so we need a new one
		 * card=Components.classes["@mozilla.org/addressbook/cardproperty;1"].createInstance(Components.interfaces.nsIAbCard);
		 * card.primaryEmail =email; newCard=true; sm_addressbook.addCard(card); } //
		 * XXX this is a hack as well hdr=msg._xpcomMsg; // XXX oh so bad, mixed
		 * paradigms if (hdr.getProperty("SocialMail-Status")!="DONE-1"){
		 * callEmailGrabber(msg,card);
		 * hdr.setProperty("SocialMail-Status","DONE-1"); } //
		 * sm_checkAttachments(msg);
		 * 
		 * 
		 * //update display before calling delayed updaters
		 * sm_updateDisplay(email);
		 * 
		 * if (newCard){
		 * window.setTimeout(callRapleaf,200,email,sm_updateRapleaf,rapApiKey,doHTTPS,doHash);
		 * }else{ if (useCache(card)){ //sm_updateDisplay(email); } else {
		 * window.setTimeout(callRapleaf,200,email,sm_updateRapleaf,rapApiKey,doHTTPS,doHash); } } },
		 */
	};
	
	// listener for new messages
	me.newMailListener = {
		msgAdded: function(item) {   
			// alert("Got mail. Look at item's properties for more details.");
			var hdr = item.QueryInterface(Components.interfaces.nsIMsgDBHdr);
			var msg=Application.Accounts.all[0].getNewMessage(hdr);;
			com.networklighthouse.socialMail.sm_incrementCount(hdr);
			// XXX should be here sm_checkAttachments(msg);
			// issue here is it's difficult to get the reuquired info from a msg
		}
	}
	
	// pref change listener, single catcher calls modules
	me.observe=function(subject, topic, data){
		for (moduleNum in this.modules){
			var module=this.modules[moduleNum];
			if(module.prefChange){
				module.prefChange(subject, topic, data);
			}
		}
	}
	
	/*
	 * update display function Works independant of the data sources used as it
	 * just looks at the cards.
	 */
	me.sm_updateDisplay = function sm_updateDisplay(emailAddr)
	{
		this.sm_cleanup();
		for (moduleNum in this.modules){
			var module=this.modules[moduleNum];
			if(module.cleanup){
				module.cleanup(this);
			}
		}
		
		var doPhoneCol=this.sm_prefManager.getBoolPref("extensions.socialmail.do_PhoneCollected");
		var doPhoneAB=this.sm_prefManager.getBoolPref("extensions.socialmail.do_PhoneAB");
		var doContact=doPhoneCol||doPhoneAB;
		
		var doSocials=this.sm_prefManager.getBoolPref("extensions.socialmail.do_Socials");
		var doURLs=this.sm_prefManager.getBoolPref("extensions.socialmail.do_URLs");
		var updateABPic=this.sm_prefManager.getBoolPref("extensions.socialmail.updateABPic");
		
	
		var card=this.sm_addressbook.cardForEmailAddress(emailAddr);
	
		var r_name=document.getElementById('sm_name');
		var name=this.sm_getName(emailAddr,card);
		r_name.setAttribute("value",name);
		r_name.setAttribute("email",emailAddr);
		r_name.sm_card=card;
		
		var r_receivedCnt=document.getElementById('sm_receivedCnt');
		var r_sentCnt=document.getElementById('sm_sentCnt');
		r_receivedCnt.setAttribute("value",card.getProperty("receivedCount","0"));
		r_sentCnt.setAttribute("value",card.getProperty("sentCount","0"));
		
		profile_img=this.sm_socials(card);
	
		try {
			var img_elem=document.getElementById("sm_profilepic");
			img_elem.setAttribute('src',profile_img);
			/*
			 * Address book image update code XXX if (updateABPic) {
			 */
			var abCard=this.addressbook.cardForEmailAddress(emailAddr);
			var photoType=abCard.getProperty("PhotoType",null);
			debugger;
		// alert(photoType);
		    if ((photoType=="generic")||(photoType==null)||(photoType=="web")){
				abCard.setProperty("PhotoURI",profile_img);
				abCard.setProperty("PhotoType","web");
				this.addressbook.modifyCard(abCard);
			 }
			
			
		} catch (err) {
			// do nothing
		}
		
		this.dlog("SM Display - setting visibility");
		this.setVisibilityByName("sm_contactBox",doContact);
		this.setVisibilityByName("sm_socialBox",doSocials);
		this.setVisibilityByName("sm_urlBox",doURLs);

		if (doContact){
			this.sm_dispContact(emailAddr);}
		if (doURLs){
			this.sm_dispURLs(emailAddr);}
		
		this.sm_getIdentity(emailAddr);
		
		for (moduleNum in this.modules){
			module=this.modules[moduleNum];
			if (module.render){
				window.setTimeout(module.render,5,this,card);
			}
		}
		
	}
	
	me.sm_getIdentity=function sm_getIdentity(emailAddr){
		id_q=Gloda.newQuery(Gloda.NOUN_IDENTITY);
		id_q.kind("email");
		id_q.value(emailAddr);
		id_q.limit(1);
		id_coll=id_q.getCollection(this.sm_hndlr_getIdentity);		
	}
	
	me.sm_hndlr_getIdentity={
			onItemsAdded: function _onItemsAdded(aItems, aCollection) {
			},
			onItemsModified: function _onItemsModified(aItems, aCollection) {
			},
			onItemsRemoved: function _onItemsRemoved(aItems, aCollection) {
			},
			onQueryCompleted: function _onQueryCompleted(id_coll) {
				com.networklighthouse.socialMail.dlog("hdlr_get Id entered ");
				// woops no identity
				id_coll.becomeExplicit();
				if (id_coll.items.length <= 0) {return}
			
				id=id_coll.items[0];
			
				// now we can call things that need an identity, should save
				// multiple callings
	
				com.networklighthouse.socialMail.sm_freqGraph(id);
				
				/*
				 * if (doURLs){ sm_dispURLs(id); }
				 */
				
				com.networklighthouse.socialMail.dlog("hdlr_get Id ending");
			}
	};
	me.sm_socials=function sm_socials(card){
		// needs card
		var r_socials=document.getElementById('sm_socials');
	
		var img_array=new Array();
		// default image
		img_array["no_image"]="chrome://socialMail/content/media/no_profile.gif";
		img_array["gravatar.com"]=this.sm_genGravatarURL(card.primaryEmail);
		var prefImageSrc = this.sm_prefManager.getCharPref("extensions.socialmail.imagePrefSrc");
		prefImageSrc=card.getProperty("prefImageSrc",prefImageSrc);
		
		abCard=this.addressbook.cardForEmailAddress(card.primaryEmail)
		
		var photoType=card.getProperty("PhotoType",null);
		if ((photoType!="generic")&&(photoType!=null)){
			uri=card.getProperty("PhotoURI",null)
			img_array["SM AddressBook"]=(uri);
			prefImageSrc="SM AddressBook";	
		}
		
		if (abCard){
			photoType=abCard.getProperty("PhotoType",null);
			if ((photoType!="generic")&&(photoType!=null)){
				uri=abCard.getProperty("PhotoURI",null)
				img_array["AddressBook"]=(uri);
				prefImageSrc="AddressBook";	
			}
		}
		
		prefImageSrc=card.getProperty("prefImageSrc",prefImageSrc);

			
		var sn_json=card.getProperty("SocialNetworks",null);
		
		if (sn_json != null){
			socialNets=JSON.parse(sn_json);
			for (netRef in socialNets) {
				/**
				 * XXX UGLY Really these should be managed by the module for
				 * each SN but then how do we handle the ones that dont have
				 * handlers?
				 * 
				 * Split this out to a generic module were we can work on it
				 * seperately add logic to check for specific modules....
				 */
				var net=socialNets[netRef];
				
				// check to see if handlers[net.site] is not set
				if (!me.handlers[net.site]){
					 try{
						 /*
							 * XXX STRIP THIS var
							 * r_socials=document.getElementById('sm_socials');
							 * var box=document.createElement("hbox");
							 * box.setAttribute("flex",1);
							 * box.setAttribute("pack","center");
							 * 
							 * var img=document.createElement("image");
							 * img.setAttribute('width',20);
							 * img.setAttribute('height',20);
							 * img.setAttribute('src',"http://www."+net.site+"/favicon.ico");
							 * img.setAttribute('tooltiptext',net.profile_url);
							 * img.setAttribute('onclick',"com.networklighthouse.socialMail.launchURL(\'"+net.profile_url+"\')");
							 * img.setAttribute('onerror',"com.networklighthouse.socialMail.sm_onNetworkImgError(this)");
							 * box.appendChild(img); r_socials.appendChild(box);
							 */
						this.addSNIcon(net);
					} catch (err){
						debugger;
						Application.console.log(err);
					}
				}
				var image_url=net.image_url;
				if (image_url == null || image_url == ""){
					// nothing
				} else {
					img_array[net.site]=image_url;
				}
		
			}
		}
		
		var image_site;
		var sm_picSelector=document.getElementById("sm_picSelector");
		sm_picSelector.selectedIndex=-1;
		for (key in  img_array){
			sm_picSelector.appendItem(key,img_array[key]);
			if (prefImageSrc==key){
				sm_picSelector.selectedIndex=sm_picSelector.itemCount-1;
			}
			image_site=key;
		}
		if (typeof img_array[prefImageSrc]=="undefined"){
			// not set
			sm_picSelector.selectedIndex=sm_picSelector.itemCount-1;
		} else {
			image_site=prefImageSrc;
			
		}
		return img_array[image_site];
	}
	
	
	me.sm_dispURLs=function sm_dispURLs(emailAddr){
		this.smDB.getURLs(emailAddr, {  
			sm_done: false,
			prefs: this.prefs,
			handleResult: function(aResultSet) {
			this.sm_done=true;
			try {
				r_smUrlList=document.getElementById("sm_urlList");
				count=0;
				for (let row = aResultSet.getNextRow(); row; row = aResultSet.getNextRow()) {
					this.otherRow=this.lastRow;
					this.lastRow=row;
					
					let url = unescape(row.getResultByName("url"));
					/**
					 * XXX Get rid of these var
					 * item=document.createElement("listitem");
					 * item.setAttribute('label',url);
					 * item.setAttribute('URL',url);
					 * item.setAttribute('onclick',"com.networklighthouse.socialMail.ui.sm_urlListClick(event)");
					 * 
					 * r_smUrlList.appendChild(item);
					 */
					count++;
					
					var attribs=new Array();					
					attribs["list"]="sm_urlList";
					attribs["context"]="sm_contextMenuURLs";
					attribs["image"]="";
					attribs["URL"]=url;
					attribs['onclick']="com.networklighthouse.socialMail.ui.sm_urlListClick(event)";
					com.networklighthouse.socialMail.dlog("adding Entry: "+url);
					com.networklighthouse.socialMail.addTimeEntry(url,null,attribs);
					
				}
				document.getElementById("sm_urlListCnt").value=count;
				// com.networklighthouse.socialMail.setVisibility(r_smUrlList,count);

			} catch (e){alert(e)};
		},  
	
		handleError: function(aError) {  
			print("Error: " + aError.message);  
		},  	
	
		handleCompletion: function(aReason) {  
			if (aReason != Components.interfaces.mozIStorageStatementCallback.REASON_FINISHED)
				print("Query canceled or aborted!");  
			if(this.sm_done==true){

				// XXX HERE - Check pref(phoneCollected)
				// first tab
				/*
				 * ftbox=document.getElementById("sm_ftURLs") if(this.otherRow){
				 * let url = unescape(this.otherRow.getResultByName("url"));
				 * 
				 * var item=document.createElement("description");
				 * item.setAttribute('value',url);
				 * item.setAttribute('crop',"center");
				 * item.setAttribute('URL',url);
				 * item.setAttribute('onclick',"com.networklighthouse.socialMail.ui.sm_urlListClick(event)");
				 * 
				 * ftbox.appendChild(item); }
				 * 
				 * if(this.lastRow){ let url =
				 * unescape(this.lastRow.getResultByName("url")); var
				 * item=document.createElement("description");
				 * item.setAttribute('value',url);
				 * item.setAttribute('crop',"center");
				 * item.setAttribute('URL',url);
				 * item.setAttribute('onclick',"com.networklighthouse.socialMail.ui.sm_urlListClick(event)");
				 * ftbox.appendChild(item); ftbox.setAttribute("status","on");
				 * document.getElementById("sm_ftURLsBox").setAttribute("status","on")
				 * }else{ ftbox.setAttribute("status","off"); }
				 */

			} else {
				document.getElementById("sm_urlListCnt").setAttribute("value","0");
				// r_smUrlList=document.getElementById("sm_urlList");
				// com.networklighthouse.socialMail.setVisibility(r_smUrlList,0);
				//document.getElementById("sm_ftURLs").setAttribute("status","off");
			}
		}  
		});
	}
	
	me.sm_dispContact=function sm_dispContact(emailAddr){
		// phone numbers text to date
		this.smDB.getNumbers(emailAddr, {  
			sm_done: false,
			prefs: this.prefs,
			handleResult: function(aResultSet) {
			this.sm_done=true;
			try {
				r_smPhoneList=document.getElementById("sm_phoneList");
				count=0;
				for (let row = aResultSet.getNextRow(); row; row = aResultSet.getNextRow()) {
					this.otherRow=this.lastRow;
					this.lastRow=row;
					let number = unescape(row.getResultByName("phoneNumber"));
					
					var attribs=new Array();
					
					attribs["list"]="sm_phoneList";
					attribs["context"]="sm_contextMnuPhones";
					attribs["image"]="chrome://socialMail/content/media/phone.png";
					
					com.networklighthouse.socialMail.dlog("adding Entry: "+number);
					com.networklighthouse.socialMail.addTimeEntry(number,null,attribs);
					
					/*
					 * var item=document.createElement("listitem");
					 * item.setAttribute('label',number);
					 * item.setAttribute("onclick","com.networklighthouse.socialMail.sm_phoneListClick(event);");
					 * item.setAttribute("emailAddr",emailAddr);
					 * r_smPhoneList.appendChild(item); count++;
					 */
				}
				document.getElementById("sm_phoneListCnt").value=count;

				// com.networklighthouse.socialMail.setVisibility(r_smPhoneList,count);
			} catch (e){this.dlog("Caught Exception in sm_dispContact : "+e)};
		},  
	
		handleError: function(aError) {  
			print("Error: " + aError.message);  
		},  	
	
		handleCompletion: function(aReason) {  
			/*
			 * XXX this isn't required anymore, handled for each result
			 * individually above in handeResult if (aReason !=
			 * Components.interfaces.mozIStorageStatementCallback.REASON_FINISHED)
			 * print("Query canceled or aborted!"); if(this.sm_done==true &&
			 * this.prefs.getBoolPref("do_PhoneCollected")){
			 *  // first tab ftbox=document.getElementById("sm_ftColNumbers");
			 * if(this.otherRow){ let number =
			 * unescape(this.otherRow.getResultByName("phoneNumber"));
			 * item=document.createElement("label");
			 * item.setAttribute('value',number);
			 * item.setAttribute("onclick","com.networklighthouse.socialMail.sm_phoneListClick(event);");
			 * item.setAttribute("emailAddr",emailAddr);
			 * 
			 * ftbox.appendChild(item); } if(this.lastRow){ let number =
			 * unescape(this.lastRow.getResultByName("phoneNumber"));
			 * item=document.createElement("label");
			 * item.setAttribute('value',number);
			 * item.setAttribute("onclick","com.networklighthouse.socialMail.sm_phoneListClick(event);");
			 * item.setAttribute("emailAddr",emailAddr);
			 * 
			 * ftbox.appendChild(item);
			 * 
			 * ftbox.setAttribute("status","on");
			 * document.getElementById("sm_ftNumbersBox").setAttribute("status","on");
			 * document.getElementById("sm_ftColNumbersBox").setAttribute("status","on");
			 * }else { ftbox.setAttribute("status","off"); } } else {
			 * document.getElementById("sm_phoneListCnt").setAttribute("value","0");
			 *  // r_smPhoneList=document.getElementById("sm_phoneList"); //
			 * com.networklighthouse.socialMail.setVisibility(r_smPhoneList,0); }
			 */
		}  
		});
	}
	

	
	me.setVisibility=function setVisibility(obj,count){
		// alert("setVisibility: "+obj.id+" "+count)
		if (count> 0) {
			obj.setAttribute('status','on');
		} else {
			obj.setAttribute('status','off');
		}
	}
	
	me.setVisibilityByName=function setVisibilityByName(name,state){
		obj=document.getElementById(name);
		if(state){
			obj.setAttribute('status','on')
		}else{
			obj.setAttribute('status','off')
		}
	}
	
	
	me.sm_cleanup=function sm_cleanup(){
		// tidy up
		var r_name=document.getElementById('sm_name');
		r_name.setAttribute("value","Name Unknown");
	
		var img_elem=document.getElementById("sm_profilepic");
		img_elem.setAttribute('src',"chrome://socialMail/content/media/no_profile.gif");
	
		this.sm_clearBox('sm_socials');
		this.sm_clearBox('sm_phoneList');
		// this.sm_clearBox("sm_ftColNumbers");
		this.sm_clearBox('sm_urlList');
		// this.sm_clearBox('sm_ftURLs');
		this.sm_clearBox('sm_errorBox');
		this.sm_clearBox("sm_picSelector");
		this.sm_clearBox("sm_socialNetRows");
		this.sm_clearBox("sm_timeline");
		
		// this.setVisibilityByName("sm_ftNumbersBox",false);
		// this.setVisibilityByName("sm_ftColNumbersBox",false);
		// this.setVisibilityByName("sm_ftURLsBox",false);
		this.setVisibilityByName("sm_errorBox",false);
		
	}
	
	me.sm_clearBox=function sm_clearBox(name){
		// clear the emails
		var r_List=document.getElementById(name);
		while (r_List.firstChild) 
		{
			r_List.removeChild(r_List.firstChild);
		};
	}
	
	me.addTimeEntry=function addTimeEntry(value,date,data,objs){
		// list, context, image
		// var entry=new document.createElement("timeEntry");
		try {
		var _date;
		if (date != ""){
			_date=new Date(date);
		} else {
			_date=new Date();
		}
		
		var date=_date.toLocaleString();
		
		var listbox;
		if (data["list"]){
			listbox=data["list"];
			data["list"]=null;
		} else {
			listbox="sm_timeline";
		}
		var timeline=document.getElementById(listbox);	
// var entry=timeline.insertItemAt( 0, "");
		const XULNS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
        var entry = timeline.ownerDocument.createElementNS(XULNS, "timeEntry");

		entry.setAttribute("class","timeEntry");
		entry.setAttribute("value",value);
		entry.setAttribute("date",date.toString());
		// entry.setAttribute("image",image);
		// entry.setAttribute("context","sm_contextMenu");
		entry._date=_date;
		for (head in data){
			value=data[head];
			if (typeof(value)=="object"){
				value=JSON.stringify(value);
			}
			entry.setAttribute(head,value);
		}
		for (head in objs){
			// XXX this is really dirty and bad practice, didn't want to do it
			// this way...
			value=objs[head];
			entry[head]=value;
		}
		
		// really should sort this and insert into the right location
		var insertpoint=0;
		for (a in timeline.children){
			if (timeline.children[a]._date < entry._date){
				break;
			}
			insertpoint++;
		}
		
        var before = timeline.getItemAtIndex(insertpoint);
        if (!before)
          timeline.appendChild(entry);
        else
          timeline.insertBefore(entry, before);		
		}catch(e){
			this.dlog("Exception Caught in addTimeEntry :"+e);
		}
	}
	
	me.addSocialNet=function addSocialNet(site,profile_url,data){
		// XXX probably/definitely should use a xbl binding instead of this....
		var r_socials=document.getElementById('sm_socials');
		var box=document.createElement("hbox");
		box.setAttribute("flex",1);
		box.setAttribute("pack","center");

		var img=document.createElement("image");
		img.setAttribute('width',20);
		img.setAttribute('height',20);
		img.setAttribute('src',"http://www."+site+"/favicon.ico");
		img.setAttribute('onclick',"com.networklighthouse.socialMail.launchURL(\'"+profile_url+"\')");
		img.setAttribute('onerror',"com.networklighthouse.socialMail.sm_onNetworkImgError(this)");
		for (head in data){
			value=data[head];
			if (typeof(value)=="object"){
				value=JSON.stringify(value);
			}
			img.setAttribute(head,value);
		}
		
		box.appendChild(img);
		r_socials.appendChild(box);
	}
	
	me.useCache=function useCache(card){
		sm_cacheDays=this.sm_prefManager.getIntPref("extensions.socialmail.cacheDays");
		if (sm_cacheDays>0) { // doCache
			var day;
			var cache;
			var dat = new Date();
			var minutes = 1000*60;
			var hours = minutes*60;
			var days = hours*24;
			var today = Math.floor(dat.getTime()/days);
			try {
				cache=card.getProperty("savedOn","0");
				day=parseInt(cache);
			} catch (err) {
				day=0;
			}
			// alert("Cache good for: "+(day+sm_cacheDays-today)+" days");
			if (day+sm_cacheDays < today){
				return false;
			}else{
				return true;
			}
		} else {
			return false;
		}
	}
	
	me.sm_getName=function sm_getName(email,smCard){
		var name;
		var card=this.addressbook.cardForEmailAddress(email);
		
		if (card!=null){
			// ie card exists, then use the name from card
			name=card.getProperty("DisplayName","Name Unknown");
		} else {
			name=smCard.getProperty("Name","Name Unknown");
			if (name=="Name Unknown"){
				// card exists but has no name, so use smCard
				name=smCard.getProperty("DisplayName","Name Unknown");
			}
		}
		return name;
	} 
	
	me.manageUpdater=function sm_manageUpdater(){
		var status=false;
		for (moduleNum in this.modules){
			module=this.modules[moduleNum];
			if(module.isUpdater) status=(status||module.isUpdater);
		}
		var hidden=!status;
		document.getElementById("sm_ftUpdateBox").hidden=hidden
	}
	
	me.buildSNRecord=function sm_buildSNRecord(site,profile,image,module){
		var record={};
		record.site=site;
		record.profile_url=profile;
		record.image_url=image;
		
		// Ancillary data
		record.module=module; // which component made this record, could be
								// useful later
		record.hidden=false; // so we can hide entries in the future
		
		return record;
	}
	
	me.getSNRecordForSite=function(card,site){
		var sn_json=card.getProperty("SocialNetworks",null);
		if (sn_json==null) return null;
		socialNets=JSON.parse(sn_json);
		for (netRef in socialNets){
			net=socialNets[netRef];
			if (net.site==site) return net;
		}
		return null;
	}
	
	me.addSNPanelRow = function addSNPanelRow(net){
		var rows=document.getElementById("sm_socialNetRows");
		var row
		if (net==null){
			row=buildSNPanelRow("","","","panel")
		}else {
			row=buildSNPanelRow(net.site,net.profile_url,net.image_url,net.module);
		}
		
		rows.appendChild(row);
	}
	
	me.addSNIcon=function addSNIcon(net){
		 var r_socials=document.getElementById('sm_socials');
		 var box=document.createElement("hbox");
		 box.setAttribute("flex",1);
		 box.setAttribute("pack","center");
		 
		 var img=document.createElement("image");
		 img.setAttribute('width',20);
		 img.setAttribute('height',20);
		 img.setAttribute('src',"http://www."+net.site+"/favicon.ico");
		 img.setAttribute('tooltiptext',net.profile_url);
		 img.setAttribute('onclick',"com.networklighthouse.socialMail.launchURL(\'"+net.profile_url+"\')");
		 img.setAttribute('onerror',"com.networklighthouse.socialMail.sm_onNetworkImgError(this)");
		 box.appendChild(img); 
		 r_socials.appendChild(box);
	}
	
	me.mergeSNhash=function(card,socialNets_temp,replace,module){
		var socialNets=null;
		var sn_json=card.getProperty("SocialNetworks",null);
		if(sn_json!=null && replace!=true){
			socialNets=JSON.parse(sn_json);
			for (netRef in socialNets_temp){
				if(socialNets[netRef]){
					// we have a record for this profile
					// only overwrite if we are the originator
					if (module==null || socialNets[netRef].module==module){
						socialNets[netRef]=socialNets_temp[netRef];
					} else {
						// do nothing
					}
				} else {
					// new profile
					socialNets[netRef]=socialNets_temp[netRef];
				}
			}
		} else {
			socialNets=socialNets_temp;
		}
		card.setProperty("SocialNetworks",JSON.stringify(socialNets));
		// must save the card
		this.sm_addressbook.modifyCard(card);
	}
	
	function buildSNPanelRow(site,profile_u,image_u,module){
		var row=document.createElement("row");
		
		var image=document.createElement("image");
		image.setAttribute("src","http://www."+site+"/favicon.ico");
		
		var siteLabel, profileTA;
		if (site==""){
			siteLabel=document.createElement("textbox");
			profileTA=document.createElement("textbox");
			
		} else {
			siteLabel=document.createElement("label");
			profileTA=document.createElement("label");
			
		}
		siteLabel.setAttribute("value",site);
		siteLabel.setAttribute("onchange","this.parentNode.modified=true");
		siteLabel.module=module;
		
		profileTA.setAttribute("value",profile_u);
		profileTA.setAttribute("onchange","this.parentNode.modified=true");

		
		imageTA=document.createElement("textbox");
		imageTA.setAttribute("value",image_u);
		imageTA.setAttribute("onchange","this.parentNode.modified=true");

		
		btn=document.createElement("button");
		btn.setAttribute("label","X");
		btn.setAttribute("oncommand","child=this.parentNode;this.parentNode.parentNode.removeChild(child)");

		row.appendChild(image);
		row.appendChild(siteLabel);
		row.appendChild(profileTA);
		row.appendChild(imageTA);
		row.appendChild(btn);
		return row;
	}
	
	function expireCache(ab){
		// need to iterate through all cards and set the savedOn date to 0
		cEnum=ab.childCards;
		while (cEnum.hasMoreElements()){
			card=cEnum.getNext().QueryInterface(Components.interfaces.nsIAbCard);
			card.setProperty("savedOn","0");
			ab.modifyCard(card);
		}
	}
	
	
    //=?UTF-8?Q?Claudia_Br=C3=BCckner?=
	
	
	return me;
}()
