/*****************
 GLOBAL VARIABLES
 *****************/

// holds the last response from web.go
var response = "";
// stores whether the current drag event is an on or off selection
// (whether the selection started with a selected or unselected node,
//      to decide whether to select or deselect the nodes dragged over)
var selectOn = true;
// index of where the drag started
var firstDragNode = -1;
// array of all of the nodes
var nodes = document.getElementsByClassName("node");
// drag can go back and forth, so max and min drag node record
//      the first and last nodes of the current selection from the drag, while
//      extreme min and max record the smallest and largest node number reached
//          by the current drag, whether or not currently selected
// maximum node number that is selected in the current drag
var maxDragNode;
// minimum node number that is selected in the current drag
var minDragNode;
// maximum node number that was reached in current drag
var extremeMax;
// minimum node number reached in the current drag
var extremeMin;
// saves the last node passed through in the current
var lastDrag;



/*************************
 NODE TO OBJECT FUNCTIONS
 *************************/

// input a res object (row from res table)
//      returns its index in the reservations array
function getResIndexFromObj(obj) {
    return parseInt((obj.attr("id")).slice(3));
}

// input the index of a reservation in the reservations array
//      returns the respective object
function getObjFromResIndex(index) {
    return $("#res" + index);
}

// input the name of a reservation
//      returns the respective index in the reservations array
function getResIndexByName(name) {
    if (name === "") {
        return -1;
    }
    for (var i = 0; i < reservations.length; i++) {
        if (reservations[i].Name === name) {
            return i;
        }
    }
    return -1;
}

// input a node object
//      returns its node number
function getNodeIndexFromObj(obj) {
    return parseInt(obj.attr("id"));
}

// input a node number
//      returns the object of that node
function getObjFromNodeIndex(index) {
    return $("#" + index);
}



/*************************************
 NODE/RESERVATION SELECTION FUNCTIONS
 *************************************/

 // array of the currently selected nodes, kept in increasing order
 //      to create ranges on commands
 var selectedNodes = [];
 // currently selected reservation in the reservation table:
 //      its index in the reservations array
 //      (only one reservation can be selected at a time)
 //      -1 if none selected
 var selectedRes = -1;
 // whether the actions on reservations are shown (delete and extend)
 //      if not shown, then only power-cycle will appear
 var resActionShown = false;

// select a reservation or node(s)
//      will do nothing if already selected
//      called on an object representing a single reservation, or
//          one or several nodes
// to call this, use JQuery
//      for a reservation: select($("#res[RES_INDEX]"))
//      for a node: select($("#[NODE_NUMBER]"))
//      for several nodes: select($(".node.[CLASS]"))
function select(obj) {
    if (obj.length === 0) return;
    if (obj.hasClass("active")) return;
    // if node
    if (obj.hasClass("node")) {
        // add all of the nodes (or one) to the selectedNodes array
        obj.each(function () {
            if ($(this).hasClass("active")) return;
            if (selectedNodes.includes(getNodeIndexFromObj($(this)))) return;
            selectedNodes.push(getNodeIndexFromObj($(this)));
        });
        selectedNodes.sort((a, b) => a - b);
    // if reservation
    } else {
        var selectedResTemp = getResIndexFromObj(obj);
        // deselect res table before selecting the new reservation
        //      hide res action bar only if reservation just selected is down
        //      (see checkHideActionBar())
        deselectTable((selectedResTemp === 0) ? 0 : -2);
        selectedRes = selectedResTemp;
        // select all nodes that are in the reservation
        //      all nodes will be deselected by now, so toggle works
        toggleNodes(reservations[selectedRes].Nodes);
    }
    obj.addClass("active");
    showActionBar();
}

// deselect a reservation or node(s)
//      no action if already deselected
//      updates selectedRes/selectedNodes
// call using JQuery, similar to select() above ^
function deselect(obj) {
    if (!obj.hasClass("active")) return;
    obj.removeClass("active");
    // if node
    if (obj.hasClass("node")) {
        // remove all nodes in object from selectNodes array
        obj.each(function () {
            selectedNodes.splice(selectedNodes.indexOf(getNodeIndexFromObj($(this))), 1);
        });
    // if reservation
    } else {
        selectedRes = -1;
    }
    checkHideActionBar();
}

// toggle a list of nodes between selected and unselected, separately
function toggleNodes(nodes) {
    for (var i = 0; i < nodes.length; i++) {
        toggle(getObjFromNodeIndex(nodes[i]));
    }
}

// toggle a specific object (reservation or node)
//      between selected and unselected
function toggle(obj) {
    if (obj.hasClass("active")) {
        deselect(obj);
        return true;
    } else {
        select(obj);
        return false;
    }
}

// select or deselect a range of nodes
//      range is startNode to endNode, inclusive
//      toOn determines whether to change to
//          selected (true) or unselected (false)
function selectNodes(startNode, endNode, toOn) {
    for (var i = 0; i <= Math.abs(endNode - startNode); i++) {
        var node = Math.min(endNode, startNode) + i;
        if (toOn) {
            select(getObjFromNodeIndex(node));
        } else {
            deselect(getObjFromNodeIndex(node));
        }
    }
}

// deselect the entire grid of nodes
function deselectGrid() {
    $(".node").removeClass("active");
    selectedNodes = [];
    checkHideActionBar()
}

