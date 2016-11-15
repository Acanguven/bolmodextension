var cursorX;
var cursorY;
window.onmousemove = function(e){
    cursorX = e.pageX;
    cursorY = e.pageY;
}


var editor = false;
var searchStarted = false;
var searchString = "";
var spacePressed = 0;
var ckInstanceOnSearch = false;
var ckeditorFinder = setInterval(function(){
	if(typeof CKEDITOR != "undefined"){
		var event = new CustomEvent("cktunnel");
		for(var x in CKEDITOR.instances){
			editor = CKEDITOR.instances[x]
			var updateCK = new CustomEvent("ckData",{detail:CKEDITOR.instances[x].getData()});
            window.dispatchEvent(updateCK);
			CKEDITOR.instances[x].document.on('keyup', function(event) {
                var updateCK = new CustomEvent("ckData",{detail:CKEDITOR.instances[x].getData()});
                window.dispatchEvent(updateCK);
            });
			break;
		}
		attachShittyEvent();
		window.dispatchEvent(event);	  
		clearInterval(ckeditorFinder);
    }
},100)

function attachShittyEvent(){
	for(var x in CKEDITOR.instances){
		CKEDITOR.instances[x].document.on( 'keyup', function (event) {
			if(event.data.$.keyCode == 8 && searchStarted){
				searchString = searchString.substring(0, searchString.length-1);
				updateSearch(searchString);
			}
		});
		CKEDITOR.instances[x].document.on( 'keypress', function (event) {
		    if ( event.data.$.keyCode == 64 ){
		    	if(!searchStarted){
		    		searchString = "";
		    		searchStarted = true;
		    		ckInstanceOnSearch =  CKEDITOR.instances[x];
		    		spacePressed = 0;
		    	}else{
		    		searchString = "";
		    		spacePressed = 0;
		    	}
		    	showSearch(searchStarted);
		    }else{
		    	if (searchStarted) {
			    	searchString = searchString + String.fromCharCode(event.data.$.keyCode);
			    	if(event.data.$.keyCode == 32){
			    		if(spacePressed === 1){
				    		searchStarted = false;
				    		ckInstanceOnSearch =  false;
				    		spacePressed = 0;
				    		showSearch(searchStarted);
			    		}else{
			    			spacePressed++;
			    		}
			    	}else{
			    		if (searchString.length >= 3){
			    			updateSearch(searchString);
			    		}
			    	}
		    	}
		    }
		    
		});
	}
}

function showSearch(show){
	if(show){
		document.getElementById("searchUsersList").innerHTML = "";
		var x = cursorX + 'px';
		var y = cursorY + 'px';
		document.getElementById("searchBoxUser").style.display = "block";
		document.getElementById("searchBoxUser").style.left = x;
		document.getElementById("searchBoxUser").style.top = y;
	}else{
		document.getElementById("searchBoxUser").style.display = "none";
	}
}

function updateSearch(){
	var url = "https://forum.botoflegends.com/index.php?s="+ipb.vars['session_id']+"&app=core&module=ajax&section=findnames&do=get-member-names&secure_key="+ipb.vars['secure_hash']+"&name="+searchString;
	new Ajax.Request( url, {
		method:  'get',
		onSuccess:  function(response){
			var responseObject = JSON.parse(response.responseText);
			var innerHtml = "";
			if(!responseObject.error && Object.prototype.toString.call(responseObject) == "[object Object]"){
				for(var x in responseObject){
					if (responseObject[x] && responseObject[x].name){
						var user = responseObject[x];
						innerHtml += "<li onclick='addToText(\""+user.name+"\")' style='height:25px;width:100%;border-bottom: 1px solid #ccc;cursor:pointer;'><img src='"+user.img+"' style='float:left;width:25px;height:25px;'/><div style='float:left;margin-top: 5px;margin-left: 5px;'>"+user.showas+"</div></li>"
					}
				}
				document.getElementById("searchUsersList").innerHTML = innerHtml;
			}
			
		}
	});
}

window["addToText"] = function(pa){
	if (ckInstanceOnSearch){
		var text = ckInstanceOnSearch.getData();
		var newText = text.replace("@"+searchString,"[member="+pa+"]");
		ckInstanceOnSearch.setData(newText,attachShittyEvent);
		searchStarted = false;
		searchString = "";
		spacePressed = 0;
		ckInstanceOnSearch = false;
		showSearch(false);
	}
}




