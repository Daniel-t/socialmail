
const Cc = Components.classes;
const Ci = Components.interfaces;
/**
 * callEmailGrabber is responsible for taking details from each message
 * DO NOT CALL ASYNCHRONOUSLY!! due to bad way attachments are handled
 * @param msg a STEEL msg object 
 * @param card an associated smCard
 * @return
 */
/* STEEL METHOD
 * function callEmailGrabber(msg,card){
	//gather name
	displayName=getNamefromMsg(msg);
	card.setProperty("DisplayName",displayName);
	
	sm_checkAttachments(msg);
}
*/
this.callEmailGrabber=function callEmailGrabber(hdr,card){
	//gather name
	displayName=getNamefromHdr(hdr);
	card.setProperty("DisplayName",displayName);
	sm_addressbook.modifyCard(card);
	
	//retreive the GlodaMessage via listener
	//alert("calling handler");
	Gloda.getMessageCollectionForHeader(hdr, this.sm_hndlr_GlodaMsg)
	
}

this.sm_hndlr_GlodaMsg={
		onItemsAdded: function _onItemsAdded(aItems, aCollection) {
		},
		onItemsModified: function _onItemsModified(aItems, aCollection) {
		},
		onItemsRemoved: function _onItemsRemoved(aItems, aCollection) {
		},
		onQueryCompleted: function _onQueryCompleted(msg_coll) {
			//alert("in handler")
			sm=com.networklighthouse.socialMail;
			sm.dlog("SM emailGrabber Hdlr entered #"+msg_coll.items.length);
			//alert("checking length");
			if (msg_coll.items.length<1) {
				//nothing to see here, should never happen....
				return;
			}
			//alert("length good")
			msg=msg_coll.items[0];
			com.networklighthouse.socialMail.sm_phoneGrabber(msg);
			com.networklighthouse.socialMail.sm_urlGrabber(msg);
			//add others as required, maybe able to re-implement attachments here to
			//alert("done")
			sm.dlog("SM emailGrabber Hdlr ending");
		}
};

/*
 * email parsing/grabbing functions
 */

this.dump=function dump(arr,level) {
	var dumped_text = "";
	if(!level) level = 0;
	
	//The padding given at the beginning of the line.
	var level_padding = "";
	for(var j=0;j<level+1;j++) level_padding += "    ";
	
	if(typeof(arr) == 'object') { //Array/Hashes/Objects 
		for(var item in arr) {
			var value = arr[item];
			
			if(typeof(value) == 'object') { //If it is an array,
				dumped_text += level_padding + "'" + item + "' ...\n";
				dumped_text += dump(value,level+1);
			} else {
				dumped_text += level_padding + "'" + item + "' => \"" + value + "\"\n";
			}
		}
	} else { //Stings/Chars/Numbers etc.
		dumped_text = "===>"+arr+"<===("+typeof(arr)+")";
	}
	return dumped_text;
}


this.getEmail= function getEmail(){
	  	var fh = currentHeaderData["from"];
		var from = null;
		if(fh != null) {
			from = fh.headerValue;
		} else {
			from = currentHeaderData["return-path"].headerValue;
		}

		//facebook sends funny emails, reply-to address is normally more interesting
		if (from.indexOf("@facebookmail.com") >= 0){
			from = currentHeaderData["reply-to"].headerValue;
		}
		// `+` in email addresses is valid, but we want to drop anything between + and @
		if (from.indexOf("+") >= 0){
			from=from.replace(/(.*)\+.*@(.*)/,"$1@$2");
		}

		from = from.replace(/.*\</g, "");
		from = from.replace(/\>/g, "");
		from = from.toLowerCase();
		return from;

	}

this.parseEmail = function parseEmail(from){
		if (from.indexOf("+") >= 0){
			from=from.replace(/(.*)\+.*@(.*)/,"$1@$2");
		}

		from = from.replace(/.*\</g, "");
		from = from.replace(/\>/g, "");
		from = from.toLowerCase();
		return from;
}

this.getNamefromMsg= function getNamefromMsg(msg){
	from=msg.from;
	from = from.replace(/\<.*/g, "");
	//from = from.replace(/\>/g, "");
	return from;
}

this.getNamefromHdr=function getNamefromHdr(msg){
	from=msg.author;
	from = from.replace(/\<.*/g, "");
	//from = from.replace(/\>/g, "");
	return from;
}

this.getEmail2= function getEmail2(hdr){
	  	var fh = hdr;
		var from = null;
		from = fh.author;
		

		//facebook sends funny emails, reply-to address is normally more interesting
		if (from.indexOf("@facebookmail.com") >= 0){
			from = fh.getProperty("reply-to");
		}
		// `+` in email addresses is valid, but we want to drop anything between + and @
		if (from.indexOf("+") >= 0){
			from=from.replace(/(.*)\+.*@(.*)/,"$1@$2");
		}

		from = from.replace(/.*\</g, "");
		from = from.replace(/\>/g, "");
		from = from.toLowerCase();
		return from;
	}