// deselect the entire reservation table
//      change selectedRes to given index
//      hides action bar if new selected index is 0 (down)
function deselectTable(sr = -1) {
    $(".res").removeClass("active");
    selectedRes = sr;
    checkHideActionBar()
}

// show the bar at the bottom of the screen with actions to carry on selections
//      if only nodes are selected, only power-cycle is shown
//      if a reservation is selected, delete and extend are also shown
function showActionBar() {
    updateSelectText();
    if (selectedRes > 0) {
        showResActions();
    } else {
        hideResActions();
    }
    $("#actionbar").addClass("active");
}

// hide the action bar if only nodes are selected, and
//      take care of res actions
function checkHideActionBar() {
    updateSelectText();
    if (selectedRes === -1 || selectedRes === 0) {
        hideResActions();
        if (selectedNodes.length === 0) {
            hideActionBar();
        }
    } else {
        showResActions();
    }
}

// update the select text to the current number of nodes selected
function updateSelectText() {
    if (selectedNodes.length === 1) {
        $("#selecttext").show();
        $("#selecttext").text("1 node selected");
    } else if (selectedNodes.length > 1) {
        $("#selecttext").show();
        $("#selecttext").text(selectedNodes.length + " nodes selected");
    } else {
        $("#selecttext").hide();
    }
}

// hide the action bar
function hideActionBar() {
    $("#actionbar").removeClass("active");
}

// show the reservation actions (delete and extend)
function showResActions() {
    $(".resaction").fadeIn(200, function() {
        $(".resaction").show();
    });
}

// hide the reservation actions (delete and extend) but leave power-cycle
// generally used if going from reservation selection to just node selection
function hideResActions() {
    $(".resaction").fadeOut(200, function() {
        $(".resaction").hide();
    });
}

// deselect all on outside click
$(document).click(function(event) {
    if (!$(event.target).hasClass("node") &&
        !$(event.target).hasClass("res") &&
        !$(event.target).hasClass("igorbtn") &&
        !$(event.target).hasClass("mdl") &&
        !$(event.target).hasClass("actionbar") &&
        !$(event.target).hasClass("navbar")) {
        deselectGrid();
        deselectTable();
    }
});



/********************
 EXECUTION FUNCTIONS
 ********************/

// how long to wait after sending a request before giving up and showing
//      timeout error
// var timeoutLength = 10000;

function getNodesFromRangeString(s) {
    var nodes = [];
    var tokens = s.split(", ");
    for (var i = 0; i < tokens.length; i++) {
        var s;
        if (tokens[i].indexOf("-") != -1) {
            var lims = tokens[i].split("-");
            for (var i = parseInt(lims[0]); i <= parseInt(lims[1]); i++) {
                nodes.push(i);
            }
        } else {
            nodes.push(parseInt(tokens[i]));
        }
    }
    return nodes;
}

var commandObj;
// send a command to web.go for execution, stored in the "command" variable
//      when response is received, the function onResponse is called,
//      which can use "response" to decide how to proceed
// times out after a set time in case igor hangs, and
//      sends a timeout error to user
function execute(onResponse) {
    $(".responseparent").hide();
    $("#deletemodaldialog").addClass("modal-sm");
    response = "";
    $(".command").html(command);
    // would communicate with server here
    // var hasTimedOut = false;
    // var timeout = setTimeout(function() {
    //     hasTimedOut = true;
    //     response = {Success: false, Message: "Error: timeout after " + timeoutLength/1000 + " seconds"}
    //     parseResult(false);
    //     hideLoaders();
    // }, timeoutLength);
    // $.get(
    //     "/run/",
    //     {run: command},
    //     function(data) {
            // if (hasTimedOut) return;
            // clearTimeout(timeout);
    setTimeout(function() {
        var extra = reservations.slice();
        switch (commandObj.Command) {
            case "sub":
                var nodeList = [];
                if (commandObj.isNodeList) {
                    nodeList = getNodesFromRangeString(commandObj.Nodes);
                } else {
                    var start = Math.floor(Math.random() * (endNode - startNode - parseInt(commandObj.NodeNum))) + startNode;
                    for (var i = start; i < start + parseInt(commandObj.NodeNum); i++) {
                        nodeList.push(i);
                    }
                }
                extra.push({"Name": commandObj.Name, "Owner": commandObj.Owner, "StartInt": 0 + commandObj.Start, "EndInt": 3600000 + commandObj.Start, "Nodes": nodeList});
                break;
            case "spec":
                extra = [
                    {"StartInt": 0, "EndInt": 3600000},
                    {"StartInt": 3600000, "EndInt": 7200000},
                    {"StartInt": 7200000, "EndInt": 10800000},
                    {"StartInt": 10800000, "EndInt": 14400000},
                    {"StartInt": 14400000, "EndInt": 18000000},
                    {"StartInt": 18000000, "EndInt": 21600000},
                    {"StartInt": 21600000, "EndInt": 25200000},
                    {"StartInt": 25200000, "EndInt": 28800000},
                    {"StartInt": 28800000, "EndInt": 32400000},
                    {"StartInt": 32400000, "EndInt": 36000000}
                ];
                break;
            case "del":
                extra.splice(commandObj.Index, 1);
                break;
            case "power":
                var nodeList;
                if (commandObj.isByRes) {
                    nodeList = extra[getResIndexByName(commandObj.ReservationName)].Nodes;
                } else {
                    nodeList = getNodesFromRangeString(commandObj.Nodes);
                }
                switch (commandObj.Type) {
                    case "on":
                        for (var i = 0; i < nodeList.length; i++) {
                            var ind = extra[0].Nodes.indexOf(nodeList[i]);
                            if (ind === -1) continue;
                            extra[0].Nodes.splice(ind, 1);
                        }
                        break;
                    case "cycle":
                        setTimeout(function() {
                            var resCopy = reservations.slice();
                            for (var i = 0; i < nodeList.length; i++) {
                                var ind = resCopy[0].Nodes.indexOf(nodeList[i]);
                                if (ind === -1) continue;
                                resCopy[0].Nodes.splice(ind, 1);
                            }
                            parseReservationData(resCopy);
                        }, 5000);
                    case "off":
                        for (var i = 0; i < nodeList.length; i++) {
                            var ind = extra[0].Nodes.indexOf(nodeList[i]);
                            if (ind != -1) continue;
                            extra[0].Nodes.push(nodeList[i]);
                        }
                        break
                }
                break;
            case "extend":
                extra[getResIndexByName(commandObj.Name)].EndInt += commandObj.Length;
                break;
        }
        response = {"Success": true, "Message": "", "Extra": extra};
        onResponse();
    }, 700);
    //     }
    // );
}

