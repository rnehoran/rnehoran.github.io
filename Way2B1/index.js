function search() {
	const NO_REPOS = 0;
	const USER_NOT_FOUND = 1;
	var username = document.getElementById("username").value;
	var data;
	var url = "https://api.github.com/users/" + username + "/repos"
    $.get(url, function(data) {
    	if(data[0] == undefined) error(username, NO_REPOS);
		var output;
        var avatarSRC = data[0].owner.avatar_url;
		output = '<table><tr><td style="vertical-align: top; padding: 20px"><a href="https://github.com/' + username + '" id="avatar_link">' +
															'<img id="avatar" src="' + avatarSRC + '">' +
														'</a></td><td style="padding: 20px; padding-top: 0; padding-bottom: 0;">';
        output += '<h2>' + username + '\'s Repositories:</h2>';
        for (i = 0; i < data.length; i++){
	    	output += data[i].name + '<br>';
        }
        output += "</td></tr></table>";
	    document.getElementById("output").innerHTML = output;
    }).fail(function() {
    	error(username, USER_NOT_FOUND);
    });
}

function error(username, err) {
	const NO_REPOS = 0;
	const USER_NOT_FOUND = 1;
	if(err == NO_REPOS) {
		document.getElementById("output").innerHTML = "<br>user " + username + " has no repositories on GitHub";
	}
	else if (err == USER_NOT_FOUND) {
		document.getElementById("output").innerHTML = "<br>username " + username + " not found in GitHub database";
	}
}

function keyPress(event) {
	if (event.keyCode == 13){
		search();
	}
}