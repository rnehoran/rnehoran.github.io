var LINK = 0;
var TITL = 1;
var DATE = 2;
var NAME = 3;
var DESC = 4;
var CNVW = 5;
var CNVH = 6;
var IMGW = 7;
var IMGH = 8;

var frame_thickness = 58;
var gap = 92;

var min_width = 284;
var min_height = 248;
var max_height = 500;
var max_width = 615;

var n = 0;

var numLoaded = 0;
var stopLoading = false;

var labelTextOpacity = 0.55;

//			dataFileID = "1w-0A9tRDHwHIBffnf5gKdiWW2dvz0Wm9nCc3ZPTZpmQ";

var art_details = [];
var num;

function loading(){
    var sep = 100;
    if (stopLoading) return;
    $(".dot1").animate({top: '-=50'});
    setTimeout(function() {
        $(".dot2").animate({top: '-=50'});
        setTimeout(function() {
            $(".dot3").animate({top: '-=50'});
        }, sep);
    }, sep);
    setTimeout(function() {
        $(".dot1").animate({top: '+=50'});
        setTimeout(function() {
            $(".dot2").animate({top: '+=50'});
            setTimeout(function() {
                $(".dot3").animate({top: '+=50'});
            }, sep);
        }, sep);
    }, 400);
    setTimeout(function() {
        loading();
    }, 900);
}

function displayID(id){
    document.getElementById(id).style.opacity = 1;
}

function start(){
    var backgroundSrc = new Image;
    backgroundSrc.src = "images/background.jpg";
    backgroundSrc.onload = function(){
        $("body").css("background-image", "url(images/background.jpg)");
        document.getElementById("back_color").style.opacity = 0;
        jQuery.get("https://docs.google.com/feeds/download/documents/export/Export?id=" + dataFileID + "&exportFormat=txt", function(data){
            art_details = eval(data);
            num = art_details.length;
            initArt();
        })
    }
}