// show response from web.go at the bottom of the currently open modal,
//      with green background on success and red on failure
//      generally called in the onResponse function passed into execute()
//      updates on screen reservations information on success
function parseResult(shouldUpdateReservations = true) {
    $(".response").html(response.Message);
    if (shouldUpdateReservations) {
        parseReservationData(response.Extra);
        // getReservations();
    }
    if (response.Success) {
        $(".responseparent").addClass("success");
    } else {
        $(".responseparent").removeClass("success");
    }
    $("#deletemodaldialog").removeClass("modal-sm");
    // $(".responseparent").show();
    return response.Success;
}

// when any button is clicked, hide the response from server
$(".igorbtn").click(function() {
    $(".responseparent").hide();
    $("#deletemodaldialog").addClass("modal-sm");
});

// send a request to web.go to issue an "igor show" command to update the
//      reservation information
function getReservations() {
    var hasTimedOut = false;
    var timeout = setTimeout(function() {
        hasTimedOut = true;
        location.reload();
    }, timeoutLength);
    $.get(
        "/run/",
        {run: "igor show"},
        function(data) {
            if (hasTimedOut) return;
            clearTimeout(timeout);
            var rsp = JSON.parse(data);
            parseReservationData(rsp.Extra);
        }
    );
}

// update reservation data displayed on page only if reservation data changed
function parseReservationData(resArray) {
    newReservations = sortReservations(resArray);
    // if (!equalReservations(reservations, newReservations)) {
        // save current selection information so it can be reselected when
        //      html is regenerated
        var curResName = "";
        if (selectedRes != -1) {
            curResName = reservations[selectedRes].Name;
        }
        var selectedNodestmp = selectedNodes;
        // update reservations array, but don't change "response" because
        //      this isn't considered a command
        reservations = newReservations;
        showReservations();
        // if a new reservation was just created (successfully),
        //      then select it
        if (newResName !== "" && response.Success) {
            selectedRes = getResIndexByName(newResName);
            newResName = "";
        } else {
            selectedRes = getResIndexByName(curResName);
        }
        // otherwise select what was already selected
        if (selectedRes != -1) {
            select(getObjFromResIndex(selectedRes));
        } else {
            for (var i = 0; i < selectedNodestmp.length; i++) {
                select(getObjFromNodeIndex(selectedNodestmp[i]));
            }
        }
    // }
}

// check if two reservation arrays are equal
//      true if contain equivalent information, false otherwise
// arrays must be presorted for accurate results
// checks four string attributes and node list length,
//      does not check actual nodes in reservation
// assumes nodes in reservation are constant since a reservation's creation
function equalReservations(a, b) {
    if (a.length !== b.length) return false;
    for (var i = 1; i < a.length; i++) {
        if (a[i].Name != b[i].Name) return false;
        if (a[i].Owner != b[i].Owner) return false;
        if (a[i].StartInt != b[i].StartInt) return false;
        if (a[i].EndInt != b[i].EndInt) return false;
        if (a[i].Nodes.length != b[i].Nodes.length) return false;
    }
    return true;
}

// // heartbeat: update reservations every set time
// var heartrate = 10000; // every 10 seconds
// var heartbeat = setInterval(function() {
//     getReservations();
// }, heartrate);
//
// // stop heartbeat when user clicks outside page
// $(window).blur(function() {
//     clearInterval(heartbeat);
//     heartbeat = 0;
// });
//
// // getReservations and restart heartbeat when user returns to page
// // (a.k.a. perform CPR)
// $(window).focus(function() {
//     if (!heartbeat) {
//         getReservations();
//         heartbeat = setInterval(function() {
//             getReservations();
//         }, heartrate);
//     }
// });

