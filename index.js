const prelimPages = 2;
const statictext = "I love ";
const pages = [
	{"text": "I'm Roy Nehoran", "src": ["images/altamont.jpg", "images/perito_moreno.jpg"], "shadow": ["#5386c4", "#ff0000"], "cursrc": 0},
	{"text": "I go to Stanford", "src": ["images/altamont.jpg", "images/perito_moreno.jpg"], "shadow": ["#5386c4", "#ff0000"], "cursrc": 0},
	{"text": "programming", "src": ["images/altamont.jpg", "images/perito_moreno.jpg"], "shadow": ["#5386c4", "#ff0000"], "cursrc": 0},
	{"text": "traveling", "src": ["images/perito_moreno.jpg"], "shadow": ["#000000"], "cursrc": 0},
	{"text": "painting", "src": ["images/perito_moreno.jpg"], "shadow": ["#000000"], "cursrc": 0},
	{"text": "sports", "src": ["images/perito_moreno.jpg"], "shadow": ["#000000"], "cursrc": 0},
	{"text": "dogs", "src": ["images/altamont.jpg"], "shadow": ["#ffffff"], "cursrc": 0},
	{"text": "meeting new people", "src": ["images/altamont.jpg"], "shadow": ["#ffffff"], "cursrc": 0}
];
var curPage = 0;
const text_shadow_attrs = ["0px 0px 15px ", "-webkit-text-shadow", "-moz-text-shadow", "text-shadow"];

const MOVING = false;
const READY = true;
var state = READY;

// for calling go()
const DOWN = 0;
const UP = 1;
const LEFT = 2;
const RIGHT = 3;

const animLen = 1000;

var interval;
const carouselInterval = 10000;
// TODO: make sure interval stops when out of focus
// TODO: make sure multiline titles work


function disappear(object) {
	object.animate({
		"opacity": 0
	}, animLen, function() {
		$(this).hide();
	});
}

function appear(object) {
	object.show();
	object.animate({
		"opacity": 1
	}, animLen, function() {});
}

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
		if (i < prelimPages) {
			page.find(".statictext").hide();
			$(".page.statictext").css("top", "100%")
		}
		if (i > 0) {
			page.css("top", "100%");
		}
		page.attr("id", "page" + i);
		page.find(".maintext").append(pages[i].text);
		$("body").append(page);
	}
	$(".maintext.statictext, .invisible.statictext").text(statictext)

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
	$("div.navbtn").hover(function() {
		$(this).find("button.navbtn").addClass("hover");
	}, function() {
		$(this).find("button.navbtn").removeClass("hover");
	});

	// carousel
	interval = setTimeout(function() {
		go(RIGHT);
	}, carouselInterval);
	$(window).on("blur focus", function(e) {
	    var prevType = $(this).data("prevType");

	    if (prevType != e.type) {   //  reduce double fire issues
	        switch (e.type) {
	            case "blur":
	            	clearTimeout(interval);
	            	console.log("blur");
	                break;
	            case "focus":
	            	console.log("focus");
					interval = setTimeout(function() {
						go(RIGHT);
					}, carouselInterval);
	                break;
	        }
	    }

	    $(this).data("prevType", e.type);
	})
}