function initArt(){

    var vertical = 250;
    var image_width;
    var image_height;
    var ext_width;
    var ext_height;
    var hw_ratio;
    var dalign;
    var halign;
    var valign;
    var label_halign;
    var lalign;
    var title_width = "1100px";
    var load  = "";

    if (screen.width < 1100){
        title_width = "100%";
    }

    document.body.innerHTML += "<img id='title' onload='displayID(\"title\")' style='width: " + title_width + "; top:0;' class='center' src='images/title.png'>";

    for (var i = 0; i < num; i++) {

        image_width = art_details[i][IMGW];
        image_height = art_details[i][IMGH];
        hw_ratio = image_height/image_width;
        image_height = 100 * Math.sqrt(art_details[i][CNVH]);
        image_width = image_height/hw_ratio;

        if(image_width > max_width){
            image_width = max_width;
            image_height = image_width*hw_ratio;
        }
        if(image_height > max_height){
            image_height = max_height;
            image_width = image_height/hw_ratio;
        }
        if(image_width < min_width){
            image_width = min_width;
            image_height = image_width*hw_ratio;
        }
        if(image_height < min_height){
            image_height = min_height;
            image_width = image_height/hw_ratio;
        }
        ext_width = image_width - 280;
        ext_height = image_height - 243;

        lalign = 110 + image_width;
        valign_num = (vertical + gap + frame_thickness);
        valign = "top: " + valign_num + "; ";
        if ((i % 2) == 0){
            dalign = "left: ";
            halign = "left: 150; ";
            label_halign = "left: " + lalign + "; ";
        }
        else {
            dalign = "right: "
            lalign -= 10;
            halign = "right: 170; ";
            label_halign = "right: " + lalign + "; ";
        }
        document.body.innerHTML +=
            "<div style='" + halign + "top: " + (valign_num + (image_height/2) - 50) + "; height: 150; width:" + image_width + "' class='dot_container' id='dotcon" + i + "'>" +
                "<div style='margin: 0 auto; height:150; width: 240; position: relative'>" +
                    "<img src='images/dot.png' class='dot dot1' style='" + dalign + "-10'/>" +
                    "<img src='images/dot.png' class='dot dot2' style='" + dalign + "70'/>" +
                    "<img src='images/dot.png' class='dot dot3' style='" + dalign + "150'/>" +
                "</div>" +
            "</div>" +
            "<div style='" + halign + valign + "' class='art_container' id='artcon" + i + "'>" +
                "<img style='height:" + image_height + "; width:" + image_width + ";' class='artwork' src='https://drive.google.com/uc?id=" + art_details[i][LINK] + "'>" +
                "<table class='frame' border='0' cellpadding='0' cellspacing='0'>" +
                    "<tr>" +
                        "<td>" +
                            "<img src='images/frame_tl.png' width='248' height='248' alt=''>" +
                        "</td>" +
                        "<td  style='background-image:url(images/frame_tm.png); background-repeat: repeat-x; background-size: 4px'>" +
                            "<div class='frame_horizontal' style='height:248; width:" + ext_width + ";'>" +
                        "</td>" +
                        "<td>" +
                            "<img src='images/frame_tr.png' width='248' height='248' alt=''>" +
                        "</td>" +
                    "</tr>" +
                    "<tr>" +
                        "<td  style='background-image:url(images/frame_ml.png); background-repeat: repeat-y; background-size: 248px 4px'>" +
                            "<div class='frame_vertical' style='width:248; height:" + ext_height + "'>" +
                        "</td>" +
                        "<td width='4' height='4'>" +
                        "<td  style='background-image:url(images/frame_mr.png); background-repeat: repeat-y; background-size: 248px 4px'>" +
                            "<div class='frame_vertical' style='width:248; height:" + ext_height + "'>" +
                        "</td>" +
                    "</tr>" +
                    "<tr>" +
                        "<td>" +
                            "<img src='images/frame_bl.png' width='248' height='248' alt=''>" +
                        "</td>" +
                        "<td  style='background-image:url(images/frame_bm.png); background-repeat: repeat-x; background-size: 4px'>" +
                            "<div class='frame_horizontal' style='height:248; width:" + ext_width + "'>" +
                        "</td>" +
                        "<td>" +
                            "<img src='images/frame_br.png' width='248' height='248' alt=''>" +
                        "</td>" +
                    "</tr>" +
                "</table>" +
                "<div  class='label' style='" + label_halign + "'>" +
                    "<span style='opacity: " + labelTextOpacity + "'>" +
                        "<b style='line-height: 1.5; font-size: 18;'>" +
                            art_details[i][TITL] +
                        "</b>" +
                        "<br style='opacity: " + (labelTextOpacity + 0.1) + "'>" +
                            art_details[i][DATE] +
                        "<br>" +
                        "<p style='opacity: " + (labelTextOpacity + 0.1) + "; font-size: 12;'>" +
                            art_details[i][NAME] +
                            "<br>" +
                            art_details[i][DESC] + " " + art_details[i][CNVH] + "\"x" + art_details[i][CNVW] + "\"" +
                            "<br>" +
                        "</p>" +
                    "</span>" +
                "</div>" +
            "</div>";

        vertical = vertical + gap + (2 * frame_thickness) + image_height;
        if (i == num-1){
            var ua = window.navigator.userAgent;
            if (ua.indexOf("MSIE ") > 0 || ua.indexOf('Trident/') > 0){
                setTimeout(function() {
                    var l = $(".art_container").length;
                    for (j = 0; j < l; j++) {
                        showArt(j);
                    }
                }, 5000);
            }
            var loadSrc = new Image;
            loadSrc.src = "images/dot.png";
            loadSrc.onload = function(){
                $(".dot_container").animate({"opacity": 1});
                loading();
            }
            show();
        }
    }
    document.body.innerHTML += "<img id='copyright' onload='displayID(\"copyright\");' style='width: 800px; top:" + (vertical + 40) + "' class='center' src='images/copyright.png'>" +
                                "<a href='mailto:roynehoran-art@yahoo.com?Subject=Art%20Gallery' style='right:8px; width: 174px; height: 22px; top:" + (vertical + 158) + "' class='center'></a>";
}

function show(){
    var imgs = $('#artcon0 .frame img');
    var numImg = imgs.length;
    var countImg = function() {
        numImg--;
        if (!numImg){
            var l = $(".art_container").length;
            for (j = 0; j < l; j++) {
                displayArt(j);
            }
        }
    };
    imgs.each(function(){
        $(this).on('load', countImg);
    });
}

function displayArt(n){
    var isLoaded = document.getElementsByClassName("artwork")[n].complete;
    if (isLoaded) showArt(n);
    else {
        $("#artcon" + n + " .artwork").on('load', function () {
            showArt(n);
        });
    }
}

function showArt(m){
    $("#dotcon" + m).animate({"opacity": 0});
    setTimeout(function(){
        $("#artcon" + m).css("opacity", 1);
    }, 100);
    numLoaded++;
    if (numLoaded == num) stopLoading = true;
}

