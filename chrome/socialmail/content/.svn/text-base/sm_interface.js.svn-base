/*
 * This file contains functions that are called directly from the UI
 */
this.launchURL = function launchURL(url) {
	messenger.launchExternalURL(url);
}

this.sm_attachmentListClick = function sm_attachmentListClick(event) {
	// we only care about button 0 (left click) events
	if (event.button != 0)
		return;

	if (event.detail == 2) // double click
	{
		var target = event.target;
		if (target.localName == "listitem") {
			this.ui.actuators.openAttachment(target);
		}
	}
}

this.sm_emailListClick = function sm_emailListClick(event) {
	// we only care about button 0 (left click) events
	if (event.button != 0)
		return;

	if (event.detail == 2) // double click
	{
		var target = event.target;
		this.ui.actuators.openConversation(target.message);
	}
}

this.sm_phoneListClick = function sm_phoneListClick(event) {
	// we only care about button 0 (left click) events
	if (event.button != 0)
		return;
	skypePref = com.networklighthouse.socialMail.sm_prefManager
			.getBoolPref("extensions.socialmail.skype.enabled");

	if (event.detail == 2 && skypePref) // double click
	{
		var target = event.target;
		var number = target.label;
		if (number == null) {
			number = target.value;
		}
		this.ui.actuators.callSkype(number);
	}
}

this.sm_contactListClick = function sm_contactListClick(event) {
	// we only care about button 0 (left click) events
	if (event.button != 0)
		return;

	if (event.detail == 2) // double click
	{
		var target = event.target;
		this.ui.actuators.openContactView(target.contact);
	}
}

this.sm_onImgError = function sm_onImgError(source) {
	source.src = "chrome://socialMail/content/media/no_profile.gif";
	return true;
}

this.sm_onNetworkImgError = function sm_onImgError(source) {
	source.src = "chrome://socialMail/content/media/logo16.bmp";
	return true;
}

this.ui = {}

this.ui.sm_urlListClick = function sm_attachmentListClick(event) {
	// we only care about button 0 (left click) events
	if (event.button != 0)
		return;

	if (event.detail == 2) // double click
	{
		var target = event.target;
		this.actuators.launchURL(this.getValue(target));
	}
}

this.ui.panelHdrClick = function panelHdrClick(obj) {
	// this.actuators.toggleListBox(obj.nextSibling);
}

this.ui.contextMnuShow = function() {
	alert("CONTEXT POPUP XXX");
	var obj = document.popupNode;

	while (obj.id == "")
		obj = obj.parentNode;
	var id = obj.id;

	var showPhoneList = false;
	var showContactList = false;
	var showConvList = false;
	var showAttachList = false;
	var showURLList = false;
	var showBadCtxt = false;
	var showTweetList = false;

	switch (id) {
	case "sm_phoneList":
	case "sm_ftNumbers":
	case "sm_ftColNumbers":
		showPhoneList = true;
		break;
	case "sm_contactList":
		showContactList = true;
		break;
	case "sm_emailList":
	case "sm_ftConv":
		showConvList = true;
		break;
	case "sm_ftFiles":
	case "sm_attachmentList":
		showAttachList = true;
		break;
	case "sm_urlList":
	case "sm_ftURLs":
	case "sm_ftABURLs":
		showURLList = true;
		break;
	case "sm_ftTweet":
	case "sm_tweetList":
		showTweetList = true;
		break;
	default:
		showBadCtxt = true;
		debugger;
	}

	skypePref = com.networklighthouse.socialMail.sm_prefManager
			.getBoolPref("extensions.socialmail.skype.enabled");

	document.getElementById("sm_ctxt_openLink").hidden = !showURLList;
	document.getElementById("sm_ctxt_openConv").hidden = !showConvList;
	document.getElementById("sm_ctxt_openContact").hidden = !showContactList;
	document.getElementById("sm_ctxt_openFile").hidden = !showAttachList;
	document.getElementById("sm_ctxt_saveFile").hidden = !showAttachList;
	document.getElementById("sm_ctxt_retweet").hidden = !showTweetList;
	document.getElementById("sm_ctxt_tweetReply").hidden = !showTweetList;
	document.getElementById("sm_ctxt_skype").hidden = !(showPhoneList && skypePref);
	document.getElementById("sm_ctxt_assignMenu").hidden = !showPhoneList;
	document.getElementById("sm_ctxt_urlAssignMenu").hidden = !showURLList;
	document.getElementById("sm_ctxt_copy").hidden = !(showURLList
			|| showPhoneList || showContactList || showConvList || showTweetList);
	document.getElementById("sm_ctxt_add").hidden = !(showURLList || showPhoneList);
	document.getElementById("sm_ctxt_modify").hidden = !(showURLList || showPhoneList);
	document.getElementById("sm_ctxt_remove").hidden = !(showURLList || showPhoneList);

	document.getElementById("sm_ctxt_BadCtxt").hidden = !(showBadCtxt);

}