// show a loading circle on the the button clicked,
//      given an object referring to what was clicked
// disables all other buttons to force user to wait until the action completes,
//      and make it clear that the command is being sent for execution
// generally called when an action button is clicked on a modal,
//      until a response is received from web.go
// to finish the loading, call hideLoaders()
function showLoader(obj) {
    // hide text
    obj.children().eq(0).css("visibility", "hidden");
    // show loader circle
    obj.children().eq(1).css("visibility", "visible");
    // disable all buttons
    // $(".dash, .edash, .pdash").prop("disabled", true);
    $(".igorbtn").prop("disabled", true);
    $(".cancel").prop("disabled", true);
}

// return the application to the user when loading completes
// generally called when a response is received from web.go and the
//      application is currently in loading state due to showLoader
function hideLoaders() {
    $(".loader").css("visibility", "hidden");
    $(".mdlcmdtext").css("visibility", "visible");
    // $(".dash, .edash, .pdash").prop("disabled", false);
    $(".igorbtn").prop("disabled", false);
    $(".cancel").prop("disabled", false);
}

// update the node list field in the current command to the currently selected
//      nodes
// default is the new reservation node list field (-w),
//      specify a different element id if needed
function updateNodeListField(id = "dashw") {
    var list = "";
    for (var i = 0; i < selectedNodes.length; i++) {
        var node = selectedNodes[i];
        if (i != 0) {
            list += ", "
        }
        for (; i + 1 < selectedNodes.length && selectedNodes[i+1] === selectedNodes[i] + 1; i++);
        if (selectedNodes[i] != node) {
            list += node + "-" + selectedNodes[i];
            continue;
        }
        list += node;
    }
    $("#" + id).val(list);
}



/****************************************
 GENERATE NODE GRID AND RESERVATION TABLE
 ****************************************/

// sort reservation array for consistent display that doesn't keep switching
//      the order of the reservation like igor show does
// sort reservations based on:
//      start time, then
//      number of nodes, then
//      reservation name
function sortReservations(resArray = reservations.slice()) {
    resArray.sort(function (a, b) {
        if (a.Name === "") return -1;
        if (b.Name === "") return 1;
        var diff = a.StartInt - b.StartInt;
        if (diff === 0) {
            var diff = a.Nodes.length - b.Nodes.length;
            if (diff === 0) {
                if (a.Name > b.Name) {
                    diff = 1;
                } else {
                    diff = -1;
                }
            }
        }
        return diff;
    });
    if (arguments.length === 0) {
        reservations = resArray;
    }
    return resArray;
}

// convert millisecond date to a string for display purposes
var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function dateToString(num) {
    var date = new Date();
    date.setTime(date.getTime() + num);
    var string = ""
    string += months[date.getMonth()] + " " + date.getDate() + "&nbsp;&nbsp;";
    string += date.getHours() + ":";
    string += (date.getMinutes() < 10) ? "0" + date.getMinutes() : date.getMinutes();
    return string;
}

