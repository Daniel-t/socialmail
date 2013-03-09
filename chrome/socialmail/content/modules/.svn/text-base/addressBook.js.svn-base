/*
 * abDisplay module for socialMail
 * 
 * Responsible for displaying information from the address book
 * (not for updating it)
 */

/*SocialMail provider template notes
 * a provider must provide the following functions
 *   init(prefs)
 *   cleanup(socilMail)//reset display
 *   collect(socialMail,card)
 *   render(socialMail,card)
 */

this.abDisplay=function(){

	var me={};

	prefs=null;
	me.abManager=null;
	
	me.init=function(smprefs){
		prefs=smprefs;
		this.abManager = Components.classes["@mozilla.org/abmanager;1"].createInstance(Components.interfaces.nsIAbManager);
	}
	
	me.cleanup=function(sm){
		//XXX sm.sm_clearBox("sm_ftNumbers");
		//XXX sm.sm_clearBox("sm_ftABURLs");
	}
	
	me.collect=function(sm,card){
		
	}
	//sm_ftABURLs
	me.render=function(sm,card){
		com.networklighthouse.socialMail.dlog("In abDisplay.render");
		debugger;
		renderPhones(sm,card);
		renderURLs(sm,card);
	}

	renderPhones=function(sm,card){
		if(!prefs.getBoolPref("do_PhoneAB")){
			return false;
		}
			
		//collect data from card/addressbook
		var allAddressBooks = sm.abDisplay.abManager.directories;
		var emailAddr=card.primaryEmail;
		var searchFields=[{search:"HomePhone",title:"Home"},
		                  {search:"WorkPhone",title:"Work"},
		                  {search:"CellularNumber",title:"Mobile"}];
		var holder=[];
		while (allAddressBooks.hasMoreElements()) {
			let ab = allAddressBooks.getNext();
			if (ab instanceof Components.interfaces.nsIAbDirectory && !ab.isRemote) {
				search=ab.cardForEmailAddress(emailAddr);
				if (search){
					for each (field in searchFields) {
						let number=search.getProperty(field.search,"");
						if (number!=""){
							holder.push({type:field.title ,number:number});
						}
					}
				}
			}
		}
		
		// XXX box=document.getElementById("sm_ftNumbers");
		for each (entry in holder){
			var attribs=new Array();
			
			attribs["list"]="sm_phoneList";
			attribs["context"]="sm_contextMnuPhones";
			attribs["image"]="chrome://socialMail/content/media/"+entry.type.toLowerCase()+".png";
			attribs["emailAddr"]=emailAddr;
			attribs["type"]=entry.type;
			com.networklighthouse.socialMail.dlog("adding Entry: "+entry.number);
			com.networklighthouse.socialMail.addTimeEntry(entry.number,null,attribs);
			
			//list, context, image
			/*  XXX --GET RID OF THIS
			document.getElementById("sm_ftNumbersBox").setAttribute("status","on");
			row=document.createElement("row");
			lbl1=document.createElement("label");
			lbl1.setAttribute("value",entry.type);
			lbl1.setAttribute("context","");
			lbl2=document.createElement("label");
			lbl2.setAttribute("value",entry.number);
			lbl2.setAttribute("onclick","com.networklighthouse.socialMail.sm_phoneListClick(event);");
			row.appendChild(lbl1);
			row.appendChild(lbl2);
			box.appendChild(row);
			*/
		}	
		
	}

	renderURLs=function(sm,card){
		if(!prefs.getBoolPref("do_URLAB")){
			return false;
		}
			
		//collect data from card/addressbook
		var allAddressBooks = sm.abDisplay.abManager.directories;
		var emailAddr=card.primaryEmail;
		var searchFields=[{search:"WebPage2",title:"Home"},
		                  {search:"WebPage1",title:"Work"}];
		var holder=[];
		while (allAddressBooks.hasMoreElements()) {
			let ab = allAddressBooks.getNext();
			if (ab instanceof Components.interfaces.nsIAbDirectory && !ab.isRemote) {
				search=ab.cardForEmailAddress(emailAddr);
				if (search){
					for each (field in searchFields) {
						let number=search.getProperty(field.search,"");
						if (number!=""){
							holder.push({type:field.title ,number:number});
						}
					}
				}
			}
		}
		
		//XXX box=document.getElementById("sm_ftABURLs");
		for each (entry in holder){

			var attribs=new Array();
			//add icons -> see phone handling
			attribs["list"]="sm_urlList";
			attribs["context"]="";
			attribs["image"]="chrome://socialMail/content/media/"+entry.type.toLowerCase()+".png";
			attribs['onclick']="com.networklighthouse.socialMail.ui.sm_urlListClick(event)";
			attribs["type"]=entry.type;
			com.networklighthouse.socialMail.dlog("adding Entry: "+entry.number);
			com.networklighthouse.socialMail.addTimeEntry(entry.number,null,attribs);
			
		}	
		
	}
	
	return me;
}()


this.modules.push(this.abDisplay);