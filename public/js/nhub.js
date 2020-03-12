$(document).ready(function(){

$(window).scroll(function(){
    if($(this).scrollTop() > 40){
        $('#apply-scroll-btn').fadeIn();
    } else{
        $('#apply-scroll-btn').fadeOut();
    }
});

    $("#apply-scroll-btn").click(function(){
        $('html ,body').animate({ scrollTop: 200}, 800);
    });
});