/*SocialMail provider template notes
 * a provider must provide the following functions
 *   init()
 *   cleanup(socilMail)//reset display
 *   collect(socialMail,card)
 *   render(socialMail,card)
 */


this.emailTab=function(){
	
	var me={};

	prefs=null;
	
	me.init=function(smprefs){
		prefs=smprefs;
	}
	
	me.collect=function(sm,card){
		
	}
	
	me.render=function(sm,card){
		debugger;
		emailAddr=card.primaryEmail;

		doContacts=prefs.getBoolPref("do_Contacts");
		doPrevEmails=prefs.getBoolPref("do_PrevEmails");
		doFiles=prefs.getBoolPref("do_Files");

		// sm.setVisibilityByName("sm_attachmentBox",doFiles);
		// sm.setVisibilityByName("sm_emailBox",doPrevEmails);
		// sm.setVisibilityByName("sm_contactsBox",doContacts);

			sm_dispEmails(sm,emailAddr);
			sm_dispContacts(sm,emailAddr);
	}
	
	me.cleanup=function(sm){
		// sm.sm_clearBox('sm_emailList');
		sm.sm_clearBox('sm_contactList');
		sm.sm_clearBox('sm_attachmentList');	
		
		// sm.sm_clearBox("sm_ftFiles");
		// sm.sm_clearBox("sm_ftConv");

	}
	
	/*
	 * A better way, use Gloda
	 * 
	 * Cu.import("resource:///modules/gloda/mimemsg.js");
	 * hdr=glodaMsg.folderMessage MsgHdrToMimeMessage(msg,cb)
	 * cb=function(hdr,mime) for a in mime.allAttachments mime == partName=1.2
	 * name=Storage.jpg contentType=image/jpeg
	 * url=imap://daniel%2Ethomas%40gmail%2Ecom@imap.googlemail.com:993/fetch%3EUID%3E/%5BGmail%5D/All%20Mail%3E43484?part=1.2&filename=Storage.jpg
	 * isExternal=false parts=undefined headers=[object Object]
	 * isRealAttachment=true allAttachments=[object Object]
	 * 
	 * msgURI=hdr.folder.getUriForMsg(hdr);
	 * 
	 */
	
	function buildFileItem(item,row){
		let filename = row.getResultByName("filename");
		let url = row.getResultByName("URL");  
		let type = row.getResultByName("contentType"); 
		let msgUri = row.getResultByName("msgUri"); 

		
		buildFileItem2(item,filename,url,type,msgUri)
			
	}

	function buildFileItem2(item,filename,url,type,msgUri){

		item.setAttribute("onclick","com.networklighthouse.socialMail.sm_attachmentListClick(event);");
		item.setAttribute("filename",filename);
		item.setAttribute("URL",url);
		item.setAttribute("contentType",type);
		item.setAttribute("msgURI",msgUri);
		item.setAttribute("class","listitem-iconic");

		item.setAttribute('image',"moz-icon://"+filename+"?size=16&contentType="+type);
		item.setAttribute('label',filename);
		
	
	}
	
	
	sm_dispEmails=function sm_dispEmails(sm,emailAddr){
		// Gloda method

		// first we need to get an identity from an email address
		// its ugly but the only way I can see to do this is to chain events
		id_q=Gloda.newQuery(Gloda.NOUN_IDENTITY);
		id_q.kind("email");
		id_q.value(emailAddr);
		id_coll=id_q.getCollection(com.networklighthouse.socialMail.emailTab.sm_hndlr_glodaIdentity);	  
	}
	
	// needs to be exposed so GLODA can call back
	me.sm_hndlr_glodaIdentity ={
			onItemsAdded: function _onItemsAdded(aItems, aCollection) {
			},
			onItemsModified: function _onItemsModified(aItems, aCollection) {
			},
			onItemsRemoved: function _onItemsRemoved(aItems, aCollection) {
			},
			onQueryCompleted: function _onQueryCompleted(id_coll) {
				// woops no identity
				id_coll.becomeExplicit();
				if (id_coll.items.length <= 0) {
					// document.getElementById("sm_emailListCnt").setAttribute("value","0");
					return;
				}
			
				id=id_coll.items[0];
			
				// now we use the identity to find all messages that person was
				// involved
				// with
				msg_q=Gloda.newQuery(Gloda.NOUN_MESSAGE);
				msg_q.involves(id);
				limit=com.networklighthouse.socialMail.sm_prefManager.getIntPref("extensions.socialmail.msgQueryLimit");
			
				msg_q.limit(limit);
				msg_q.orderBy("-date");
				msg_q.getCollection(com.networklighthouse.socialMail.emailTab.sm_hndlr_glodaMessage);
			}
	};

	me.sm_hndlr_glodaMessage ={
		
		onItemsAdded: function _onItemsAdded(aItems, aCollection) {
		},
		/* called when items that are already in our collection get re-indexed */
		onItemsModified: function _onItemsModified(aItems, aCollection) {
		},
		/*
		 * called when items that are in our collection are purged from the
		 * system
		 */
		onItemsRemoved: function _onItemsRemoved(aItems, aCollection) {
		},
		/* called when our database query completes */
		onQueryCompleted: function _onQueryCompleted(msg_coll) {
			msg_coll.becomeExplicit();
			conversations=new Array();
			messages=new Array();
			dates=new Array();
			
			dlog=com.networklighthouse.socialMail.dlog;
		
			while(msg=msg_coll.items.pop()){
				conversations[msg.conversationID]=msg.conversation;
				messages[msg.conversationID]=msg;
				dates[msg.conversationID]=msg.date;
			}
		
			for (var convp in conversations){

				
				conv=conversations[convp];
				msg=messages[convp];
				date=dates[convp];
				let subject = conv.subject;

			
				var attribs=new Array();
				attribs["context"]="sm_contextMenuEmail";
				attribs["image"]="chrome://socialmail/content/media/email16.png";
				var objs=new Array();
				objs["message"]=msg;
				
				com.networklighthouse.socialMail.addTimeEntry(subject,date,attribs,objs);
				// r_smEmailList.appendChild(item);
				// also Check for attachments
				if(msg.attachmentNames!=null){
					var hdr=msg.folderMessage
					MsgHdrToMimeMessage(hdr,com.networklighthouse.socialMail.emailTab.sm_hndlr_attachments)
				} else if(msg.attachmentInfos!=null){
					// TB5 method
					var uri= msg.folderMessage.folder.getUriForMsg(msg.folderMessage);
					com.networklighthouse.socialMail.emailTab.renderAttachments(msg.attachmentInfos,uri,date);
				}
			}
			// com.networklighthouse.socialMail.setVisibility(r_smEmailList,count)
		}
	}
	
	me.renderAttachments=function(attachments,msgUri,date){
		dlog=com.networklighthouse.socialMail.dlog;
		
		try {
			for (num in attachments){
				var attachment=attachments[num];
				var filename=attachment.name;
				var url=attachment.url;
				var type=attachment.contentType;
				// var item=document.createElement("listitem");
				// buildFileItem2(item,filename,url,type,msgUri);
				// document.getElementById("sm_attachmentList").appendChild(item);
				
				attribs=new Array();
				attribs["onclick"]="com.networklighthouse.socialMail.sm_attachmentListClick(event);";
				attribs["filename"]=filename;
				attribs["URL"]=url;
				attribs["contentType"]=type;
				attribs["msgURI"]=msgUri;
				
				attribs["list"]="sm_attachmentList";
				attribs['image']="moz-icon://"+filename+"?size=16&contentType="+type;
				attribs['label']=filename;
				attribs["context"]="sm_contextMenuAttachment";
				com.networklighthouse.socialMail.addTimeEntry(filename,date,attribs)
			}
			
		} catch(e){
				dlog(e);
				dlog("Caught Exception in Attachemnt rendering : "+e)
		}
		dlog("Exiting Attachment renderer");
	}
	
	me.sm_hndlr_attachments=function(hdr,mime){
		try {
		var msgUri=hdr.folder.getUriForMsg(hdr);
		for (attach in mime.allAttachments){
			
			var filename=mime.allAttachments[attach].name;
			var url=mime.allAttachments[attach].url;
			var type=mime.allAttachments[attach].contentType;
			
			var item=document.createElement("listitem");
			// buildFileItem2(item,filename,url,type,msgUri);
			// document.getElementById("sm_attachmentList").appendChild(item);
			
			attribs=new Array();
			attribs["onclick"]="com.networklighthouse.socialMail.sm_attachmentListClick(event);";
			attribs["filename"]=filename;
			attribs["URL"]=url;
			attribs["contentType"]=type;
			attribs["msgURI"]=msgUri;
			
			attribs["list"]="sm_attachmentList";
			attribs['image']="moz-icon://"+filename+"?size=16&contentType="+type;
			attribs['label']=filename;
			attribs["context"]="sm_contextMenuAttachment";
			
			com.networklighthouse.socialMail.addTimeEntry(filename,hdr.date/1000,attribs)
		}
		
		} catch(e){
			com.networklighthouse.socialMail.dlog("Caught Exception in Attachemnt rendering : "+e)
		}
	}
	
	sm_dispContacts=function sm_dispContacts(sm,emailAddr){
		sm.dlog("SM emailTab-dispContacts Entered");
		// Gloda method
	
		// first we need to get an identity from an email address
		// its ugly but the only way I can see to do this is to chain events
		id_q=Gloda.newQuery(Gloda.NOUN_IDENTITY);
		id_q.kind("email");
		id_q.value(emailAddr);
		
		// there should only be one
		id_q.limit(1);
		
		sm.dlog("SM Display Contacts- getting Identity Collection");	
		id_coll=id_q.getCollection(com.networklighthouse.socialMail.emailTab.sm_hndlr_glodaIdentityContacts);	  
	}
	
	
	me.sm_hndlr_glodaIdentityContacts ={
		onItemsAdded: function _onItemsAdded(aItems, aCollection) {
		},
		onItemsModified: function _onItemsModified(aItems, aCollection) {
		},
		onItemsRemoved: function _onItemsRemoved(aItems, aCollection) {
		},
		onQueryCompleted: function _onQueryCompleted(id_coll) {

			com.networklighthouse.socialMail.dlog("hdlr_gIC entered ");
			// woops no identity
			id_coll.becomeExplicit();
			if (id_coll.items.length <= 0) {
				document.getElementById("sm_contactListCnt").setAttribute("value","0");
				return;
			}
		
			id=id_coll.items[0];
		
			// now we use the identity to find all messages that person was
			// involved
			// with
			msg_q=Gloda.newQuery(Gloda.NOUN_MESSAGE);
			msg_q.involves(id);
			// XXX for now, as a performance tweak
			msg_q.limit(100)

			com.networklighthouse.socialMail.dlog("hdlr_gIC calling hdlr_gMC");
			msg_q.getCollection(com.networklighthouse.socialMail.emailTab.sm_hndlr_glodaMessageContacts);
		}
	};
	

	
	me.sm_hndlr_glodaMessageContacts ={
		onItemsAdded: function _onItemsAdded(aItems, aCollection) {},
		onItemsModified: function _onItemsModified(aItems, aCollection) {},
		onItemsRemoved: function _onItemsRemoved(aItems, aCollection) {},
		onQueryCompleted: function _onQueryCompleted(msg_coll) {
			com.networklighthouse.socialMail.dlog("hdlr_gmc entered");
			
			msg_coll.becomeExplicit();
			contacts=new Array();
			while(msg=msg_coll.items.pop()){
				contacts[msg.from.id]=msg.from;
// contacts[msg.from.contact.id]=msg.from;
				count=1;
				for (var recipient in msg.recipients){
					contacts[recipient.id]=recipient;
				}
			}

			r_smContactList=document.getElementById("sm_contactList");
			r_smContactListCnt=document.getElementById("sm_contactListCnt");
			count=0;
			for (var contactp in contacts){
				contact=contacts[contactp];
				if (typeof (contact.value) =="undefined"){
					
				} else {
					var item=r_smContactList.insertItemAt( 0, "");
					// var item=document.createElement("listitem");
	
					item.contact=contact;
					item.setAttribute("onclick","com.networklighthouse.socialMail.sm_contactListClick(event);"); 	
					item.setAttribute('label',contact.value);
					count++;
				}
			}
			
			r_smContactListCnt.value=count;
			// com.networklighthouse.socialMail.setVisibility(r_smContactList,count);
			
		}
	}

	
	return me;
}()

this.modules.push(this.emailTab);