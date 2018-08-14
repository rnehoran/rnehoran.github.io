const MOVING = false;
const READY = true;
var state = READY;
const DOWN = true;
const UP = false;

function onload() {
	$(document).keypress(e => {
	});
	$(document).bind('mousewheel', e => {
		if (e.originalEvent.wheelDelta < 0) {
	        go();
	    } else {
	        go(UP);
	    }
	});
}

function go(dir = DOWN) {
	if (state === MOVING) {
		return;
	}
	state = MOVING;
	if (dir === DOWN) {
		console.log("go(): is going DOWN");
	} else if (dir === UP) {
		console.log("go(): is going UP");
	} else {
		console.error("go(dir): dir must be either DOWN or UP");
	}
	$("#bg2").animate({
		top: "0%"
	}, 1000, function() {
		state = READY;
	});
	$("#bg1").animate({
		top: "-100%"
	}, 1000, function() {
		state = READY;
	});
}
