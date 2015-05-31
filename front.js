var _CKEDITOR = false;
var msgList = [];
window.addEventListener("cktunnel", function(evt) {
	_CKEDITOR = true
}, false);


var s = document.createElement('script');
s.src = chrome.extension.getURL('injection.js');
(document.head||document.documentElement).appendChild(s);

var _settingsCheck = setInterval(function() {
    if (_CKEDITOR != false) {
        clearInterval(_settingsCheck);
        buildPage(); 
    }
}, 100);

$(".maintitle").eq(1).text("").css("height","25px");

function buildPage(){
	var autoMsg = '<input type="button" class="input_submit au0 alt" value="Add From List">';
	var autoReply = '<input type="button" class="input_submit au1" value="Reply From list" style="margin-left:10px;">';
	var autoReplyClose = '<input type="button" class="input_submit au2" value="Reply From list & Close" style="margin-left:10px;">'


	$(".ipsBox_withphoto.clearfix").each(function(){
		$(autoMsg).insertBefore($(this).children(".ipsBox_withphoto form").children("fieldset"));
		$(autoReply).insertBefore($(this).children(".ipsBox_withphoto form").children("fieldset"));
		$(autoReplyClose).insertBefore($(this).children(".ipsBox_withphoto form").children("fieldset"));
		
		$(".au0").click(function(){
			chrome.runtime.sendMessage({action: "getLocalMessages"}, function(response) {
			  	msgList =  response;
				showDialog("fill");
			});			
			return false;
		});

		$(".au1").click(function(){
			chrome.runtime.sendMessage({action: "getLocalMessages"}, function(response) {
			  	msgList =  response;
				showDialog("fillsend");
			});
			return false;
		});

		$(".au2").click(function(){
			chrome.runtime.sendMessage({action: "getLocalMessages"}, function(response) {
			  	msgList =  response;
			  	showDialog("fillsendclose");
			});
			return false;
		});
	});
}

var ckEditorData = "";
window.addEventListener("ckData", function(evt) {
	ckEditorData = evt.detail
}, false);

var secure_hash = false;
window.addEventListener("secure_hash", function(evt) {
	secure_hash = evt.detail
}, false);

var session = false;
window.addEventListener("session", function(evt) {
	session = evt.detail
}, false);

var ckeBottom = setInterval(function(){
	if (document.getElementsByClassName("cke_bottom")[0]) {
		
		document.getElementsByClassName("cke_bottom")[0].insertAdjacentHTML("afterbegin",'<input id="saveToList" class="input_submit saveButton" type="button" value="Save this to list" style="float: left;">');
		document.getElementsByClassName("cke_bottom")[0].insertAdjacentHTML("afterbegin",'<input type="text" id="saveListTitle" class="saveTitle" value="Message Title">');

		document.getElementById("saveToList").addEventListener("click",function(){
			chrome.runtime.sendMessage({action: "saveMessage",data:{text:ckEditorData,title:document.getElementById("saveListTitle").value}},function(response){
				document.getElementById("saveToList").insertAdjacentHTML("afterend",response)
			});
		});
		clearInterval(ckeBottom)
	};
},100)

function cktunnelFill(text){
	var event = new CustomEvent("cktunnelFill", {detail: text});
	window.dispatchEvent(event);	
}

function cktunnelFillClose(text,link){
	var event = new CustomEvent("cktunnelFillSend", {detail: text});
	closeTopic(link)
	window.dispatchEvent(event);	
}

function cktunnelFillSend(text){
	var event = new CustomEvent("cktunnelFillSend", {detail: text});
	window.dispatchEvent(event);	
}

var loading = false;
var _th;

function closeTopic(closehref){
	_th = setInterval(function(){
		if(loading && document.getElementById("ajax_loading").style.display == "none"){
			
			loading = false;
			clearInterval(_th)
			top.location.href = closehref;
			return;
		}
		if (document.getElementById("ajax_loading").style.display != "none") {
			loading = true;
		};
	},50)
}

