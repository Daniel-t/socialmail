/* oauthTokenMgr is designed to handle storing of OAuth tokens and secrets in the 
 * mozilla password manager.  It does not handle any Oauth negotiation.
 */


var EXPORTED_SYMBOLS = ["oauthTokenMgr"];


/* CONSTRUCTOR */

function oauthTokenMgr(realm)
{
	this.mService	= "chrome://socialMail/oauth";
	this.mRealm		= realm;
	this.pwdMgr 	= Components.classes["@mozilla.org/login-manager;1"].getService(Components.interfaces.nsILoginManager);  
	
	this.store=function(token,secret){
		var nsLoginInfo 	= new Components.Constructor("@mozilla.org/login-manager/loginInfo;1",
				Components.interfaces.nsILoginInfo,"init");  

		var loginInfo = new nsLoginInfo(this.mService, null, this.mRealm, token, secret,"", ""); 
		this._search(loginInfo);
	}
	
	this.retreive=function(){
		var logins = this.pwdMgr.findLogins({}, this.mService, null, this.mRealm);  	         
		var token=null;
		var secret=null;
		for (var i = 0; i < logins.length; i++) {  
			token=logins[i].username;
			secret= logins[i].password;  
			break;  
		}  
		var out={};
		out.token=token;
		out.secret=secret;
		return out;
	}
	
	this.delete=function(){
		this._search();
	}	
	
	this._search=function(data){
		var logins = this.pwdMgr.findLogins({}, this.mService, null, this.mRealm);  
		for (var i = 0; i < logins.length; i++) {
			this.pwdMgr.removeLogin(logins[i]);
		}  
		if (data!=null){
			this.pwdMgr.addLogin(data); 
		}
	}
}