this.ui.openLink = function(obj) {
	this.actuators.launchURL(this.getValue(obj));
}

this.ui.copy = function(obj) {
	var data = this.getValue(obj);
	var gClipboardHelper = Components.classes["@mozilla.org/widget/clipboardhelper;1"]
			.getService(Components.interfaces.nsIClipboardHelper);
	gClipboardHelper.copyString(data);
}
this.ui.skypeCall = function(obj) {
	var number = this.getValue(obj);
	this.actuators.callSkype(number);
}

this.ui.assignNumber = function(obj, type) {
	// need to get a card/email address;
	var number = this.getValue(obj);
	var email = obj.getAttribute("emailAddr");
	// XXX THIS IS BAD where does emailAddr come from? affects urls
	this.actuators.assignNumber(emailAddr, number, type);
	var otype=obj.getAttribute("type");
	if(otype && type!=otype){
		this.actuators.removeNumber(emailAddr, otype);
	} else if (!otype){
		com.networklighthouse.socialMail.smDB.deleteNumber(email,number);
	}
	email = document.getElementById("sm_name").getAttribute("email");
	com.networklighthouse.socialMail.sm_updateDisplay(email);
}

this.ui.openConversation = function(obj) {
	// var msg = obj.message;
	var msg = obj.message;
	this.actuators.openConversation(msg);
}

this.ui.openMessage = function(obj) {
	// var msg = obj.message;
	debugger;
	var msg = obj.getAttribute("msgURI");
	this.actuators.openMessage(msg);
}


this.ui.openContactView = function(obj) {
	var msg = obj.contact;
	if (msg == null)
		msg = obj.selectedItem.contact;
	this.actuators.openContactView(msg);
}

this.ui.openFile = function(obj) {
	var target;
	if (obj.selectedItem) {
		target = obj.selectedItem;
	} else {
		target = obj;
	}
	this.actuators.openAttachment(target);
}

this.ui.saveFile = function(obj) {
	var target;
	if (obj.selectedItem) {
		target = obj.selectedItem;
	} else {
		target = obj;
	}
	this.actuators.saveAttachment(target);
}
this.ui.addEntry = function(obj) {
	var type;
	id = obj.id;
	if (id == "")
		id = obj.parentNode.id;
	if (id == "")
		id = obj.parentNode.parentNode.id;

	
	switch (id) {
	case "sm_phoneList":
	case "sm_ftColNumbers":
	case "sm_ftNumbers":
		type = "phone";
		break;
	case "sm_ftURLs":
	case "sm_urlList":
		type = "url";
		break;
	default:
		return;
	}
	this.actuators.openModifyDlg("add", type);
}

this.ui.modifyEntry = function(obj) {
	var type;
	id = obj.id;
	if (id == "")
		id = obj.parentNode.id;
	if (id == "")
		id = obj.parentNode.parentNode.id;

	switch (id) {

	case "sm_phoneList":
	case "sm_ftColNumbers":
	case "sm_ftNumbers":
		type = "phone";
		break;
	case "sm_ftURLs":
	case "sm_urlList":
		type = "url";
		break;
	default:
		return;
	}
	data = this.getValue(obj);
	this.actuators.openModifyDlg("modify", type, data);
}

this.ui.removeEntry = function(obj) {
	var type;
	id = obj.id;
	if (id == "")
		id = obj.parentNode.id;
	if (id == "")
		id = obj.parentNode.parentNode.id;

	switch (id) {
	case "sm_phoneList":
	case "sm_ftColNumbers":
	case "sm_ftNumbers":
		type = "phone";
		break;
	case "sm_ftURLs":
	case "sm_urlList":
		type = "url";
		break;
	default:
		return;
	}
	data = this.getValue(obj);
	this.actuators.openModifyDlg("remove", type, data);
}