jQuery.fn.center = function () {
    this.css("top", Math.max(0, (($(window).height() - $(this).outerHeight()) / 2) + "px"));
    this.css("left", Math.max(0, (($(window).width() - $(this).outerWidth()) / 2) + 
                                                $(window).scrollLeft()) + "px");
    this.css("position","fixed");
    return this;
}


var msgTitle = '<div class="msgTitle"><h3></h3></div>';
function showDialog(type){	
	
	$("#ipbwrapper").addClass("fogBitch");
	var optionsPage = '<div class="selectListBox" id="helperBox" style="width:'+document.getElementsByClassName("ipsBox_withphoto clearfix")[0].getElementsByTagName("form")[0].offsetWidth+'px;"><div class="helperTop" style="padding: 10px;"><h3>Bot Of Legends Helper</h3></div><hr style="display:block;margin:0px;"><div class="savedContents"><div class="msgList"></div><div class="msgContent" id="msgContent"></div></div><div class="helperBottom"><input id="addFromList" type="button" value="Add Message" class="input_submit"><input id="cancelFromList" type="button" value="Cancel" class="input_submit alt" style="margin-left: 10px;"></div><input type="button" id="delMsg" class="removeButton input_submit alt" value="Delete Message"></div>';
	$("body").append(optionsPage);
	$("#helperBox").center();

	for(var x = 0 ; x < msgList.length ; x++){
		$(".msgList").append('<div class="msgTitle" dataId='+x+'><h3>'+msgList[x].title+'</h3></div>');
	}

	$(".msgTitle").click(function(){
		var content = msgList[parseInt($(this).attr("dataId"))].text;
		document.getElementById("msgContent").innerHTML = content;
		$(".msgSelected").removeClass("msgSelected")
		$(this).addClass("msgSelected")
	});

	$("#cancelFromList").click(function(){
		$(".selectListBox").remove();
		$(".fogBitch").removeClass("fogBitch");
	});

	$("#addFromList").click(function(){
		switch(type){
			case "fill":
				cktunnelFill(msgList[parseInt($(".msgSelected").attr("dataId"))].text);
				$("#cancelFromList").click();
				break;
			case "fillsend":
				cktunnelFillSend(msgList[parseInt($(".msgSelected").attr("dataId"))].text);
				$("#cancelFromList").click();
				break;
			case "fillsendclose":
				cktunnelFillClose(msgList[parseInt($(".msgSelected").attr("dataId"))].text,document.getElementsByClassName("modlink_00")[0].href);
				$("#cancelFromList").click();
				break;
		}
		;
	});

	$("#delMsg").click(function(){
		if($(".msgSelected").attr("dataId")){
			chrome.runtime.sendMessage({action: "deleteMessage",id:parseInt($(".msgSelected").attr("dataId"))});
			$(".msgSelected").remove();
			document.getElementById("msgContent").innerHTML = "";
		}
	})
}

$("a[class^='modlink_']").each(function(){
	$(".maintitle").append('<a href="'+$(this).attr("href")+'" class="ftoggle ipsButton_secondary" style="float: right;color:#616161;margin-left:10px;">'+$(this).text()+'</a>')
});
$(".maintitle a").click(function(){
	top.location.href = $(this).attr("href");
});
		
		

$("body").append("<iframe id='resetter' src='http://forum.botoflegends.com/index.php?app=core&module=usercp&tab=core&area=hwid' width='0' height='0'></iframe>");

function resetHwid(username){
	$("#resetter").contents().find("#newbox_1").val(username)
	$("#resetter").contents().find(".input_submit").click();
}


var totalHwidReset = ""

$(".row2").each(function(){
	if($(this).has(".author").length > 0){
		$(this).append('&nbsp;&nbsp;<input type="button" class="input_submit resetHwid" value="Reset Hwid">')
	}
})

