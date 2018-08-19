const statictext = "I love ";
const pages = [
	{"text": "stuff", "src": ["images/altamont.jpg", "images/perito_moreno.jpg"], "cursrc": 0},
	{"text": "things", "src": ["images/perito_moreno.jpg"], "cursrc": 0},
	{"text": "you!", "src": ["images/altamont.jpg"], "cursrc": 0}
];
var curPage = 0;

const MOVING = false;
const READY = true;
var state = READY;

// for calling go()
const DOWN = 0;
const UP = 1;
const LEFT = 2;
const RIGHT = 3;

const animLen = 1000;
const safetyDelay = 10;
// TODO: fix lag in a different way, you can see the safetyDelay vvvv
// have background be the new image right when animation starts to prevent white bar instead of safety delay


function onload() {

	// create pages
	for (var i = 0; i < pages.length; i++) {
		var page = $("#templates").find(".page").clone();
		for (var j = 0; j < pages[i].src.length; j++) {
			var bg = $("#templates").find(".bg").clone();
			bg.addClass("bg" + j);
			bg.css("background-image", "url(" + pages[i].src[j] + ")");
			if (j > 0) {
				bg.css("left", "100%");
			}
			page.prepend(bg);
		}
		if (i > 0) {
			page.css("top", "100%");
		}
		page.attr("id", "page" + i);
		page.find(".maintext").append(pages[i].text);
		$("body").append(page);
	}
	$(".statictext").text(statictext)

	// movement
	const upKeys = ['ArrowUp', 'ArrowLeft', 'a', 'w', 'j', 'i', 'PageUp'];
	const downKeys = ['ArrowDown', 'ArrowRight', 's', 'd', 'k', 'l', 'PageDown', ' ', 'Enter', 'Tab']
	$(document).keydown(e => {
		if (upKeys.includes(e.key)) {
			go(UP)
			return;
		}
		if (downKeys.includes(e.key)) {
			go()
			return;
		}
	});
	$(document).bind('mousewheel', e => {
		if (e.originalEvent.wheelDelta < 0) {
	        go();
	    } else {
	        go(UP);
	    }
	});
	$(document).bind('DOMMouseScroll', e => {
		if(e.originalEvent.detail > 0) {
	        go();
	    } else {
	        go(UP);
		}
	});
	$(".navbtn").click(e => {
		go(LEFT);
	});
}

function go(dir = DOWN, toPage = -1) {
	if (state !== READY) {
		return;
	}
	state = MOVING;
	switch(dir) {
		case LEFT:
			$("#page" + curPage).find(".bg" + pages[curPage].cursrc).animate({
				left: "100%"
			}, animLen, function() {});
			pages[curPage].cursrc = (((pages[curPage].cursrc - 1) % pages[curPage].src.length) + pages[curPage].src.length) % pages[curPage].src.length;
			console.log(pages[curPage].cursrc);
			$("#page" + curPage).find(".bg" + pages[curPage].cursrc).css({
				"left": "-100%"
			});
			$("#page" + curPage).find(".bg" + pages[curPage].cursrc).animate({
				left: "0%"
			}, animLen, function() {
				state = READY;
			});
			return;
		case RIGHT:
			$("#page" + curPage).find(".bg" + pages[curPage].cursrc).animate({
				left: "-100%"
			}, animLen, function() {
				$(this).css({
					"left": "100%"
				});
				state = READY;
			});
			pages[curPage].cursrc = (pages[curPage].cursrc + 1) % pages[curPage].src.length;
			$("#page" + curPage).find(".bg" + pages[curPage].cursrc).animate({
				left: "0%"
			}, animLen, function() {});
			return;
		case UP:
			if (curPage <= 0) {
				state = READY;
				return;
			}
			curPage--;
			setTimeout(function() {
				$("#page" + (curPage + 1)).animate({
					top: "100%"
				}, animLen, function() {
					state = READY;
				});
			}, safetyDelay);
			console.log("go(): is going UP to page " + curPage);
			$("#page" + curPage).animate({
				top: "0%"
			}, animLen, function() {});
			return;
		default:
			if (curPage >= pages.length - 1) {
				state = READY;
				return;
			}
			curPage++;
			setTimeout(function() {
				$("#page" + (curPage - 1)).animate({
					top: "-100%"
				}, animLen, function() {
					state = READY;
				});
			}, safetyDelay);
			console.log("go(): is going DOWN to page " + curPage);
			$("#page" + curPage).animate({
				top: "0%"
			}, animLen, function() {});
			return;
	}
}
