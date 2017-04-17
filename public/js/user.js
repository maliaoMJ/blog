window.onload=function(){
	var verification=document.getElementById('verification');
	
	
	verification.onclick=function(){
	   var emails=document.getElementById('email');
	   var pattern=/^[0-9a-zA-Z]+[@]{1}[0-9a-zA-Z]+[\.]?[0-9a-zA-Z]+$/;
       if(!pattern.test(emails.value)){
           alert('请输入正确的邮箱格式!');
	    }else{
	   verification.setAttribute("class","disabled btn btn-success input-group-addon");
	   verification.style.display="none";
	   
	   /*Ajax 异步请求*/
	   var xmlhttp=null;
        if (window.XMLHttpRequest) { 
				xmlhttp = new XMLHttpRequest(); 
				if (xmlhttp.overrideMimeType) { 
				xmlhttp.overrideMimeType("text/xml"); 
				} 
		} 



		if (!xmlhttp) { 
		alert("XMLHTTPRequest创建失败!"); 
		return; 
		} else { 
		// alert(xmlhttp); 
		} 

		xmlhttp.onreadystatechange = callback; 
		xmlhttp.open("GET", '/admin/users/email?emails='+emails.value,true); 
	    xmlhttp.send(); 
	        function callback(){
				if (xmlhttp.readyState == 4) { 
					if (xmlhttp.status == 200) { 
					   var responseText = xmlhttp.responseText; 
					   alert(responseText); 
					} 
				}
				 
	        }




       }
	}
}