$(".resetHwid").click(function(){
	resetHwid($(this).parent().children(".author").text());
	totalHwidReset += "<li>[member="+$(this).parent().children(".author").text()+"]</li>";
	cktunnelFill("<h3>Hwid Resets Done</h3><ul>"+totalHwidReset+"</ul>");
})

var bossImg = chrome.extension.getURL("boss.png");
$("#primary_nav .left").last().parent().append('<li class="left" style="width:170px;"><a style="float:left;width:83%" href="http://forum.botoflegends.com/index.php?app=core&module=usercp&tab=core&area=hwid&enableAutoHwid=1" target="_new">Auto Hwid Reset<img class="boss" src="'+bossImg+'"/></a></li>')

var flowList = ""
var progress = 1;
var resetList = [];
var resetDone = [];
var detectedReset = -1;
var lastPage = 9999;
var searchPage = 9999;
var lastMod = "";

function addFlow(e){
	flowList += "<li>"+e+"</li>"
	$(".autoHwidContent ul").html("<ul>"+flowList+"</ul>");
	$('.autoHwidContent ul').animate({ scrollTop: 50000 }, 0);
}

if(top.location.href == "http://forum.botoflegends.com/index.php?app=core&module=usercp&tab=core&area=hwid&enableAutoHwid=1"){
	$("#userCPForm").css("position","absolute").css("opacity","0");
	$("#footer_utilities").remove();
	var autoHwidBox = "<div class='autoHwidContent'><ul></ul></div>";
	$(autoHwidBox).insertAfter("noscript");

	addFlow("Finding latest hwid reset.");
	setTimeout(function(){
		addFlow("Loading latest page.");
		progressManager(progress);
	},2000);
}

function progressManager(i){
	switch(i){
		case 1:
			$.ajax({
				url: "http://forum.botoflegends.com/topic/46046-official-hwid-reset-topic-no-hwid-reset-for-free-users-until-the-0505/page-"+searchPage,
				dataType:"text"
			}).done(function(data) {
				if(lastPage == 9999){
					lastPage = parseInt($(".active.page",data).eq(0).text())
					searchPage = lastPage;
				}

			  	var resetFrom = 0;			  	
			  	var lastRow = false;
				
			  	$($(".post_wrap", data).get().reverse()).each(function(){ 
			  		if($(this).html().indexOf("Hwid Resets Done") > 0 || $(this).html().indexOf("have been reseted") > 0){
			  			var userCard = $(this).find(".row2 .author.vcard a span");
			  			if(userCard.children().length == 1){
							userCard = userCard.children();
						}
						if(userCard.css("color") != "" && userCard.css("color") != "rgb(255, 140, 0)"){
							lastMod = userCard.text();
							detectedReset = true;
							return false;
						}else{
							resetList.push({username:userCard.text(),color:userCard.css("color")})
						}
			  			return false;
			  		}else{
			  			var userCard = $(this).find(".row2 .author.vcard a span");
			  			if(userCard.children().length == 1){
							userCard = userCard.children();
						}
						if(userCard.css("color") == "" || userCard.css("color") == "rgb(255, 140, 0)"){
							resetList.push({username:userCard.text(),color:userCard.css("color")})
						}
			  		}
				});

				if(detectedReset == -1){
					searchPage--;
					setTimeout(function(){
						addFlow("Loading page:"+searchPage);
						progressManager(progress);
					},3000);
				}else{
					addFlow("Last reset by: "+ lastMod);
					progress++;
					progressManager(progress);
				}			
			});
		break;


		case 2:
			if(resetList.length>0){
				addFlow("Do you want to reset free users (Y/N)? ");
				document.addEventListener("keypress", waitForKey);
			}else{
				addFlow("Resets already done, sorry.");
			}
		break;

		case 3:
			addFlow("Reseting free users too.");
			progress = 5;
			progressManager(progress)
		break;

		case 4:
			addFlow("Reseting only vip members.");
			var lastArr = [];
			for(var x = 0; x < resetList.length; x++){
				if(resetList[x].color == "rgb(255, 140, 0)"){
					lastArr.push(resetList[x])
				}
			}
			resetList = lastArr;
			progress = 5;
			progressManager(progress)
		break;

		case 5:
			if (secure_hash) {
				addFlow("Number of hwid resets remaining:" + resetList.length);
				addFlow("Using secure hash:" + secure_hash);
				if(resetList.length > 0){
					addFlow("Delaying action...");
					setTimeout(function(){
						resetAutoHwid(resetList[0]);
					},500 + Math.floor((Math.random() * 4000) + 1));
				}else{
					addFlow("All hardware ids resetted.");
					addFlow("Delaying action...");
					setTimeout(function(){
						addFlow("Posting to the forum. Do not close the tab!")
						postForum();
					},500 + Math.floor((Math.random() * 4000) + 1));
				}
			}else{
				addFlow("Secure hash not found waiting for injection");
				setTimeout(function(){
					progressManager(progress);
				},300)
			}
		break;
	}
}

