/* ***** BEGIN LICENSE BLOCK ********
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is PlanTwit.
 *
 * The Initial Developer of the Original Code is
 * Pages Jaunes.
 * Portions created by the Initial Developer are Copyright (C) 2008-2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Daniel Glazman <daniel.glazman@disruptive-innovations.com>, Original author
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */
var EXPORTED_SYMBOLS = ["LinkedInHelper"];

Components.utils.import("resource://resources/oauth.js");

if (typeof JSON == "undefined")
  Components.utils.import("resource://gre/modules/JSON.jsm");

/* CONSTRUCTOR */

function LinkedInHelper(consumer, aThrobber)
{
  this.mConsumer=consumer;
 
  this.mThrobber = aThrobber;

  this.mServiceName = "LinkedIn";

  this.mBaseURL = "http://api.linkedin.com/v1/"; 
}

/* PRIVATE */

LinkedInHelper.prototype._localizedError =
function(aServiceName, aStringName)
{
  var s = "";
  switch (aStringName)
  {
    case "resp304": s = "Not Modified: there was no new data to return."; break;
    case "resp400": s = "Bad Request: your request is invalid, did you exceed the rate limit?"; break;
    case "resp401": s = "Not Authorized: either you need to provide authentication credentials, or the credentials provided aren't valid."; break;
    case "resp403": s = "Forbidden: access denied to requested data."; break;
    case "resp404": s = "Not Found: either you're requesting an invalid URI or the resource in question doesn't exist (ex: no such user). "; break;
    case "resp500": s = "Internal Server Error"; break;
    case "resp502": s = "Bad Gateway: returned if the service is down or being upgraded."; break;
    case "resp503": s = "Service Unavailable: the servers are up, but are overloaded with requests.  Try again later."; break;

    case "MissingIdParameter": s = "Missing id parameter"; break;
    case "EmptyStatus":        s = "Cannot update with empty status"; break;
    case "EmptyDMRecipient":   s = "Empty recipient for Direct Message"; break;
    case "EmptyDMText":        s = "Empty text for Direct Message"; break;
    case "MissingUserForFriendshipTest": s = "Cannot test friendship because one user parameter is missing"; break;
    case "WrongDevice":        s = "Trying to update unknown device"; break;
    case "NothingToUpdateProfileColors": s = "Nothing to update, all colors are empty"; break;
    default: break;
  }

  Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
    .getService(Components.interfaces.nsIPromptService)
    .alert(null, aServiceName, s);
}

LinkedInHelper.prototype._onreadystatechangeTwitter =
function(aXmlRequest, aCallback, aErrorCallback, aContext, aLinkedInHelper)
{
  if (aXmlRequest.readyState == "4")
  {
    if (this.mThrobber)
      this.mThrobber.setAttribute("hidden", "true");

    // http://apiwiki.twitter.com/REST+API+Documentation#HTTPStatusCodes
    switch(aXmlRequest.status)
    {
      case 200: // OK
        if (aCallback)
        {
          if (aXmlRequest.responseXML)
            aCallback(aLinkedInHelper, aXmlRequest.responseXML, aContext);
          else
          {
            aCallback(aLinkedInHelper, aXmlRequest.responseText, aContext);
          }
        }
        break;
      case 304: // NOT MODIFIED
      case 400: // BAD REQUEST
      case 401: // NOT AUTHORIZED
      case 403: // FORBIDDEN
      case 404: // NOT FOUND
      case 500: // INTERNAL SERVER ERROR
      case 502: // BAD GATEWAY
      case 503: // SERVICE UNAVAILABLE
        //aLinkedInHelper._localizedError(aLinkedInHelper.mServiceName, "resp" + aXmlRequest.status);
        if (aErrorCallback)
          aErrorCallback(aLinkedInHelper, aXmlRequest, aContext);
        break;
      default: break;
    }
  }
}