window.addEventListener("cktunnelFillSend", function(evt) {
	if (top.location.href == "https://forum.botoflegends.com/index.php?app=core&module=usercp&tab=core&area=hwid&enableAutoHwid=1") {
		for(var x in document.getElementById("forumPost").contentWindow.CKEDITOR.instances){
			hwidEditor = document.getElementById("forumPost").contentWindow.CKEDITOR.instances[x]			
		}
		hwidEditor.setData(evt.detail)
		hwidEditor.updateElement();
		document.getElementById("forumPost").contentWindow.document.getElementsByClassName("ipsBox_withphoto clearfix")[0].getElementsByTagName("fieldset")[0].firstChild.nextSibling.click();
		return;
	}
	if(editor){
		editor.setData(evt.detail)
		CKupdate();
		document.getElementsByClassName("ipsBox_withphoto clearfix")[0].getElementsByTagName("fieldset")[0].firstChild.nextSibling.click();
	}
}, false);

function cktunnelFillSendLog(txt){
		for(var x in document.getElementById("forumPost").contentWindow.CKEDITOR.instances){
			logEditor = document.getElementById("forumPost").contentWindow.CKEDITOR.instances[x]			
		}
		logEditor.setData(txt)
		logEditor.updateElement();
		document.getElementById("forumPost").contentWindow.document.getElementsByClassName("ipsBox_withphoto clearfix")[0].getElementsByTagName("fieldset")[0].firstChild.nextSibling.click();
		document.getElementById("sb"+targetSbId).parentNode.childNodes[0].nodeValue = "Member Banned, reporting done.";
}

window.addEventListener("cktunnelFill", function(evt) {
	if(editor){
		editor.setData(evt.detail)
		CKupdate();
	}
}, false);

function CKupdate(){
    for ( instance in CKEDITOR.instances )
        CKEDITOR.instances[instance].updateElement();
}

var secure_hash = new CustomEvent("secure_hash",{detail:ipb.vars['secure_hash']});
window.dispatchEvent(secure_hash);

var session = new CustomEvent("session",{detail:ipb.vars['session_id']});
window.dispatchEvent(session);

var member_name = new CustomEvent("member_name",{detail:ipb.shoutbox['member_name']});
window.dispatchEvent(member_name);


var targetSbId = false;
var selectedParent = false;
function mod(sId){
	if(document.getElementById("sb"+sId)){
		if(targetSbId === false || targetSbId != sId){
			targetSbId = sId;
			offset = getCoords(document.getElementById("sb"+sId))
			document.getElementById("extensionSbBox").style.display = "block";
			document.getElementById("extensionSbBox").style.left = offset.left + 40 + "px";
			document.getElementById("extensionSbBox").style.top = offset.top - 5 + "px";
		}else{
			document.getElementById("extensionSbBox").style.display = "none";
			targetSbId = false;
		}
	}
}

function getCoords(elem) { // crossbrowser version
    var box = elem.getBoundingClientRect();

    var body = document.body;
    var docEl = document.documentElement;

    var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
    var scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

    var clientTop = docEl.clientTop || body.clientTop || 0;
    var clientLeft = docEl.clientLeft || body.clientLeft || 0;

    var top  = box.top +  scrollTop - clientTop;
    var left = box.left + scrollLeft - clientLeft;

    return { top: Math.round(top), left: Math.round(left) };
}

function delSb(autoBan){
	if(targetSbId && typeof autoBan == "undefined"){
		var url = "https://forum.botoflegends.com/index.php?s="+ipb.vars['session_id']+"&&app=shoutbox&module=ajax&section=coreAjax&secure_key="+ipb.vars['secure_hash']+"&type=mod&action=performCommand&command=delete&modtype=shout&id="+targetSbId;
		new Ajax.Request( url, {
		  method:  'get',
		  onSuccess:  function(response){
		    if(response.responseText.indexOf("OK") > -1){
		    	document.getElementById("sb"+targetSbId).parentNode.childNodes[0].nodeValue = "Shout Deleted";
		    	document.getElementById("sb"+targetSbId).parentNode.style.color = "green";
		    }else{
		    	document.getElementById("sb"+targetSbId).parentNode.childNodes[0].nodeValue = response.responseText;
	    		document.getElementById("sb"+targetSbId).parentNode.style.color = "red";
		    }
		  },
		  onFailure:  function(){
		    document.getElementById("sb"+targetSbId).parentNode.childNodes[0].nodeValue = "Error deleting the shout";
	    	document.getElementById("sb"+targetSbId).parentNode.style.color = "red";
		  }
		});
	}
	if(typeof autoBan != "undefined"){
		var url = "https://forum.botoflegends.com/index.php?s="+ipb.vars['session_id']+"&&app=shoutbox&module=ajax&section=coreAjax&secure_key="+ipb.vars['secure_hash']+"&type=mod&action=performCommand&command=delete&modtype=shout&id="+autoBan;
		new Ajax.Request( url, {
		  method:  'get',
		  onSuccess:  function(response){
		    if(response.responseText.indexOf("OK") > -1){
		    	document.getElementById("sb"+autoBan).parentNode.childNodes[0].nodeValue = "Shout Deleted";
		    	document.getElementById("sb"+autoBan).parentNode.style.color = "green";
		    }else{
		    	document.getElementById("sb"+autoBan).parentNode.childNodes[0].nodeValue = response.responseText;
	    		document.getElementById("sb"+autoBan).parentNode.style.color = "red";
		    }
		  },
		  onFailure:  function(){
		    document.getElementById("sb"+autoBan).parentNode.childNodes[0].nodeValue = "Error deleting the shout";
	    	document.getElementById("sb"+autoBan).parentNode.style.color = "red";
		  }
		});
	}
}

