const MOVING = false;
const READY = true;
var state = READY;

const DOWN = true;
const UP = false;

const animLen = 1000;

function onload() {
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
}

function go(dir = DOWN) {
	if (state === MOVING) {
		return;
	}
	state = MOVING;
	if (dir === DOWN) {
		console.log("go(): is going DOWN");
		$("#bg2").animate({
			top: "0%"
		}, animLen, function() {
			state = READY;
		});
		$("#bg1").animate({
			top: "-100%"
		}, animLen, function() {
			state = READY;
		});
		return
	}
	if (dir === UP) {
		console.log("go(): is going UP");
		$("#bg2").animate({
			top: "100%"
		}, animLen, function() {
			state = READY;
		});
		$("#bg1").animate({
			top: "0%"
		}, animLen, function() {
			state = READY;
		});
		return;
	}
	console.error("go(dir): dir must be either DOWN or UP");
}