function go(dir = DOWN, toPage = -1) {
	if (state !== READY) {
		return;
	}
	state = MOVING;
	switch(dir) {
		case LEFT:
			if (pages[curPage].src.length < 2) {
				state = READY;
				return;
			}
			clearTimeout(interval);
			interval = setTimeout(function() {
				go(RIGHT);
			}, carouselInterval);
			var curBG = pages[curPage].cursrc;
			var nextBG = (((pages[curPage].cursrc - 1) % pages[curPage].src.length) + pages[curPage].src.length) % pages[curPage].src.length;
			pages[curPage].cursrc = nextBG;
			$("body").css("background-image", "url(" + pages[curPage].src[nextBG] + ")");
			$("#page" + curPage).find(".bg" + curBG).animate({
				"left": "100%"
			}, animLen, function() {});
			$("#page" + curPage).find(".bg" + nextBG).css({
				"left": "-100%"
			});
			$(".maintext").css({
				"-webkit-text-shadow": "0px 0px 15px " + pages[curPage].shadow[nextBG],
				"-moz-text-shadow": "0px 0px 15px " + pages[curPage].shadow[nextBG],
				"text-shadow": "0px 0px 15px " + pages[curPage].shadow[nextBG]
			});
			$("#page" + curPage).find(".bg" + nextBG).animate({
				"left": "0%"
			}, animLen, function() {
				state = READY;
			});
			return;
		case RIGHT:
			if (pages[curPage].src.length < 2) {
				state = READY;
				return;
			}
			clearTimeout(interval);
			interval = setTimeout(function() {
				go(RIGHT);
			}, carouselInterval);
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
			$(".maintext").css({
				"-webkit-text-shadow": "0px 0px 15px " + pages[curPage].shadow[nextBG],
				"-moz-text-shadow": "0px 0px 15px " + pages[curPage].shadow[nextBG],
				"text-shadow": "0px 0px 15px " + pages[curPage].shadow[nextBG]
			});
			$("#page" + curPage).find(".bg" + nextBG).animate({
				left: "0%"
			}, animLen, function() {
			});
			return;
		case UP:
			if (curPage <= 0) {
				state = READY;
				return;
			}
			clearTimeout(interval);
			interval = setTimeout(function() {
				go(RIGHT);
			}, carouselInterval);
			$("body").css("background-image", "url(" + pages[curPage - 1].src[pages[curPage - 1].cursrc] + ")");
			$("#page" + curPage).animate({
				top: "100%"
			}, animLen, function() {
				state = READY;
			});
			if (curPage === prelimPages) {
				$(".page.statictext").animate({
					top: "100%"
				}, animLen, function() {});
			}
			curPage--;
			console.log("go(): is going UP to page " + curPage);
			if (curPage === 0) {
				disappear($(".navbtn.up"));
			} else {
				appear($(".navbtn.up"));
			}
			if (curPage === pages.length - 1) {
				disappear($(".navbtn.down"));
			} else {
				appear($(".navbtn.down"));
			}
			if (pages[curPage].src.length < 2) {
				disappear($(".navbtn.left, .navbtn.right"));
			} else {
				appear($(".navbtn.left, .navbtn.right"));
			}
			$(".maintext").css({
				"-webkit-text-shadow": "0px 0px 15px " + pages[curPage].shadow[pages[curPage].cursrc],
				"-moz-text-shadow": "0px 0px 15px " + pages[curPage].shadow[pages[curPage].cursrc],
				"text-shadow": "0px 0px 15px " + pages[curPage].shadow[pages[curPage].cursrc]
			});
			$("#page" + curPage).animate({
				top: "0%"
			}, animLen, function() {
			});
			return;
		default:
			if (curPage >= pages.length - 1) {
				state = READY;
				return;
			}
			clearTimeout(interval);
			interval = setTimeout(function() {
				go(RIGHT);
			}, carouselInterval);
			$("body").css("background-image", "url(" + pages[curPage + 1].src[pages[curPage + 1].cursrc] + ")");
			$("#page" + curPage).animate({
				top: "-100%"
			}, animLen, function() {
				state = READY;
			});
			curPage++;
			console.log("go(): is going DOWN to page " + curPage);
			if (curPage === prelimPages) {
				$(".page.statictext").animate({
					top: 0
				}, animLen, function() {});
			}
			if (curPage === 0) {
				disappear($(".navbtn.up"));
			} else {
				appear($(".navbtn.up"));
			}
			if (curPage === pages.length - 1) {
				disappear($(".navbtn.down"));
			} else {
				appear($(".navbtn.down"));
			}
			if (pages[curPage].src.length < 2) {
				disappear($(".navbtn.left, .navbtn.right"));
			} else {
				appear($(".navbtn.left, .navbtn.right"));
			}
			$(".maintext").css({
				"-webkit-text-shadow": "0px 0px 15px " + pages[curPage].shadow[pages[curPage].cursrc],
				"-moz-text-shadow": "0px 0px 15px " + pages[curPage].shadow[pages[curPage].cursrc],
				"text-shadow": "0px 0px 15px " + pages[curPage].shadow[pages[curPage].cursrc]
			});
			$("#page" + curPage).animate({
				top: "0%"
			}, animLen, function() {
			});
			return;
	}
}