LinkedInHelper.prototype._getXmlRequest =
function(aFeedURL, aCallback, aErrorCallback, aContext)
{
  if (this.mThrobber)
    this.mThrobber.removeAttribute("hidden");

  // we can't use |new XMLHttpRequest()| in a JS module...
  var xmlRequest = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"]
                     .createInstance(Components.interfaces.nsIXMLHttpRequest);
  var _self = this;
  xmlRequest.onreadystatechange = function() { _self._onreadystatechangeTwitter(xmlRequest, aCallback, aErrorCallback, aContext, _self); };
  xmlRequest.mozBackgroundRequest = true;
  xmlRequest.open("GET", aFeedURL, true);
  //xmlRequest.setRequestHeader("If-Modified-Since", "Sat, 1 Jan 2005 00:00:00 GMT");
  xmlRequest.channel.loadFlags |= Components.interfaces.nsIRequest.LOAD_BYPASS_CACHE;
  if (xmlRequest.channel instanceof Components.interfaces.nsISupportsPriority)
    xmlRequest.channel.priority = Components.interfaces.nsISupportsPriority.PRIORITY_LOWEST;

  return xmlRequest;
}

LinkedInHelper.prototype._postXmlRequest =
function(aFeedURL, aCallback, aErrorCallback, aContext)
{
  if (this.mThrobber)
    this.mThrobber.removeAttribute("hidden");

  // we can't use |new XMLHttpRequest()| in a JS module...
  var xmlRequest = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"]
                     .createInstance(Components.interfaces.nsIXMLHttpRequest);

  var _self = this;
  xmlRequest.onreadystatechange = function() { _self._onreadystatechangeTwitter(xmlRequest, aCallback, aErrorCallback, aContext, _self); };
 
  xmlRequest.mozBackgroundRequest = true;
  xmlRequest.open("POST", aFeedURL, true);
  xmlRequest.setRequestHeader("If-Modified-Since", "Sat, 1 Jan 2005 00:00:00 GMT");

  return xmlRequest;
}

LinkedInHelper.prototype._sendRequest =
function(aURL, aCallback, aErrorCallback, aAuthenticated, aContext)
{
	var message = { action: aURL
            , method: "GET"
            , parameters: []
            };
     OAuth.completeRequest(message,this.mConsumer);
     url=OAuth.addToURL(message.action,message.parameters);
  var xmlRequest = this._getXmlRequest(message.action, aCallback, aErrorCallback, aContext);
  //if (aAuthenticated)
    //xmlRequest.setRequestHeader("Authorization", "Basic " + this.mAuthorization);
  xmlRequest.setRequestHeader("Authorization", OAuth.getAuthorizationHeader("", message.parameters) );
  //XXX OAUTH Integration point
  
  xmlRequest.send(null);
}

LinkedInHelper.prototype._sendPostRequest =
function(aURL, aCallback, aErrorCallback, aAuthenticated, aContext,aData)
{
	var message = { action: aURL
            , method: "POST"
            , parameters: []
            };
     OAuth.completeRequest(message,this.mConsumer);
     //var url=OAuth.addToURL(message.action,message.parameters);
     
  var xmlRequest = this._postXmlRequest(message.action, aCallback, aErrorCallback, aContext);
  //if (aAuthenticated)
  //  xmlRequest.setRequestHeader("Authorization", "Basic " + this.mAuthorization);
  xmlRequest.setRequestHeader("Authorization", OAuth.getAuthorizationHeader("", message.parameters) );
  if(aData==null){
	  xmlRequest.setRequestHeader("Content-length", 0);
  } else {
	  xmlRequest.setRequestHeader("Content-length", aData.length);
  }
  //XXX OAUTH Integration point
  xmlRequest.send(aData);
}

LinkedInHelper.prototype._addParamToQueryURL =
function(aURL, aPreCondition, aParam, aStringParam)
{
  var url = aURL;
  if (aParam)
  {
    if (aPreCondition)
      url += "&";
    else
      url += "?";
    url += aStringParam + "=" + escape(aParam.toString().replace( / /g, "+"));
  }
  return url;
}