// display new reservation information on node grid and reservation table,
//      by clearing them and regenerating the html
// NOTE: this is usually so quick it won't even be visible if the data is
//          the same,
//          but every so often it will cause a user's clicks to be unregistered
function showReservations(){
    $("#nodegrid").html("");
    $("#res_table").html("");

    // POPULATE NODE GRID

    var newcol = '<div class="col" style="padding: 0">' +
    '    <div class="list-group" ';
    for (var i = 0; i < rackWidth; i++) {
        $('#nodegrid').append(newcol + 'id="col' + i + '"></div></div>');
    }
    var grid = '<div draggable="true" tabIndex="-1" style="opacity: 1; width:100%; padding: 12px; padding-left: 0px; padding-right: 0px; cursor: pointer;" ';
    for (var i = startNode; i <= endNode; i++) {
        col = (i - 1) % rackWidth;
        var classes = ' class="list-group-item list-group-item-action node up available unselected" ';
        $("#col" + col).append(grid + classes + ' id="' + i +'">' + i + '</div>');
    }

    // mark all nodes that are down
    for (var i = 0; i < reservations[0].Nodes.length; i++) {
        getObjFromNodeIndex(reservations[0].Nodes[i]).removeClass("up");
        getObjFromNodeIndex(reservations[0].Nodes[i]).addClass("down");
    }

    // mark all nodes that are reserved
    for (var j = 1; j < reservations.length; j++) {
        for (var i = 0; i < reservations[j].Nodes.length; i++) {
            getObjFromNodeIndex(reservations[j].Nodes[i]).removeClass("available");
            getObjFromNodeIndex(reservations[j].Nodes[i]).addClass("reserved");
        }
    }

    // select/deselect node on click
    $(".node").click(function(event) {
        deselectTable();
        toggle($(this));
    });

    // node hover to cause:
    //      reservations that have this reservation to hover
    //      color of node to hover in the key
    $(".node").hover(function() {
        var node = getNodeIndexFromObj($(this));
        for (var i = 0; i < reservations.length; i++) {
            if (reservations[i].Nodes.includes(node)) {
                getObjFromResIndex(i).addClass("hover");
            };
        }
        if ($(this).hasClass("available")) {
            $(".key.available.headtext").addClass("hover");
        }
        if ($(this).hasClass("reserved")) {
            $(".key.reserved.headtext").addClass("hover");
        }
        if ($(this).hasClass("up")) {
            $(".key.up.headtext").addClass("hover");
        }
        if ($(this).hasClass("down")) {
            $(".key.down.headtext").addClass("hover");
        }
        if ($(this).hasClass("available")) {
            if ($(this).hasClass("up")) {
                $(".key.available.up").addClass("hover");
            } else {
                $(".key.available.down").addClass("hover");
            }
        } else if ($(this).hasClass("reserved")) {
            if ($(this).hasClass("up")) {
                $(".key.reserved.up").addClass("hover");
            } else {
                $(".key.reserved.down").addClass("hover");
            }
        }
    });

    // remove res and key hover on exit
    $(".node").mouseleave(function() {
        $(".res, .key").removeClass("hover");
    });



    // NODE DRAGGING
    // (see global variables)

    // record drag information when it begins
    for (var i = 0; i < nodes.length; i++) {
        nodes[i].addEventListener("dragstart", function(event) {
            deselectTable();
            firstDragNode = $(event.target);
            maxDragNode = getNodeIndexFromObj(firstDragNode);
            minDragNode = maxDragNode;
            extremeMax = maxDragNode;
            extremeMin = maxDragNode;
            lastDrag = maxDragNode;
            if ($(event.target).hasClass("active")) {
                selectOn = false;
            } else {
                selectOn = true;
            }
            toggle($(event.target));
            // roundabout way to prevent "ghost" element during drag
            var crt = this.cloneNode(true);
            crt.style.display = "none";
            document.body.appendChild(crt);
            event.dataTransfer.setDragImage(crt, 0, 0);
            event.dataTransfer.setData('text/plain', '');
        }, false);
    }

    // toggle nodes when drag passes over
    $(".node").on("dragover", function(event) {
        if (firstDragNode === -1) return;
        var fromIndex = getNodeIndexFromObj(firstDragNode);
        var toIndex = getNodeIndexFromObj($(event.target));
        // behavior is different based on whether node dragged
        //      was already selected
        // if node dragged was unselected:
        //      selection from drag can be reversed by going back the other way
        //      selection under drag that is reversed is lost, no memory
        if (selectOn) {
            // decrease drag selection if drag returns towards first node
            if (toIndex > minDragNode && toIndex < maxDragNode) {
                if (toIndex < fromIndex) {
                    selectNodes(minDragNode, toIndex, !selectOn);
                    minDragNode = toIndex;
                }
                if (toIndex > fromIndex) {
                    selectNodes(maxDragNode, toIndex, !selectOn);
                    maxDragNode = toIndex;
                }
            } else {
                selectNodes(fromIndex, toIndex, selectOn);
            }
            // detect when drag passes over first node in the other direction
            //      to deselect all nodes in original direction
            if (toIndex < fromIndex && lastDrag >= fromIndex) {
                maxDragNode = fromIndex;
                if (extremeMax !== fromIndex) {
                    selectNodes(extremeMax, fromIndex + 1, !selectOn);
                }
            }
            if (toIndex > fromIndex && lastDrag <= fromIndex) {
                minDragNode = fromIndex;
                if (extremeMin !== fromIndex) {
                    selectNodes(extremeMin, fromIndex - 1, !selectOn);
                }
            }
            // update dragging globals
            maxDragNode = Math.max(toIndex, maxDragNode);
            minDragNode = Math.min(toIndex, minDragNode);
            extremeMax = Math.max(extremeMax, maxDragNode);
            extremeMin = Math.min(extremeMin, minDragNode);
            if (toIndex != firstDragNode) {
                lastDrag = toIndex;
            }
            event.preventDefault();
        // if node dragged was selected:
        //      deselect all nodes that drag passes over, and
        //      drag cannot be undone
        } else {
            selectNodes(fromIndex, toIndex, false);
        }
    });

    // on the end of the drag
    $(".node").on("dragend", function(event) {
        firstDragNode = -1;
    })



    // POPULATE RESERVATION TABLE

    var tr1 = '<tr class="res clickable mdl ';
    var tr2 = '</tr>';
    var td1 = '<td class="mdl">';
    var tdcurrent = '<td class="mdl current">';
    var td2 = '</td>';
    for (var i = 1; i < reservations.length; i++) {
        var current = new Date();
        var datetd;
        if (reservations[i].StartInt <= 0) {
            datetd = tdcurrent;
        } else {
            datetd = td1;
        }
        $("#res_table").append(
            tr1 + classes + 'id="res' + i + '">' +
            td1 + reservations[i].Name + td2 +
            td1 + reservations[i].Owner + td2 +
            datetd + dateToString(reservations[i].StartInt) + td2 +
            td1 + dateToString(reservations[i].StartInt + reservations[i].EndInt) + td2 +
            td1 + reservations[i].Nodes.length + td2 +
            tr2
        );
    }

    // reservation selection on click
    $(".res").click(function() {
        deselectGrid();
        toggle($(this));
    });

    // when hovering over a reservation:
    //      hover the nodes belonging to the reservation, and
    //      hover the type of nodes in the key
    $(".res").hover(function() {
        // remove shadows from all nodes temporarily to create contrast
        $(".node").addClass("light");
        $("#nodegridcard").addClass("light");
        var resNodes = reservations[getResIndexFromObj($(this))].Nodes;
        var up = false;
        var down = false;
        for (var i = 0; i < resNodes.length; i++) {
            // key hover
            if (reservations[0].Nodes.includes(resNodes[i])) {
                down = true;
            } else {
                up = true;
            }
            $(".key.reserved.headtext").addClass("hover");
            if (down) {
                $(".key.down.headtext").addClass("hover");
                $(".key.reserved.down").addClass("hover");
            }
            if (up) {
                $(".key.up.headtext").addClass("hover");
                $(".key.reserved.up").addClass("hover");
            }
            // node hover
            getObjFromNodeIndex(resNodes[i]).removeClass("light");
        }
    });

    // remove hover of nodes and key when res hover ends
    $(".res").mouseleave(function() {
        $("#nodegridcard").removeClass("light");
        $(".key").removeClass("hover");
        $(".node").removeClass("light");
    });
}

