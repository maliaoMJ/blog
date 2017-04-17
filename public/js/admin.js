 // info message js model
  var info=document.getElementById('info');
      if(info.innerHTML.length==7){
          info.style.display='none';
      }else{
          info.style.display='block'
        setTimeout(function () {
          info.style.display='none'
        },1000);
      };
$(document).ready(function(){
	
	// content ckeditor
	CKEDITOR.replace('add-post-content');
});
  