// XXX THIS NEEDS TO BE CHANGE TO A TIMELINE ENTRY
this.ui.appendErrorMsg = function(msg) {
	var box = document.getElementById("sm_errorBox");
	var lbl = document.createElement("label");
	lbl.setAttribute("value", msg);
	box.appendChild(lbl);
	box.setAttribute("status", "on");
}

this.ui.checkLength=function pnCountNoteChars(evt) {
	// allow non character keys (delete, backspace and and etc.)
	debugger;
	if ((evt.charCode == 0) && (evt.keyCode != 13))
		return true;

	if(evt.target.value.length < evt.target.getAttribute("maxlength")) {
		return true;
	} else {
		return false;
	}
}

this.ui.updateStatus = function() {
	var msg = document.getElementById("sm_update_text").value;
	this.actuators.updateStatus(msg);
	document.getElementById("sm_update_text").value = "";
}

this.ui.updateSocialNets = function() {
	// get rows object
	var rows = document.getElementById("sm_socialNetRows");
	var card = document.getElementById('sm_name').sm_card;

	if (rows.hasChildNodes()) {
		// So, first we check if the object is not empty, if the object has
		// child nodes

		var sn_hash = {};
		// for each child
		var children = rows.childNodes;
		for ( var i = 0; i < children.length; i++) {
			var row = children[i];
			var site = row.childNodes[1].value;
			var profile_url = row.childNodes[2].value;
			var image_url = row.childNodes[3].value;
			var module;
			if (row.modified == true) {
				module = "panel";
			} else {
				module = row.module;
			}
			// get individual parts
			var record = com.networklighthouse.socialMail.buildSNRecord(site,
					profile_url, image_url, module);
			// build sn entry
			sn_hash[profile_url] = record;
			// build sn hash on profile
		}
		// MUST MERGE
		com.networklighthouse.socialMail.mergeSNhash(card, sn_hash, true);
	}

	// lastly hide panel && update display
	document.getElementById("sm_SocialPanel").hidePopup();
	com.networklighthouse.socialMail.sm_updateDisplay(card.primaryEmail);
}

this.ui.launchDiscovery = function() {
	var card = document.getElementById('sm_name').sm_card;
	var sm = com.networklighthouse.socialMail;
	for (moduleNum in sm.modules) {
		var module = sm.modules[moduleNum];
		if (module.collect) {
			// we launch these off the main thread so that they can't hold up
			// the app
			window.setTimeout(module.collect, 5, sm, card);
		}
	}
	document.getElementById("sm_SocialPanel").hidePopup();
}

/*
 * here are actuators that actually do the work
 * 
 */
this.ui.actuators = {}

this.ui.actuators.launchURL = function(url) {
	// XXX need to check that url is prefixed with a protocol, otherwise it
	// doesn't work
	var regexp = /(ftp|http|https):\/\//
	if(regexp.test(url)){
	//do nothing
	}else {
		url="http://"+url;
	}
	messenger.launchExternalURL(url);
}

this.ui.actuators.callSkype = function(number) {
	number = number.replace(/\s/g, "");
	// if number doesn't start with a '+'
	// get the default country code and prefix it
	if (number.charAt(0) != '+') {
		var cc = com.networklighthouse.socialMail.sm_prefManager
				.getCharPref("extensions.socialmail.skype.defaultCC");
		number = "+" + cc + number;
	}
	URI = "skype:" + number + "?call";
	this.launchURL(URI);

}

this.ui.actuators.openConversation = function(message) {
	let tabmail = document.getElementById("tabmail");

	tabmail.openTab("glodaList", {
		conversation :message._conversation,
		message :message,
		// title :message.conversation.subject,
		title :message._subject,
		background :false
	});

	
}

this.ui.actuators.openMessage =function(uri){
	 var messenger = Components.classes['@mozilla.org/messenger;1'].createInstance(Components.interfaces.nsIMessenger);

	 var service = messenger.messageServiceFromURI(uri);

	 var messageHdr = service.messageURIToMsgHdr(uri);
	 
	 MailUtils.displayMessages([messageHdr],gFolderDisplay.view,document.getElementById("tabmail"));

}