/* MEMBERS */

/* STATUSES REQUESTS */

LinkedInHelper.prototype.profile = function(aCallback, aErrorCallback, aContext, aProfile)
{
  var feedURL = this.mBaseURL + "people/" + aProfile;
  this._sendRequest(feedURL, aCallback, aErrorCallback, true, aContext);
}

LinkedInHelper.prototype.inviteByEmail=function(aCallback,aErrorCallback,aContext,aEmailAddr,aFirstName,aLastName,aSubject,aBody){
	var inviteText="<mailbox-item><recipients><recipient><person path='#path here'><first-name>#firstname</first-name><last-name>#lastname</last-name></person></recipient></recipients><subject>#subject</subject><body>#body</body><item-content><invitation-request><connect-type>friend</connect-type></invitation-request></item-content></mailbox-item>";

	parser=Components.classes["@mozilla.org/xmlextras/domparser;1"].createInstance(Components.interfaces.nsIDOMParser);
 
	xmlDoc=parser.parseFromString(inviteText,"text/xml");
	
	iterator=xmlDoc.evaluate("/mailbox-item/recipients/recipient/person",xmlDoc,null,4,null)

	node=iterator.iterateNext();
	node.setAttribute("path","/people/email="+aEmailAddr);
	node.childNodes[0].textContent=aFirstName;
	node.childNodes[1].textContent=aLastName;
	
	iterator=xmlDoc.evaluate("/mailbox-item/subject",xmlDoc,null,4,null)
	node=iterator.iterateNext();
	node.textContent=aSubject;
	
	iterator=xmlDoc.evaluate("/mailbox-item/body",xmlDoc,null,4,null)
	node=iterator.iterateNext();
	node.textContent=aBody;

	var serializer = Components.classes["@mozilla.org/xmlextras/xmlserializer;1"].createInstance(Components.interfaces.nsIDOMSerializer);
	var aData = serializer.serializeToString(xmlDoc);

	var feedURL = this.mBaseURL + "people/~/mailbox"
	this._sendPostRequest(feedURL, aCallback, aErrorCallback, true, aContext,aData);
}