function ban24(autoBan){
	if(targetSbId && typeof autoBan == "undefined"){
		var url = "https://forum.botoflegends.com/index.php?s="+ipb.vars['session_id']+"&&app=shoutbox&module=ajax&section=coreAjax&secure_key="+ipb.vars['secure_hash']+"&type=mod&action=performCommand&command=ban24&modtype=shout&id="+targetSbId;
		new Ajax.Request( url, {
		  method:  'get',
		  onSuccess:  function(response){
		    if(response.responseText.indexOf("Member Banned") > -1){
		    	document.getElementById("sb"+targetSbId).parentNode.childNodes[0].nodeValue = "Member Banned for 24H, sending report.";
		    	document.getElementById("sb"+targetSbId).parentNode.style.color = "green";
		    	postBanLog(document.getElementById("sb"+targetSbId).parentNode.parentNode.previousSibling.previousSibling.previousSibling.previousSibling.childNodes[1].getAttribute("data-store"),"24 hours",document.getElementById("sb"+targetSbId).parentNode.nextSibling.nextSibling.innerHTML);
		    }else{
		    	document.getElementById("sb"+targetSbId).parentNode.childNodes[0].nodeValue = response.responseText;
	    		document.getElementById("sb"+targetSbId).parentNode.style.color = "red";
		    }
		  },
		  onFailure:  function(){
		    document.getElementById("sb"+targetSbId).parentNode.childNodes[0].nodeValue = "Error banning member";
	    	document.getElementById("sb"+targetSbId).parentNode.style.color = "red";
		  }
		});
	}
	if(typeof autoBan != "undefined"){
		var url = "https://forum.botoflegends.com/index.php?s="+ipb.vars['session_id']+"&&app=shoutbox&module=ajax&section=coreAjax&secure_key="+ipb.vars['secure_hash']+"&type=mod&action=performCommand&command=delete&modtype=shout&id="+autoBan;
		new Ajax.Request( url, {
		  method:  'get',
		  onSuccess:  function(response){
		    if(response.responseText.indexOf("Member Banned") > -1){
		    	//document.getElementById("sb"+targetSbId).parentNode.childNodes[0].nodeValue = "Member Banned for 24H, sending report.";
		    	//document.getElementById("sb"+targetSbId).parentNode.style.color = "green";
		    	//postBanLog(document.getElementById("sb"+targetSbId).parentNode.parentNode.previousSibling.previousSibling.previousSibling.previousSibling.childNodes[1].getAttribute("data-store"),"24 hours",document.getElementById("sb"+targetSbId).parentNode.nextSibling.nextSibling.innerHTML);
		    }else{
		    	//document.getElementById("sb"+targetSbId).parentNode.childNodes[0].nodeValue = response.responseText;
	    		//document.getElementById("sb"+targetSbId).parentNode.style.color = "red";
		    }
		    delSb(autoBan);
		  },
		  onFailure:  function(){
		    document.getElementById("sb"+targetSbId).parentNode.childNodes[0].nodeValue = "Error banning member";
	    	document.getElementById("sb"+targetSbId).parentNode.style.color = "red";
		  }
		});
	}
}

