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
	const upKeys = ['ArrowUp', 'w', 'i', 'PageUp'];
	const downKeys = ['ArrowDown', 's', 'k', 'PageDown', ' ', 'Enter', 'Tab'];
	const leftKeys = ['ArrowLeft', 'a', 'j', 'Home'];
	const rightKeys = ['ArrowRight', 'd', 'l', 'End'];
	$(document).keydown(e => {
		if (upKeys.includes(e.key)) {
			go(UP);
			return;
		}
		if (downKeys.includes(e.key)) {
			go();
			return;
		}
		if (leftKeys.includes(e.key)) {
			go(LEFT);
			return;
		}
		if (rightKeys.includes(e.key)) {
			go(RIGHT);
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
		if ($(e.target).hasClass("left")) {
			go(LEFT);
		} else if ($(e.target).hasClass("right")) {
			go(RIGHT);
		} else if ($(e.target).hasClass("up")) {
			go(UP);
		} else if ($(e.target).hasClass("down")) {
			go(DOWN);
		}
	});
}

function go(dir = DOWN, toPage = -1) {
	if (state !== READY) {
		return;
	}
	state = MOVING;
	switch(dir) {
		case LEFT:
			var curBG = pages[curPage].cursrc;
			var nextBG = (((pages[curPage].cursrc - 1) % pages[curPage].src.length) + pages[curPage].src.length) % pages[curPage].src.length;
			pages[curPage].cursrc = nextBG;
			$("body").css("background-image", "url(" + pages[curPage].src[nextBG] + ")");
			$("#page" + curPage).find(".bg" + curBG).animate({
				left: "100%"
			}, animLen, function() {});
			$("#page" + curPage).find(".bg" + nextBG).css({
				"left": "-100%"
			});
			$("#page" + curPage).find(".bg" + nextBG).animate({
				"left": "0%"
			}, animLen, function() {
				state = READY;
			});
			return;
		case RIGHT:
			var curBG = pages[curPage].cursrc;
			var nextBG = (pages[curPage].cursrc + 1) % pages[curPage].src.length;
			pages[curPage].cursrc = nextBG;
			$("body").css("background-image", "url(" + pages[curPage].src[nextBG] + ")");
			$("#page" + curPage).find(".bg" + curBG).animate({
				left: "-100%"
			}, animLen, function() {
				$(this).css({
					"left": "100%"
				});
				state = READY;
			});
			$("#page" + curPage).find(".bg" + nextBG).animate({
				left: "0%"
			}, animLen, function() {});
			return;
		case UP:
			if (curPage <= 0) {
				state = READY;
				return;
			}
			$("body").css("background-image", "url(" + pages[curPage - 1].src[pages[curPage - 1].cursrc] + ")");
			$("#page" + curPage).animate({
				top: "100%"
			}, animLen, function() {
				state = READY;
			});
			curPage--;
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
			$("body").css("background-image", "url(" + pages[curPage + 1].src[pages[curPage + 1].cursrc] + ")");
			$("#page" + curPage).animate({
				top: "-100%"
			}, animLen, function() {
				state = READY;
			});
			curPage++;
			console.log("go(): is going DOWN to page " + curPage);
			$("#page" + curPage).animate({
				top: "0%"
			}, animLen, function() {});
			return;
	}
}
