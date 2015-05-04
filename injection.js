var editor = false;
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
		window.dispatchEvent(event);	  
		clearInterval(ckeditorFinder);
    }
},100)


window.addEventListener("cktunnelFillSend", function(evt) {
	if(editor){
		editor.setData(evt.detail)
		CKupdate();
		document.getElementsByClassName("ipsBox_withphoto clearfix")[0].getElementsByTagName("fieldset")[0].firstChild.nextSibling.click();
	}
}, false);

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