// show reservations when page first loads
sortReservations();
showReservations();



/*********************
 NEW RESERVATION MODAL
 *********************/

// open a new reservation modal
$("#newbutton").click(function() {
    newResHideSpec();
    updateNodeListField();
    $("#nrmodalki").click();
    // if nodes are selected, set fields and go to node list
    if (selectedNodes.length > 0) {
        $("#nrmodalnodelist").click();
        $("#dashn").val(selectedNodes.length);
    // otherwise go to number of nodes
    } else {
        $("#nrmodalnumnodes").click();
    }
    updateCommandLine();
    $("#newresmodal").modal("show");
});

// go to speculate page in new reservation modal,
//      when Speculate is clicked
function newResShowSpec() {
    $("#newresmaintitle").hide();
    $("#newresspectitle").show();
    $("#newresmain").hide();
    $("#newrescancel").hide();
    $("#newresspec").show();
    $("#newresback").show();
    $("#speculate").hide();
    $("#reserve").hide();
}

// return to main new reservation page in modal,
//      when Back is clicked when in Speculate
function newResHideSpec() {
    $("#newresmaintitle").show();
    $("#newresspectitle").hide();
    $("#newresmain").show();
    $("#newrescancel").show();
    $("#newresspec").hide();
    $("#newresback").hide();
    $("#speculate").show();
    $("#reserve").show();
}

// go back to main page of new reservation modal when Back is clicked
$("#newresback").click(function() {
    newResHideSpec();
})

// to be run when a speculate command returns
// display speculate data (on success) or show error (on failure)
function onSpeculateReturn() {
    if (response.Success) {
        for (var i = 0; i < 10; i++) {
            $("#spec_table").children().eq(i).children().eq(0).html(dateToString(response.Extra[i].StartInt));
            $("#spec_table").children().eq(i).children().eq(1).html(dateToString(response.Extra[i].EndInt));
        }
        newResShowSpec();
    } else {
        parseResult(false);
    }
    hideLoaders();
}

// when Reserve is clicked in Speculate page
// an "igor sub" command is issued with all of the same fields as the previous
//      page but with the -a tag set to the selected date
$(".specreserve").click(function() {
    showLoader($(this));
    var i = $(this).parent().parent().index();
    $("#dasha").val(response.Extra[i].Formatted);
    updateCommandLine();
    newResName = $("#dashr").val();
    commandObj = {"Command": "sub", "Name": newResName, "Owner": "owner", "isNodeList": $("#nrmodalnodelist").hasClass("active"), "Nodes": $("#dashw").val(), "NodeNum": $("#dashn").val(), "Start": response.Extra[i].StartInt};
    execute(onNewReturn);
})

// to be run when new reservation command returns from web.go
function onNewReturn() {
    $("#newresmodal").modal("toggle");
    hideLoaders();
    if ($("#newresspec").is(":visible") && response.Success) {
        newResHideSpec();
    }
    parseResult();
}

// run a new reservation command
var newResName = "";
$(".newresmodalgobtn").click(function(event) {
    updateCommandLine();
    // if speculate, then run Speculate instead and go to Speculat page
    if ($(event.target).hasClass("speculate")) {
        command += " -s";
        showLoader($(this));
        commandObj = {"Command": "spec"};
        execute(onSpeculateReturn);
        return;
    }
    showLoader($(this));
    // save name of new reservation to select it if command is successful
    newResName = $("#dashr").val();
    commandObj = {"Command": "sub", "Name": $("#dashr").val(), "Owner": "owner", "isNodeList": $("#nrmodalnodelist").hasClass("active"), "Nodes": $("#dashw").val(), "NodeNum": $("#dashn").val(), "Start": 0};
    execute(onNewReturn);
});

// switch between -k -i fields and -p field
// if ki side is clicked, switch to those fields
$("#nrmodalki").click(function(event){
    $("#nrmodalki").addClass("active");
    $(".switchki").show();
    $("#nrmodalcobbler").removeClass("active");
    $(".switchcobbler").hide();
    updateCommandLine();
})

// if p side is clicked, switch to cobbler field
$("#nrmodalcobbler").click(function(event){
    $("#nrmodalcobbler").addClass("active");
    $(".switchcobbler").show();
    $("#nrmodalki").removeClass("active");
    $(".switchki").hide();
    updateCommandLine();
})

