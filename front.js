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
var detectedReset = -1;
var lastPage = 9999;
var searchPage = 9999;
var lastMod = "";
function addFlow(e){
	flowList += "<li>"+e+"</li>"
	$(".autoHwidContent ul").html("<ul>"+flowList+"</ul>");
}

if(top.location.href == "http://forum.botoflegends.com/index.php?app=core&module=usercp&tab=core&area=hwid&enableAutoHwid=1"){
	$("#userCPForm").css("position","absolute").css("opacity","0");
	$("#footer_utilities").remove();
	var autoHwidBox = "<div class='autoHwidContent'><ul></ul></div>";
	$(autoHwidBox).insertAfter("noscript");

	addFlow("Finding latest hwid reset.");
	progressManager(progress)
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
				$(".post_wrap:contains('Hwid Resets Done') .row2 .author.vcard a span", data).each(function(){
					if($(this).children().length == 1){
						user = $(this).children();
					}
					if(user.css("color") != "" && user.css("color") != "rgb(255, 140, 0)"){
						detectedReset = user.parents(".post_block.hentry").prevAll(".post_block.hentry").length;	
						lastRow = user.parents(".post_block.hentry");		
						lastMod = user.text();
					}
				});
				if(detectedReset == -1){
					searchPage--;
				}else{
					if(!lastRow){
						var lastRow = $(".post_block.hentry",data).eq(0);
					}
					lastRow.nextAll(".post_block.hentry").each(function(){
						var user = $(this).children(".post_wrap").children(".row2").children(".author.vcard").children("a").children("span");
						if(user.children().length == 1){
							user = user.children();
						}
						if(resetList.indexOf({username:user.text(),color:user.css("color")}) < 0){
							resetList.push({username:user.text(),color:user.css("color")});
						}						
					})
					searchPage++;
				}
				if(searchPage <= lastPage){
					addFlow("Delaying action...")
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
			console.log(resetList);
		break;
	}
}