this.sm_incrementCount=function sm_incrementCount(header){
	  var folder=header.folder.prettiestName;
	  if (folder=="Sent"){
		  sm_incrementSentCount(header);
	  }else{
		  sm_incrementRcvCount(header);
	  }
}
this.sm_incrementRcvCount=function sm_incrementRcvCount(header){
	  
	  //author is in full "daniel thomas <daniel.thomas@gmail.com" form need to strip it
	  from=getEmail2(header);
	  //retreive or create card
		var newCard=false;
		var card=sm_addressbook.cardForEmailAddress(from);
		if (card==null){
			//not found so we need a new one
			card=Components.classes["@mozilla.org/addressbook/cardproperty;1"].createInstance(Components.interfaces.nsIAbCard); 
			card.primaryEmail =from;
			newCard=true;
		}
	  //update or set received count
	  rcvStr=card.getProperty("receivedCount","0");
	  rcvInt=parseInt(rcvStr);
	  rcvInt=rcvInt+1;
	  card.setProperty("receivedCount",rcvInt);
	  //save/modify card
		if (newCard==true){
			sm_addressbook.addCard(card);
		}else {
			sm_addressbook.modifyCard(card);
		}
}

this.sm_incrementSentCount=function sm_incrementSentCount(header){
	  //XXX not implemented yet
	  recipientList=header.recipients;
	  recipients=recipientList.split(",");
		
		for (var i=0;i <recipients.length; i++) {
			var recipient=recipients[i];
			email=parseEmail(recipient);
			
			var newCard=false;
			var card=sm_addressbook.cardForEmailAddress(email);
			if (card==null){
				//not found so we need a new one
				card=Components.classes["@mozilla.org/addressbook/cardproperty;1"].createInstance(Components.interfaces.nsIAbCard); 
				card.primaryEmail =email;
				newCard=true;
			}
		  //update or set sent count
		  sentStr=card.getProperty("sentCount","0");
		  sentInt=parseInt(sentStr);
		  sentInt=sentInt+1;
		  card.setProperty("sentCount",sentInt);
		  //save/modify card
			if (newCard==true){
				sm_addressbook.addCard(card);
			}else {
				sm_addressbook.modifyCard(card);
			}	
		}
}

this.sm_phoneGrabber=function sm_phoneGrabber(msg) {
	//this is where we get phone numbers
	//phoneRgx = /(?:(?:\+\d{1,3}(?:-| )?\(?:?\d\)?(?:-| )?\d{1,5})|(?:\(?:?\d{2,6}\)?))(?:-| )?(?:\d{3,4})(?:-| )?(?:\d{4})(?:(?: x| ext)\d{1,5}){0,1}/gi;
	phoneRgx=/(?:\+\d{1,3})? ?(?:\(\d{1,3}\))? ?(?:\d[- ]?){7,12}/g;
	text=msg.indexedBodyText;
	email=com.networklighthouse.socialMail.parseEmail(msg.from.value);
	//alert("in phone grabber for "+email+"<br>\n"+text);
 	while(match=phoneRgx.exec(text)){
 		//alert("found :"+match);
 		com.networklighthouse.socialMail.smDB.addNumber(email,match);
	}
}

this.sm_urlGrabber=function sm_urlGrabber(msg){
	//rgx=/(?:(?:(?:http?|ftp)[s]?:\/\/)|(?:www\.))(?:(?:[a-zA-Z0-9]+)\.){2,}(?:[a-zA-Z0-9]+)(?:\/(?:[-%a-zA-Z0-9\.]+)?)*(?:\?(?:[-\+\*_\.a-zA-Z0-9=|&%])*)?/g;
	rgx=/(?:(?:(?:http?|ftp)[s]?:\/\/)|(?:www\.))(?:(?:[a-zA-Z0-9]+)\.)+(?:[a-zA-Z0-9]+)(?:\/(?:[-%a-zA-Z0-9]+)?(?:\.[a-zA-Z0-9]+)?)*(?:\?(?:[-\+\*_\.a-zA-Z0-9=|&%])*)?/g;
	text=msg.indexedBodyText;
	email=com.networklighthouse.socialMail.parseEmail(msg.from.value);
	//alert("In url grabber for "+email+"<br>\n"+text);
	
 	while(match=rgx.exec(text)){
 //		alert("found :"+match);
 		com.networklighthouse.socialMail.smDB.addURL(email,match);
	}
}