// switch between number of nodes and node list
// if left side is clicked, switch to number of nodes (default)
$("#nrmodalnumnodes").click(function(event){
    $("#nrmodalnumnodes").addClass("active");
    $(".switchnumnodes").show();
    $("#nrmodalnodelist").removeClass("active");
    $(".switchnodelist").hide();
    updateCommandLine();
})

// if right side is clicked, switch to node list
$("#nrmodalnodelist").click(function(event){
    $("#nrmodalnodelist").addClass("active");
    $(".switchnodelist").show();
    $("#nrmodalnumnodes").removeClass("active");
    $(".switchnumnodes").hide();
    updateCommandLine();
})

// update the command variable holding the new reservation command
var command = "";
function updateCommandLine() {
    // only enable Speculate and Reserve if all required fields are nonempty
    if ($("#dashr").val() === "" ||
        ($("#nrmodalki").hasClass("active") ?
            $("#dashk").val() === "" ||
            $("#dashi").val() === "" :
            $("#dashp").val() === ""
        ) ||
        ($("#nrmodalnodelist").hasClass("active") ?
        $("#dashw").val() === "" :
        $("#dashn").val() === ""
    )) {
        $(".newresmodalgobtn").prop("disabled", true);
    } else {
        $(".newresmodalgobtn").prop("disabled", false);
    }

    // compile a command string based on state of switches and whether optional
    //      fields are nonempty
    command =
        "igor sub" +
        " -r " + $("#dashr").val() +
        ($("#nrmodalki").hasClass("active") ?
            " -k " + $("#dashk").val() +
            " -i " + $("#dashi").val() :
            " -p " + $("#dashp").val()
        ) +
        ($("#nrmodalnodelist").hasClass("active") ?
            " -w " + cluster + "[" + $("#dashw").val().replace(/ /g, "") + "]" :
            " -n " + $("#dashn").val()
        ) +
        ($("#dashc").val() === "" ? "" : " -c " + $("#dashc").val()) +
        ($("#dasht").val() === "" ? "" : " -t " + $("#dasht").val()) +
        ($("#dasha").val() === "" ? "" : " -a " + $("#dasha").val())
    ;
    $("#commandline").html(command);
}

// whenever a key is pressed in any modal, update the command string
$(".modal").keyup(function(event) {
    updateCommandLine();
    pUpdateCommandLine();
    eUpdateCommandLine();
});

// update the command line on click of number of nodes field, because
//      it can be changed with the arrows that some browsers place in
//      numerical fields
$("#dashn").click(function(event) {
    updateCommandLine();
});



/************************
 DELETE RESERVATION MODAL
 ************************/

// to be called when a delete command returns
function onDeleteReturn() {
    $("#deleteresmodal").modal("toggle");
    deselectGrid();
    deselectTable();
    hideLoaders();
    if (!response.Success) {
        parseResult();
    } else {
        getReservations();
        $("#deleteresmodal").modal("hide");
    }
}

// delete the selected reservation when Delete is clicked
$(".deleteresmodalgobtn").click(function() {
    command = "igor del " + reservations[selectedRes].Name;
    showLoader($(this));
    commandObj = {"Command": "del", "Index": selectedRes};
    execute(onDeleteReturn);
});



/*****************
 POWER-CYCLE MODAL
 *****************/

// on show modal either use reservation or node list field
$("#powermodal").on('show.bs.modal', function() {
    if (selectedRes > 0) {
        $("#pdashr").val(reservations[selectedRes].Name);
        $("#pmodalres").click();
    } else {
        $("#pdashr").val("");
        $("#pmodalnodelist").click();
    }
    updateNodeListField("pdashn");
    pUpdateCommandLine();
});

// to run when a power command returns
function onPowerReturn() {
    $("#powermodal").modal("toggle");
    hideLoaders();
    parseResult();
}

// run a power command when an action button is clicked
$(".powermodalgobtn").click(function(event) {
    pUpdateCommandLine();
    showLoader($(this));
    command += $(this).attr("id");
    commandObj = {"Command": "power", "Type": $(this).attr("id"), "isByRes": $("#pmodalres").hasClass("active"), "Nodes": $("#pdashn").val(), "ReservationName": $("#pdashr").val()}
    execute(onPowerReturn);
})

// switch between reservation and node list fields
// switch to reservation field
$("#pmodalres").click(function(event){
    $("#pmodalres").addClass("active");
    $("#pdashrfg").show();
    $("#pmodalnodelist").removeClass("active");
    $("#pdashnfg").hide();
    pUpdateCommandLine();
})

// switch to node list field
$("#pmodalnodelist").click(function(event){
    $("#pmodalnodelist").addClass("active");
    $("#pdashnfg").show();
    $("#pmodalres").removeClass("active");
    $("#pdashrfg").hide();
    pUpdateCommandLine();
})

// update the command string for power
var command = "";
function pUpdateCommandLine() {
    if ($("#pmodalres").hasClass("active") ?
        $("#pdashr").val() === "" :
        $("#pdashn").val() === "") {
        $(".powermodalgobtn").prop("disabled", true);
    } else {
        $(".powermodalgobtn").prop("disabled", false);
    }

    command =
        "igor power " +
        ($("#pmodalres").hasClass("active") ?
            "-r " + $("#pdashr").val() + " " :
            // remove spaces per style required in Go files
            "-n " + cluster + "[" + $("#pdashn").val().replace(/ /g, "") + "] "
        )
        $("#pcommandline").html(command);
}



