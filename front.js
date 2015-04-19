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
		
		