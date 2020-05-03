// Code By Webdevtrick ( https://webdevtrick.com )
let buttonenabled = true, scroll = 0;
$(document).on("click", ".darkmode", function(){
	if(!buttonenabled) return;
	buttonenabled = false;
	$("#dark-mode-button").html($("body >.body-container")[0].outerHTML); 
	scrollbind($("#dark-mode-button .body-container"));
	$("#dark-mode-button .body-container").toggleClass("dark").scrollTop(scroll); 
	$("#dark-mode-button .darkmode").toggleClass("fa-moon").toggleClass("fa-sun"); 
	$("#dark-mode-button").addClass("anim"); 
	setTimeout(function(){
		$("body >.body-container").replaceWith($("#dark-mode-button").html()) 
		scrollbind($("body >.body-container")); 
		$("body >.body-container").scrollTop(scroll);
		$("#dark-mode-button").html("").removeClass("anim"); 
		buttonenabled = true;
	}, 1000); 
});

const scrollbind = el => el.bind("scroll", function(){
	scroll = $(this).scrollTop();
	if($(".body-container").length > 1)
		$(".body-container").scrollTop(scroll); 
		
});
scrollbind($(".body-container"));