this.ui.actuators.openAttachment = function(target) {
	messenger.openAttachment(target.getAttribute("contentType"), target
			.getAttribute("URL"), encodeURIComponent(target
			.getAttribute("filename")), target.getAttribute("msgURI"), false);
}

this.ui.actuators.saveAttachment = function(target) {
	messenger.saveAttachment(target.getAttribute("contentType"), target
			.getAttribute("URL"), encodeURIComponent(target
			.getAttribute("filename")), target.getAttribute("msgURI"), false);
}

this.ui.actuators.openContactView = function(contact) {
	let
	tabmail = document.getElementById("tabmail");
	q = Gloda.newQuery(Gloda.NOUN_MESSAGE);
	q.involves(contact);
	tabmail.openTab("glodaFacet", {
		query :q
	});
}

this.ui.actuators.openModifyDlg = function(task, type, data) {
	// get emailAddr
	emailAddr = document.getElementById("sm_name").getAttribute("email");
	openDialog("chrome://socialMail/content/dlg_modifyEntry.xul",
			"sm_modifyDlg", "", emailAddr, task, type, data);
}

this.ui.actuators.toggleListBox = function(obj) {
	status = obj.getAttribute("status");
	if (status == "off") {
		status = "on";
	} else {
		status = "off";
	}
	obj.setAttribute("status", status);
}

this.ui.actuators.assignNumber = function(emailAddr, number, type) {
	var ab = com.networklighthouse.socialMail.sm_addressbook;

	var card = ab.cardForEmailAddress(emailAddr);
	switch (type) {
	case "home":
		type = "HomePhone";
		break;
	case "work":
		type = "WorkPhone";
		break;
	case "mobile":
		type = "CellularNumber";
		break;
	case "homeURL":
		type = "WebPage2";
		break;
	case "workURL":
		type = "WebPage1";
		break;
	}
	card.setProperty(type, number);
	ab.modifyCard(card);
}

this.ui.actuators.removeNumber = function(emailAddr, type) {
	var ab = com.networklighthouse.socialMail.sm_addressbook;

	var card = ab.cardForEmailAddress(emailAddr);
	switch (type) {
	case "home":
		type = "HomePhone";
		break;
	case "work":
		type = "WorkPhone";
		break;
	case "mobile":
		type = "CellularNumber";
		break;
	case "homeURL":
		type = "WebPage2";
		break;
	case "workURL":
		type = "WebPage1";
		break;
	}
	card.setProperty(type, "");
	ab.modifyCard(card);
}

this.ui.actuators.updateStatus = function(msg) {
	var sm = com.networklighthouse.socialMail;
	for (moduleNum in sm.modules) {
		module = sm.modules[moduleNum];
		if (module.updateStatus) {
			module.updateStatus(msg);
		}
	}
}

this.ui.actuators.changePic = function(obj) {
	card = document.getElementById('sm_name').sm_card;
	card.setProperty("prefImageSrc", obj.label);
	var pic = document.getElementById("sm_profilepic");
	pic.src = obj.value;
	com.networklighthouse.socialMail.sm_addressbook.modifyCard(card);
}

this.ui.getValue = function(obj) {
	debugger;
	value = "";
	switch (obj.nodeName) {
	case "timeEntry":
	case "label":
		value = obj.value;
		break;
	case "description":
		value = obj.textContent;
		if (value == "")
			value = obj.value;
		break;
	case "listitem":
		value = obj.label;
	case "box":
		if (value == "") {
			if (obj.firstChild)
				value = this.getValue(obj.firstChild);
		}
		if (value == "") {
			if (obj.nextSibling)
				value = this.getValue(obj.nextSibling);
		}
		break;
	}
	return value;
}

this.ui.getObject = function(obj, findme) {
	debugger;
	value = null;
	if (obj[findme] != null) {
		value = obj[findme];
	} else if (obj.firstChild) {
		value = this.getObject(obj.firstChild, findme);
	} else if (obj.nextSibling) {
			value = this.getObject(obj.nextSibling, findme);
	}
	return value;
}