/*
LinkedInHelper.prototype.statuses.user_timeline =
function(aCallback, aErrorCallback, aContext, aFormat, aUserId, aSince, aSinceId, aCount, aPage)
{
  var feedURL;
  if (aUserId)
    feedURL = this._self.mBaseURL + "statuses/user_timeline/" + aUserId + "." + aFormat;
  else
    feedURL = this._self.mBaseURL + "statuses/user_timeline." + aFormat;

  feedURL = this._self._addParamToQueryURL(feedURL, false, aSince, "since");
  feedURL = this._self._addParamToQueryURL(feedURL, aSince, aSinceId, "since_id");
  feedURL = this._self._addParamToQueryURL(feedURL, aSince || aSinceId, aCount, "count");
  feedURL = this._self._addParamToQueryURL(feedURL, aSince || aSinceId || aCount, aPage, "page");

  this._self._sendRequest(feedURL, aCallback, aErrorCallback, true, aContext);
}

LinkedInHelper.prototype.statuses.friends =
function(aCallback, aErrorCallback, aContext, aFormat, aUserId, aPage)
{
  var feedURL;
  if (aUserId)
    feedURL = this._self.mBaseURL + "statuses/friends/" + aUserId + "." + aFormat;
  else
    feedURL = this._self.mBaseURL + "statuses/friends." + aFormat;

  feedURL = this._self._addParamToQueryURL(feedURL, false, aPage, "page");

  this._self._sendRequest(feedURL, aCallback, aErrorCallback, true, aContext);
}

LinkedInHelper.prototype.statuses.followers =
function(aCallback, aErrorCallback, aContext, aFormat, aUserId, aPage)
{
  var feedURL;
  if (aUserId)
    feedURL = this._self.mBaseURL + "statuses/followers/" + aUserId + "." + aFormat;
  else
    feedURL = this._self.mBaseURL + "statuses/followers." + aFormat;

  feedURL = this._self._addParamToQueryURL(feedURL, false, aPage, "page");

  this._self._sendRequest(feedURL, aCallback, aErrorCallback, true, aContext);
}

LinkedInHelper.prototype.statuses.show =
function(aCallback, aErrorCallback, aContext, aFormat, aId)
{
  if (!aId)
  {
    this._self._localizedError(this._self.mServiceName, "MissingIdParameter");
    return;
  }

  var feedURL = this._self.mBaseURL + "statuses/show." + aFormat;
  feedURL += "?id=" + aId;

  this._self._sendRequest(feedURL, aCallback, aErrorCallback, true, aContext);
}

LinkedInHelper.prototype.statuses.replies =
function(aCallback, aErrorCallback, aContext, aFormat, aSince, aSinceId, aPage)
{
  var feedURL = this._self.mBaseURL + "statuses/replies." + aFormat;

  feedURL = this._self._addParamToQueryURL(feedURL, false, aSince, "since");
  feedURL = this._self._addParamToQueryURL(feedURL, aSince, aSinceId, "since_id");
  feedURL = this._self._addParamToQueryURL(feedURL, aSince || aSinceId, aPage, "page");

  this._self._sendRequest(feedURL, aCallback, aErrorCallback, true, aContext);
}

LinkedInHelper.prototype.statuses.destroy =
function(aCallback, aErrorCallback, aContext, aFormat, aId)
{
  if (!aId)
  {
    this._self._localizedError(this._self.mServiceName, "MissingIdParameter");
    return;
  }

  var feedURL = this._self.mBaseURL + "statuses/destroy/" + aId + "." + aFormat;

  this._self._sendPostRequest(feedURL, aCallback, aErrorCallback, true, aContext);
}

LinkedInHelper.prototype.statuses.public_timeline =
function(aCallback, aErrorCallback, aContext, aFormat)
{
  var feedURL = this._self.mBaseURL + "statuses/public_timeline." + aFormat;
  this._self._sendRequest(feedURL, aCallback, aErrorCallback, false, aContext);
}

LinkedInHelper.prototype.statuses.update =
function(aCallback, aErrorCallback, aContext, aFormat, aText, aInReplyToStatusId, aSource)
{
  if (!aText)
  {
    this._self._localizedError(this._self.mServiceName, "EmptyStatus");
    return;
  }

  var feedURL = this._self.mBaseURL + "statuses/update." + aFormat;
  feedURL += "?status=" + escape(aText);
  feedURL = this._self._addParamToQueryURL(feedURL, true, aInReplyToStatusId, "in_reply_to_status_id");
  feedURL = this._self._addParamToQueryURL(feedURL, true, aSource, "source");

  this._self._sendPostRequest(feedURL, aCallback, aErrorCallback, true, aContext);
}


///* USERS REQUESTS *

LinkedInHelper.prototype.users.show =
function(aCallback, aErrorCallback, aContext, aFormat, aUserId, aEmail)
{
  if (!aUserId && !aEmail)
  {
    this._self._localizedError(this._self.mServiceName, "MissingIdParameter");
    return;
  }

  var feedURL;
  if (!aEmail)
    feedURL = this._self.mBaseURL + "users/show/" + aUserId + "." + aFormat;
  else
  {
    feedURL = this._self.mBaseURL + "users/show." + aFormat;
    feedURL = this._self._addParamToQueryURL(feedURL, false, aEmail, "email");
  }

  this._self._sendRequest(feedURL, aCallback, aErrorCallback, true, aContext);
}

/* DIRECT_MESSAGES REQUESTS *

LinkedInHelper.prototype.direct_messages.inbox =
function(aCallback, aErrorCallback, aContext, aFormat, aSince, aSinceId, aPage)
{
  var feedURL = this._self.mBaseURL + "direct_messages." + aFormat;

  feedURL = this._self._addParamToQueryURL(feedURL, false, aSince, "since");
  feedURL = this._self._addParamToQueryURL(feedURL, aSince, aSinceId, "since_id");
  feedURL = this._self._addParamToQueryURL(feedURL, aSince || aSinceId, aPage, "page");

  this._self._sendRequest(feedURL, aCallback, aErrorCallback, true, aContext);
}

LinkedInHelper.prototype.direct_messages.sent =
function(aCallback, aErrorCallback, aContext, aFormat, aSince, aSinceId, aPage)
{
  var feedURL = this._self.mBaseURL + "direct_messages/sent." + aFormat;

  feedURL = this._self._addParamToQueryURL(feedURL, false, aSince, "since");
  feedURL = this._self._addParamToQueryURL(feedURL, aSince, aSinceId, "since_id");
  feedURL = this._self._addParamToQueryURL(feedURL, aSince || aSinceId, aPage, "page");

  this._self._sendRequest(feedURL, aCallback, aErrorCallback, true, aContext);
}

LinkedInHelper.prototype.direct_messages.new =
function(aCallback, aErrorCallback, aContext, aFormat, aUser, aText)
{
  if (!aUser)
  {
    this._self._localizedError(this._self.mServiceName, "EmptyDMRecipient");
    return;
  }
  if (!aText)
  {
    this._self._localizedError(this._self.mServiceName, "EmptyDMText");
    return;
  }
  var feedURL = this._self.mBaseURL + "direct_messages/new." + aFormat;

  feedURL = this._self._addParamToQueryURL(feedURL, false, aUser, "user");
  feedURL = this._self._addParamToQueryURL(feedURL, true,  aText, "text");

  this._self._sendPostRequest(feedURL, aCallback, aErrorCallback, true, aContext);
}

LinkedInHelper.prototype.direct_messages.destroy =
function(aCallback, aErrorCallback, aContext, aFormat, aId)
{
  if (!aId)
  {
    this._self._localizedError(this._self.mServiceName, "MissingIdParameter");
    return;
  }

  var feedURL = this._self.mBaseURL + "direct_messages/destroy/" + aId + "." + aFormat;

  this._self._sendPostRequest(feedURL, aCallback, aErrorCallback, true, aContext);
}

///* FRIENDSHIPS REQUESTS *

LinkedInHelper.prototype.friendships.create =
function(aCallback, aErrorCallback, aContext, aFormat, aId, aFollow)
{
  if (!aId)
  {
    this._self._localizedError(this._self.mServiceName, "MissingIdParameter");
    return;
  }

  var feedURL = this._self.mBaseURL + "friendships/create/" + aId + "." + aFormat;

  feedURL = this._self._addParamToQueryURL(feedURL, false, aFollow, "follow");

  this._self._sendPostRequest(feedURL, aCallback, aErrorCallback, true, aContext);
}

LinkedInHelper.prototype.friendships.destroy =
function(aCallback, aErrorCallback, aContext, aFormat, aId)
{
  if (!aId)
  {
    this._self._localizedError(this._self.mServiceName, "MissingIdParameter");
    return;
  }

  var feedURL = this._self.mBaseURL + "friendships/destroy/" + aId + "." + aFormat;

  this._self._sendPostRequest(feedURL, aCallback, aErrorCallback, true, aContext);
}

LinkedInHelper.prototype.friendships.exists =
function(aCallback, aErrorCallback, aContext, aFormat, aUserA, aUserB)
{
  if (!aUserA || !aUserB)
  {
    this._self._localizedError(this._self.mServiceName, "MissingUserForFriendshipTest");
    return;
  }

  var feedURL = this._self.mBaseURL + "friendships/exists." + aFormat;

  feedURL = this._self._addParamToQueryURL(feedURL, false, aUserA, "user_a");
  feedURL = this._self._addParamToQueryURL(feedURL, true,  aUserB, "user_b");

  this._self._sendRequest(feedURL, aCallback, aErrorCallback, true, aContext);
}

///* FRIENDS REQUESTS *

LinkedInHelper.prototype.friends.ids =
function(aCallback, aErrorCallback, aContext, aFormat, aId)
{
  var feedURL;
  if (aId)
    feedURL = this._self.mBaseURL + "friends/ids/" + aId + "." + aFormat;
  else
    feedURL = this._self.mBaseURL + "friends/ids." + aFormat;

  this._self._sendRequest(feedURL, aCallback, aErrorCallback, true, aContext);
}

/* FOLLOWERS REQUESTS /

LinkedInHelper.prototype.followers.ids =
function(aCallback, aErrorCallback, aContext, aFormat, aId)
{
  var feedURL;
  if (aId)
    feedURL = this._self.mBaseURL + "followers/ids/" + aId + "." + aFormat;
  else
    feedURL = this._self.mBaseURL + "followers/ids." + aFormat;

  this._self._sendRequest(feedURL, aCallback, aErrorCallback, true, aContext);
}
*/
/* ACCOUNT REQUESTS /

LinkedInHelper.prototype.account.verify_credentials =
function(aCallback, aErrorCallback, aContext, aFormat)
{
  var feedURL = this._self.mBaseURL + "account/verify_credentials." + aFormat;

  this._self._sendRequest(feedURL, aCallback, aErrorCallback, true, aContext);
}

/*
LinkedInHelper.prototype.account.end_session =
function(aCallback, aErrorCallback, aContext, aFormat)
{
  var feedURL = this._self.mBaseURL + "account/end_session." + aFormat;

  this._self._sendPostRequest(feedURL, aCallback, aErrorCallback, true, aContext);
}

LinkedInHelper.prototype.account.update_delivery_device =
function(aCallback, aErrorCallback, aContext, aFormat, aDevice)
{
  if (aDevice != "sms" && aDevice != "im" && aDevice != "none")
  {
    this._self._localizedError(this._self.mServiceName, "WrongDevice");
    return;
  }
  var feedURL = this._self.mBaseURL + "account/update_delivery_device." + aFormat;

  feedURL = this._self._addParamToQueryURL(feedURL, false, aDevice, "device");

  this._self._sendPostRequest(feedURL, aCallback, aErrorCallback, true, aContext);
}

LinkedInHelper.prototype.account.update_profile_colors =
function(aCallback, aErrorCallback, aContext, aFormat, aBackgroundColor, aTextColor, aLinkColor,
         aSidebarFillColor, aSidebarBorderColor)
{
  if (!aBackgroundColor && !aTextColor && !aLinkColor && !aSidebarFillColor && !aSidebarBorderColor)
  {
    this._self._localizedError(this._self.mServiceName, "NothingToUpdateProfileColors");
    return;
  }

  var feedURL = this._self.mBaseURL + "account/update_profile_colors." + aFormat;

  feedURL = this._self._addParamToQueryURL(feedURL, false,
                                     aBackgroundColor, "profile_background_color");
  feedURL = this._self._addParamToQueryURL(feedURL, aBackgroundColor,
                                     aTextColor, "profile_text_color");
  feedURL = this._self._addParamToQueryURL(feedURL, aBackgroundColor || aTextColor,
                                     aLinkColor, "profile_link_color");
  feedURL = this._self._addParamToQueryURL(feedURL, aBackgroundColor || aTextColor || aLinkColor,
                                     aSidebarFillColor, "profile_sidebar_fill_color");
  feedURL = this._self._addParamToQueryURL(feedURL, aBackgroundColor || aTextColor || aLinkColor || aSidebarFillColor,
                                     aSidebarBorderColor, "profile_sidebar_border_color");

  this._self._sendPostRequest(feedURL, aCallback, aErrorCallback, true, aContext);
}

LinkedInHelper.prototype.account.rate_limit_status =
function(aCallback, aErrorCallback, aContext, aFormat)
{
  var feedURL = this._self.mBaseURL + "account/rate_limit_status." + aFormat;

  this._self._sendRequest(feedURL, aCallback, aErrorCallback, true, aContext);
}

LinkedInHelper.prototype.account.update_profile =
function(aCallback, aErrorCallback, aContext, aFormat, aName, aEmail, aUrl, aLocation, aDescription)
{
  var feedURL = this._self.mBaseURL + "account/update_profile." + aFormat;

  feedURL = this._self._addParamToQueryURL(feedURL, false,
                                     aName, "name");
  feedURL = this._self._addParamToQueryURL(feedURL, aName,
                                     aEmail, "email");
  feedURL = this._self._addParamToQueryURL(feedURL, aName || aEmail,
                                     aUrl, "url");
  feedURL = this._self._addParamToQueryURL(feedURL, aName || aEmail || aUrl,
                                     aLocation, "location");
  feedURL = this._self._addParamToQueryURL(feedURL, aName || aEmail || aUrl || aLocation,
                                     aDescription, "description");

  this._self._sendPostRequest(feedURL, aCallback, aErrorCallback, true, aContext);
}

///* FAVORITES REQUESTS /

LinkedInHelper.prototype.favorites.favorites =
function(aCallback, aErrorCallback, aContext, aFormat, aUserId, aPage)
{
  var feedURL;
  if (aUserId)
    feedURL = this._self.mBaseURL + "favorites/" + aUserId + "." + aFormat;
  else
    feedURL = this._self.mBaseURL + "favorites." + aFormat;

  feedURL = this._self._addParamToQueryURL(feedURL, false, aPage, "page");

  this._self._sendRequest(feedURL, aCallback, aErrorCallback, true, aContext);
}

LinkedInHelper.prototype.favorites.create =
function(aCallback, aErrorCallback, aContext, aFormat, aId)
{
  if (!aId)
  {
    this._self._localizedError(this._self.mServiceName, "MissingIdParameter");
    return;
  }

  var feedURL = this._self.mBaseURL + "favorites/create/" + aId + "." + aFormat;

  this._self._sendPostRequest(feedURL, aCallback, aErrorCallback, true, aContext);
}

LinkedInHelper.prototype.favorites.destroy =
function(aCallback, aErrorCallback, aContext, aFormat, aId)
{
  if (!aId)
  {
    this._self._localizedError(this._self.mServiceName, "MissingIdParameter");
    return;
  }

  var feedURL = this._self.mBaseURL + "favorites/destroy/" + aId + "." + aFormat;

  this._self._sendPostRequest(feedURL, aCallback, aErrorCallback, true, aContext);
}

/* NOTIFICATIONS REQUEST /

LinkedInHelper.prototype.notifications.follow =
function(aCallback, aErrorCallback, aContext, aFormat, aId)
{
  if (!aId)
  {
    this._self._localizedError(this._self.mServiceName, "MissingIdParameter");
    return;
  }

  var feedURL = this._self.mBaseURL + "notifications/follow/" + aId + "." + aFormat;

  this._self._sendPostRequest(feedURL, aCallback, aErrorCallback, true, aContext);
}

LinkedInHelper.prototype.notifications.leave =
function(aCallback, aErrorCallback, aContext, aFormat, aId)
{
  if (!aId)
  {
    this._self._localizedError(this._self.mServiceName, "MissingIdParameter");
    return;
  }

  var feedURL = this._self.mBaseURL + "notifications/leave/" + aId + "." + aFormat;

  this._self._sendPostRequest(feedURL, aCallback, aErrorCallback, true, aContext);
}

///* BLOCKS REQUESTS /

LinkedInHelper.prototype.blocks.create =
function(aCallback, aErrorCallback, aContext, aFormat, aId)
{
  if (!aId)
  {
    this._self._localizedError(this._self.mServiceName, "MissingIdParameter");
    return;
  }

  var feedURL = this._self.mBaseURL + "blocks/create/" + aId + "." + aFormat;

  this._self._sendPostRequest(feedURL, aCallback, aErrorCallback, true, aContext);
}

LinkedInHelper.prototype.blocks.destroy =
function(aCallback, aErrorCallback, aContext, aFormat, aId)
{
  if (!aId)
  {
    this._self._localizedError(this._self.mServiceName, "MissingIdParameter");
    return;
  }

  var feedURL = this._self.mBaseURL + "blocks/destroy/" + aId + "." + aFormat;

  this._self._sendPostRequest(feedURL, aCallback, aErrorCallback, true, aContext);
}

///* HELP REQUESTS /

LinkedInHelper.prototype.help.test =
function(aCallback, aErrorCallback, aContext, aFormat)
{
  var feedURL = this._self.mBaseURL + "help/test." + aFormat;

  this._self._sendRequest(feedURL, aCallback, aErrorCallback, true, aContext);
}

///* UTILITIES /

LinkedInHelper.prototype.isMention =
function(aText)
{
  var matches = aText.match( /(@\w*)/g );

  for (var i = 0; i < matches.length; i++)
    if (matches[i] == "@" + this.mAccount)
      return true;
  return false;    
}

*/