/************
 EXTEND MODAL
 ************/

// on opening modal
$("#extendmodal").on('show.bs.modal', function() {
    if (selectedRes > 0) {
        // set reservation field to selected reservation
        $("#edashr").val(reservations[selectedRes].Name);
    } else {
        $("#edashr").val("");
    }
    eUpdateCommandLine();
});

// to be run when an extend command returns
function onExtendReturn() {
    hideLoaders();
    parseResult();
}

// run extend command when Extend is clicked
$(".extendmodalgobtn").click(function(event) {
    $("#extendmodal").modal("toggle");
    eUpdateCommandLine();
    showLoader($(this));
    commandObj = {"Command": "extend", "Name": $("#edashr").val(), "Length": 3600000};
    execute(onExtendReturn);
});

// update extend command string
var command = "";
function eUpdateCommandLine() {
    if ($("#edashr").val() === "") {
        $(".extendmodalgobtn").prop("disabled", true);
    } else {
        $(".extendmodalgobtn").prop("disabled", false);
    }

    command =
        "igor extend " +
        "-r " + $("#edashr").val() + " " +
        ($("#edasht").val() == "" ?
            "" : "-t " + $("#edasht").val()
        );
        $("#ecommandline").html(command);
}



/*************************
 COPY RESPONSE FROM SERVER
 *************************/

$(".copy").click(function(event) {
    var textArea = document.createElement("textarea");
    textArea.value = $(event.target).parent().parent().parent().find("code").html();
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    textArea.remove();
    $(".copytooltip").show();
    $(".copytooltip").animate({"opacity": 0.95}, 250, function() {
        setTimeout(function() {
            $(".copytooltip").animate({"opacity": 0}, 250, function() {
                $(".copytooltip").hide();
            })
        }, 1000);
    });
});



/****
 KEY
 ****/

// when any cell is clicked, select the respective nodes
$(".key").click(function(event) {
    deselectGrid();
    deselectTable();
    var obj;
    if ($(this).hasClass("available")) {
        if ($(this).hasClass("up")) {
            obj = $(".node.available.up");
        } else if ($(this).hasClass("down")) {
            obj = $(".node.available.down");
        } else {
            obj = $(".node.available");
        }
    } else if ($(this).hasClass("reserved")) {
        if ($(this).hasClass("up")) {
            obj = $(".node.reserved.up");
        } else if ($(this).hasClass("down")) {
            obj = $(".node.reserved.down");
        } else {
            obj = $(".node.reserved");
        }
    } else if ($(this).hasClass("up")) {
        obj = $(".node.up");
    } else if ($(this).hasClass("down")) {
        obj = $(".node.down");
    }
    select(obj);
});

// when hovering over any cell in key, hover the respective nodes
// hover reservations also, but this is only relevant for some table cells
$(".key").hover(function() {
    $("#nodegridcard").addClass("light");
    $(".node").addClass("light");
    var obj;
    if ($(this).hasClass("available")) {
        if ($(this).hasClass("up")) {
            obj = $(".node.available.up");
        } else if ($(this).hasClass("down")) {
            obj = $(".node.available.down");
        } else {
            obj = $(".node.available");
        }
    } else if ($(this).hasClass("reserved")) {
        if ($(this).hasClass("up")) {
            obj = $(".node.reserved.up");
            for (var i = 1; i < reservations.length; i++) {
                for (var j = 0; j < reservations[i].Nodes.length; j++) {
                    if (!reservations[0].Nodes.includes(reservations[i].Nodes[j])) {
                        getObjFromResIndex(i).addClass("hover");
                        break;
                    }
                }
            }
        } else if ($(this).hasClass("down")) {
            obj = $(".node.reserved.down");
            for (var i = 1; i < reservations.length; i++) {
                for (var j = 0; j < reservations[i].Nodes.length; j++) {
                    if (reservations[0].Nodes.includes(reservations[i].Nodes[j])) {
                        getObjFromResIndex(i).addClass("hover");
                        break;
                    }
                }
            }
        } else {
            obj = $(".node.reserved");
        }
    } else if ($(this).hasClass("up")) {
        obj = $(".node.up");
        for (var i = 1; i < reservations.length; i++) {
            for (var j = 0; j < reservations[i].Nodes.length; j++) {
                if (!reservations[0].Nodes.includes(reservations[i].Nodes[j])) {
                    getObjFromResIndex(i).addClass("hover");
                    break;
                }
            }
        }
    } else if ($(this).hasClass("down")) {
        obj = $(".node.down");
        for (var i = 1; i < reservations.length; i++) {
            for (var j = 0; j < reservations[i].Nodes.length; j++) {
                if (reservations[0].Nodes.includes(reservations[i].Nodes[j])) {
                    getObjFromResIndex(i).addClass("hover");
                    break;
                }
            }
        }
    }
    obj.removeClass("light");
});

// undo hover for nodes and reservations
$(".key").mouseleave(function() {
    $("#nodegridcard").removeClass("light");
    $(".node").removeClass("light");
    $(".res").removeClass("hover");
});

// show/hide key with Key button in navbar
$("#keybtn").click(function() {
    $(this).toggleClass("active");
    $("#key").toggle();
});