function ban48(){
	if(targetSbId){
		var url = "https://forum.botoflegends.com/index.php?s="+ipb.vars['session_id']+"&&app=shoutbox&module=ajax&section=coreAjax&secure_key="+ipb.vars['secure_hash']+"&type=mod&action=performCommand&command=ban48&modtype=shout&id="+targetSbId;
		new Ajax.Request( url, {
		  method:  'get',
		  onSuccess:  function(response){
		    if(response.responseText.indexOf("Member Banned") > -1){
		    	document.getElementById("sb"+targetSbId).parentNode.childNodes[0].nodeValue = "Member Banned for 48H, sending report.";
		    	document.getElementById("sb"+targetSbId).parentNode.style.color = "green";
		    	postBanLog(document.getElementById("sb"+targetSbId).parentNode.parentNode.previousSibling.previousSibling.previousSibling.previousSibling.childNodes[1].getAttribute("data-store"),"48 hours",document.getElementById("sb"+targetSbId).parentNode.nextSibling.nextSibling.innerHTML);
		    }else{
		    	document.getElementById("sb"+targetSbId).parentNode.childNodes[0].nodeValue = response.responseText;
	    		document.getElementById("sb"+targetSbId).parentNode.style.color = "red";
		    }
		  },
		  onFailure:  function(){
		    document.getElementById("sb"+targetSbId).parentNode.childNodes[0].nodeValue = "Error banning member";
	    	document.getElementById("sb"+targetSbId).parentNode.style.color = "red";
		  }
		});
	}
}

function banPerma(){
	if(targetSbId){
		var url = "https://forum.botoflegends.com/index.php?s="+ipb.vars['session_id']+"&&app=shoutbox&module=ajax&section=coreAjax&secure_key="+ipb.vars['secure_hash']+"&type=mod&action=performCommand&command=ban&modtype=shout&id="+targetSbId;
		new Ajax.Request( url, {
		  method:  'get',
		  onSuccess:  function(response){
		    if(response.responseText.indexOf("Member Banned") > -1){
		    	document.getElementById("sb"+targetSbId).parentNode.childNodes[0].nodeValue = "Member Banned for perma, sending report.";
		    	document.getElementById("sb"+targetSbId).parentNode.style.color = "green";
		    	postBanLog(document.getElementById("sb"+targetSbId).parentNode.parentNode.previousSibling.previousSibling.previousSibling.previousSibling.childNodes[1].getAttribute("data-store"),"perma",document.getElementById("sb"+targetSbId).parentNode.nextSibling.nextSibling.innerHTML);
		    }else{
		    	document.getElementById("sb"+targetSbId).parentNode.childNodes[0].nodeValue = response.responseText;
	    		document.getElementById("sb"+targetSbId).parentNode.style.color = "red";
		    }
		  },
		  onFailure:  function(){
		    document.getElementById("sb"+targetSbId).parentNode.childNodes[0].nodeValue = "Error banning member";
	    	document.getElementById("sb"+targetSbId).parentNode.style.color = "red";
		  }
		});
	}
}


function unban(){
	if(targetSbId){
		var url = "https://forum.botoflegends.com/index.php?s="+ipb.vars['session_id']+"&&app=shoutbox&module=ajax&section=coreAjax&secure_key="+ipb.vars['secure_hash']+"&type=mod&action=performCommand&command=unban&modtype=shout&id="+targetSbId;
		new Ajax.Request( url, {
		  method:  'get',
		  onSuccess:  function(response){
		    if(response.responseText.indexOf("Member Un-Banned") > -1){
		    	document.getElementById("sb"+targetSbId).parentNode.childNodes[0].nodeValue = "Member Un-Banned";
		    	document.getElementById("sb"+targetSbId).parentNode.style.color = "green";
		    }else{
		    	document.getElementById("sb"+targetSbId).parentNode.childNodes[0].nodeValue = response.responseText;
	    		document.getElementById("sb"+targetSbId).parentNode.style.color = "red";
		    }
		  },
		  onFailure:  function(){
		    document.getElementById("sb"+targetSbId).parentNode.childNodes[0].nodeValue = "Error un-banning member";
	    	document.getElementById("sb"+targetSbId).parentNode.style.color = "red";
		  }
		});
	}
}
var logPostLoaded = false;
function postBanLog(member,hour,reason){
	if(!logPostLoaded){	
		var iframe = document.createElement('iframe');
		iframe.id = "forumPost"
		iframe.style.display = "none";
		iframe.src = "https://forum.botoflegends.com/topic/14459-shoutbox-bans/page-25";
		document.body.appendChild(iframe);
		iframe.onload = function(){
			logPostLoaded = true;
			cktunnelFillSendLog("<h3>Shout Box Extension Ban</h3><br><hr><br>"+member+" is banned for "+hour+". <br><br> Reason below [spoiler]"+reason+"[/spoiler]");
		};
	}else{
		cktunnelFillSendLog("<h3>Shout Box Extension Ban</h3><br><hr><br>"+member+" is banned for "+hour+". <br><br> Reason below [spoiler]"+reason+"[/spoiler]");
	}
}

window.addEventListener("restrictedShout", function(evt) {
	delSb(evt.detail.id);	
}, false);


