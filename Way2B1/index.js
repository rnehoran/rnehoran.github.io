const NO_REPOS = 0;
const USER_NOT_FOUND = 1;

/********************************
 * Function: search
 * Params: none
 * displays user avatar and repositories
 * called by pressing "Search" button
 * 
 ********************************/
function search() {
	var username = document.getElementById("username").value;
	var data;
	var url = "https://api.github.com/users/" + username + "/repos";

	// clear search bar
	clearSearchField();

	// get JSON for user repositories,
	// error check for no repositories,
	// display avatar and heading,
	// display each repository,
	// show compare button,
	// error check for user not found
    $.get(url, function(data) {
    	if(data[0] == undefined){
    		error(username, NO_REPOS);
    	}
		var output;
        var avatarSRC = data[0].owner.avatar_url;
		output = '<table><tr><td style="vertical-align: top; padding: 20px"><a href="https://github.com/' + username + '" id="avatar_link">' +
															'<img id="avatar" src="' + avatarSRC + '">' +
														'</a></td><td style="vertical-align: top; padding: 20px; padding-top: 0; padding-bottom: 0;">';
        output += '<h2>' + username + '\'s Repositories:</h2>';
        for (var i in data){
	    	output += data[i].name + '<br>';
        }
        output += "</td></tr></table>";
	    document.getElementById("output").innerHTML = output;
		$("#last_username").html(username);
	    if ($("#last_username").html() != "") {
	    	$(".compare").css("display", "inline");
	    }
    }).fail(function() {
    	error(username, USER_NOT_FOUND);
    });
}

/********************************
 * Function: compare
 * Params: none
 * sets up display of followers in common between two users
 * called by pressing "Compare" button
 * 
 ********************************/
function compare() {
	const NO_REPOS = 0;
	const USER_NOT_FOUND = 1;
	const NO_FOLLOWERS = 2;
	var username = document.getElementById("username").value;
	var lastUsername = $("#last_username").html();
	var data;
	var avatarSRC;
	var avatarSRC2;
	var repoURL = "https://api.github.com/users/" + username + "/repos";
	var repoURL2 = "https://api.github.com/users/" + lastUsername + "/repos";

	// clear search bar
	clearSearchField();

	// check if same user
	if (username == lastUsername) {
		document.getElementById("output").innerHTML = "<br> Please enter another username to compare to";
		return;
	}

	// get avatars from repos page
	$("#last_username").html(username);
    $.get(repoURL, function(data) {
    	if(data[0] == undefined){
    		error(username, NO_REPOS);
    	}
        avatarSRC = data[0].owner.avatar_url;
	    $.get(repoURL2, function(data2) {
	    	if(data2[0] == undefined){
	    		error(lastUsername, NO_REPOS);
	    	}
	        avatarSRC2 = data2[0].owner.avatar_url;
	    }).fail(function() {
	    	error(lastUsername, USER_NOT_FOUND);
	    });
    }).fail(function() {
    	error(username, USER_NOT_FOUND);
    });

    // get followers
    // call inCommon to find and display followers in common
	var url = "https://api.github.com/users/" + username + "/followers";
	var url2 = "https://api.github.com/users/" + lastUsername + "/followers";
    $.get(url, function(data) {
	    $.get(url2, function(data2) {
	    	inCommon(data, data2, username, lastUsername, avatarSRC, avatarSRC2);
	    });
    }).fail(function() {
    	error(username, USER_NOT_FOUND);
    });
}

/********************************
 * Function: inCommon
 * Params: data, current user's follower JSON
 * 		   data2, last user's follower JSON
 * 		   username, current user's username
 * 		   lastUsername
 * 		   avatarSRC, current user's avatar
 * 		   avatarSRC2, last user's avatar
 * displays followers in common between two users
 * called by pressing "Compare" button
 * 
 ********************************/
function inCommon(data, data2, username, lastUsername, avatarSRC, avatarSRC2) {

	// creates array of followers for each user
	// finds intersection between them
	var followers = [];
	for (var user in data){
		followers.push(data[user].login);
	}
	var followers2 = [];
	for (var user in data2){
		followers2.push(data2[user].login);
	}
	var intersection = [...followers].filter(x => followers2.includes(x));

	// displays avatars and followers in common
	output = '<table><tr><td style="vertical-align: top; padding: 20px">' +
				'<a href="https://github.com/' + username + '" id="avatar_link">' +
				'<img id="avatar" src="' + avatarSRC + '"></a>' +
				'<a href="https://github.com/' + lastUsername + '" id="avatar_link">' +
				'<img id="avatar" src="' + avatarSRC2 + '"></a>' +
				'</td><td style="vertical-align: top; padding: 20px; padding-top: 0; padding-bottom: 0;">';
    if (intersection.length == 0){
	    output += '<br><br>No followers in common between <b>' + username + '</b> and <b>' + lastUsername + '</b>';
    }
    else {
	    output += '<h2>Followers in common between ' + username + ' and ' + lastUsername + ':</h2>';
    }
    for (var commonFollower in intersection){
    	output += intersection[commonFollower] + '<br>';
    }
    output += "</td></tr></table>";
    document.getElementById("output").innerHTML = output;
}

/********************************
 * Function: error
 * Params: username
 * 		   err, error code defined in constants
 * displays errors to user
 * called by compare and search
 * 
 ********************************/
function error(username, err) {
	$("#last_username").html("");
	$(".compare").css("display", "none");
	if(err == NO_REPOS) {
		document.getElementById("output").innerHTML = "<br>user <b>" + username + "</b> has no public repositories on GitHub";
	}
	else if (err == USER_NOT_FOUND) {
		document.getElementById("output").innerHTML = "<br>username <b>" + username + "</b> not found in GitHub database";
	}
}

/********************************
 * Function: keyPress
 * Params: event
 * calls search when enter is pressed
 * called when a key is pressed
 * 
 ********************************/
function keyPress(event) {
	if (event.keyCode == 13){
		search();
	}
}

/********************************
 * Function: clearSearchField
 * Params: none
 * clears search bar
 * called on search or compare
 * 
 ********************************/
function clearSearchField() {
	document.getElementById("username").value = "";
}