function waitForKey(e){
	if(e.keyCode == 89){
		progress = 3;
	}else{
		progress = 4
	}
	progressManager(progress);
}

function resetAutoHwid(usr){
	addFlow("Reseting user:" + usr.username);
	var resetUrl = "http://forum.botoflegends.com/index.php?app=core&module=usercp&tab=core&area=hwid";
	$.ajax({
		url: resetUrl,
		method: "POST",
		dataType:"text",
		data: { MAX_FILE_SIZE: 0, do: "save", secure_hash : secure_hash, s : "", newbox_1 :usr.username, submitForm:"Save Changes"}
	}).done(function(data){
		resetDone.push(usr.username)
		resetList.splice(0,1)
		progressManager(progress)
	});
}
var loadedOnce = false
function postForum(){
	if(resetDone.length >0 ){
		$("body").append("<iframe id='forumPost' src='http://forum.botoflegends.com/topic/46046-official-hwid-reset-topic/page-629'></iframe>")
		$("#forumPost").load(function(){
			if(!loadedOnce){
				loadedOnce = true;
				var totalHwidReset = "";
				for(var x = 0; x < resetDone.length;x++){
					totalHwidReset += "<li>[member="+resetDone[x]+"]</li>";
				}			
				cktunnelFillSend("<h3>Hwid Resets Done</h3><ul>"+totalHwidReset+"</ul>");
			}else{
				addFlow("Hwid reseting done. You can close the tab now.")
			}
		});
	}else{
		addFlow("Hwid reseting done. You can close the tab now.")
	}
}

function checkShouts(){
	$("[id^='shout-row-']").each(function(){
		if(!$(this).attr("extensionWorked")){
			var sId = $(this).attr("id").split("-")[2];
			$(this).children("td:eq(2)").children(".desc").append('<img onclick="mod('+sId+');" class="sbModButton" id="sb'+sId+'" src="'+chrome.extension.getURL('mod.png')+'" alt="Mod extension plugin" style="margin-left: 6px;border-left: 1px solid #ccc;padding-left: 3px;cursor:pointer;">')
			$(this).attr("extensionWorked","true");
		}
	});
}
var _shoutChecker = setInterval(checkShouts,100);


var sbBox = '<div id="extensionSbBox"><span><</span><div class="sbOpt" onclick="delSb()">Delete Shout</div><div class="sbOpt" onclick="ban24()">Ban 24H</div><div class="sbOpt" onclick="ban48()">Ban 48H</div><div class="sbOpt" onclick="banPerma()">Ban Perma</div><div class="sbOpt" onclick="unban()">Unban</div></div>';


$("body").append(sbBox);

