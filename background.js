if (localStorage.getItem("savedMessages") === null) {
  	localStorage.setItem("savedMessages",JSON.stringify([]))
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	switch(message.action){
		case "getLocalMessages":
			sendResponse(JSON.parse(localStorage.getItem("savedMessages")))
			break;
		case "saveMessage":
			try{
				var msgs = JSON.parse(localStorage.getItem("savedMessages"));
				msgs.push(message.data);
				localStorage.setItem("savedMessages",JSON.stringify(msgs));
				sendResponse("Message saved");
			}catch(e){
				sendResponse("Message cant be saved");
			}
			break;
		case "deleteMessage":
			var msgs = JSON.parse(localStorage.getItem("savedMessages"));
			msgs.splice(message.id,1)
			localStorage.setItem("savedMessages",JSON.stringify(msgs));
			break;
	}
});