LinkedInHelper.getAuthUrl=function(consumer,callback){
	//we are trying to get a new token so clear out the old stuff
	consumer.accessToken="";
	consumer.accessTokenSecret="";
	
	var message = { action: consumer.serviceProvider.requestTokenURL
    	, method: "POST"
        , parameters: [] };
	OAuth.completeRequest(message,consumer);
	var aCallback=function(answer){
		consumer.accessToken=getURLParam(answer,"oauth_token");
		consumer.accessTokenSecret=getURLParam(answer,"oauth_token_secret");
		callback(consumer.serviceProvider.userAuthorizationURL+"?oauth_token="+consumer.accessToken);
	};
	
    //var url=OAuth.addToURL(message.action,message.parameters);
    var xmlRequest = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"]
                     .createInstance(Components.interfaces.nsIXMLHttpRequest);
	var _self = this;
 	xmlRequest.onreadystatechange = function() { if(this.readyState==4)aCallback(this.responseText) };
 	xmlRequest.mozBackgroundRequest = true;
 	xmlRequest.open("POST", message.action, true);
 	xmlRequest.setRequestHeader("Authorization", OAuth.getAuthorizationHeader("", message.parameters) );
 	xmlRequest.send();
    
}

LinkedInHelper.getAccessToken=function(consumer,verifier,callback){
	var message = { action: consumer.serviceProvider.accessTokenURL
    	, method: "POST"
        , parameters: [] };
        
    OAuth.setParameter(message, "oauth_verifier", verifier);
	OAuth.completeRequest(message,consumer);
	var aCallback=function(answer){
		consumer.accessToken=getURLParam(answer,"oauth_token");
		consumer.accessTokenSecret=getURLParam(answer,"oauth_token_secret");
		callback(consumer);
		};
	
	//var url=OAuth.addToURL(message.action,message.parameters);
    var xmlRequest = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"]
                     .createInstance(Components.interfaces.nsIXMLHttpRequest);
	var _self = this;
 	xmlRequest.onreadystatechange = function() { if(this.readyState==4)aCallback(this.responseText) };
 	xmlRequest.mozBackgroundRequest = true;
 	xmlRequest.open("POST", message.action, true);
 	xmlRequest.setRequestHeader("Authorization", OAuth.getAuthorizationHeader("", message.parameters) );
 	xmlRequest.send();
	
	
	}

function getURLParam(url,strParamName){
  var strReturn = "";
  var strHref = url;
    var strQueryString = url;
    var aQueryString = strQueryString.split("&");
    for ( var iParam = 0; iParam < aQueryString.length; iParam++ ){
      if (aQueryString[iParam].indexOf(strParamName + "=") > -1 ){
        var aParam = aQueryString[iParam].split("=");
        strReturn = aParam[1];
        break;
      }
  }
  return unescape(strReturn);
} 