var _refresher = function(){
	$("#shoutbox-refresh-button").click();
	if($("#refreshTime").val() > 0){
		setTimeout(_refresher,$("#refreshTime").val() * 1000);
	}else{
		setTimeout(_refresher,10000);
	}	
}

$("#shoutbox-refresh-button").parent().append('<br><br>Auto Refresh after &nbsp;&nbsp;<input type="text" id="refreshTime" value="10" style="width:30px;"></input>&nbsp;&nbsp; seconds.');
_refresher();





$("#shoutbox-refresh-button").parent().append('<hr style="display:block;"/><div id="botStatus">Shoutbox Plugin Status: Idle</div>');
$("#botStatus").html('Shoutbox Plugin Status: Waiting for injection');

var loadedWordList = false;
function processShoutList(sList){
	for(var x = 0; x < sList.length; x++){
		for(var y = 0; y < loadedWordList.length; y++){
			if(sList[x].text.toLowerCase().indexOf(loadedWordList[y].word.toLowerCase()) > -1 ){
				var event = new CustomEvent("restrictedShout",{detail:{id:sList[x].id,text:sList[x].text}});
				window.dispatchEvent(event);
			}
		}
	}
}


$.get("http://forum.botoflegends.com/topic/65685-shoutbox-restricted-words/#entry827967", function(data){
	var list = data.split("<div class='bbc_spoiler_content' style=\"display:none;\">")[1].split("</div>")[0];
	list = list.replace(/<br>/g,"").replace(/\+/g,"").replace(/<\/br>/g,"").replace(/<p>/g,"").replace(/<\/p>/g,"");
	var _wL = list.split("\n");
	var _w1L = [];
	for(var x in _wL){
		if(_wL[x].length > 0){
			_w1L.push(_wL[x]);
		}
	}
	var w2L = [];
	for(var x in _w1L){
		var r = _w1L[x].split(",");
		if(r.length > 1){
			w2L.push({word:r[0].replace(/\./g,"").replace(/ /g,""),answer:r[1]});
		}else{
			w2L.push({word:r[0].replace(/\./g,"").replace(/ /g,""),answer:false});
		}
	}
	loadedWordList = w2L;
});

function _sbChecker(){
	if(session != false){
		if(loadedWordList){
			var url = "http://forum.botoflegends.com/index.php?s="+session+"&&app=shoutbox&module=ajax&section=coreAjax&secure_key="+secure_hash+"&type=getShouts&lastid=1&global=1";
			$("#botStatus").html('Shoutbox Plugin Status: Working');
			$.get(url,function(data){
				var sList = [];
				var sListTemp = data.split("</tr>");
				for(var x = 0; x < sListTemp.length-1 ; x++){
					var isMod = sListTemp[x].split('<span itemprop="name">')[1];
					if(isMod[0] == "<"){
						isMod = isMod.split(">")[0];
						if(isMod.indexOf("color:Darkorange") > -1 || isMod.indexOf("color:green;") > -1 || isMod.indexOf("color:DarkOrchid;") > -1){
							isMod = false;
						}else{
							isMod = true;
						}
					}else{
						isMod = false;
					}
					var shoutId = sListTemp[x].split("<tr class='row2' id='shout-row-")[1].split("'")[0];
					var shoutStartPos = sListTemp[x].indexOf("<span class='shoutbox_text'>")+ "<span class='shoutbox_text'>".length;
					var endPos = sListTemp[x].lastIndexOf("</span>");
					var shoutText = sListTemp[x].substring(shoutStartPos,endPos);
					if(!isMod){
						sList.push({id:shoutId,text:shoutText.replace(/[^\w\s]/g, '').replace(/ /g, '')});
					}
				}
				processShoutList(sList);
			});
		}else{
			$("#botStatus").html('Shoutbox Plugin Status: Waiting for wordlist.');
		}
	}else{
		$("#botStatus").html('Shoutbox Plugin Status: Waiting for injection.');
	}
}

var _sbCheckerInterval = setInterval(_sbChecker,1500);