//Get other player
function getOtherPlayer(player){
	if(player == 0){
		return 1;
	}
	else{
		return 0;
	}
}

//Type: 0 for qi, 1 for fish
function placePiece(type, player, row, col) {
	var position = getCoordinate(row, col);
	var positionFixer = 15;

	var picName
	if(player == 0) {
		picName = "white";
	} else {
		picName = "black";
	}

	var thePiece = $("<img/>", {
		"class" : "piece",
		src : "images/" + picName + type + ".png",
	}).css({
		left : position.left - positionFixer - 1,
		top : position.top - positionFixer + 2
	}).attr({
		row : row,
		col : col,
		type : 2 * player + type + 1
	}).click(pieceClicked).appendTo($("#placeHolders"));

	if(type == 0) {
		thePiece.addClass("qi");
	}
	else if(type == 1) {
		fishes[player].push(thePiece);
	}

	board[row][col] = 2 * player + type + 1;
}

function removePiece(thePiece) {
	if(!thePiece) {
		return;
	}

	var theRow = parseInt(thePiece.attr("row"));
	var theCol = parseInt(thePiece.attr("col"));

	thePiece.remove();

	board[theRow][theCol] = 0;
}

function movePiece(thePiece, row, col) {
	if((row == 3 && col == 3) || (!(thePiece))) {
		return;
	}

	var position = getCoordinate(row, col);
	var positionFixer = 15;

	var oldRow = parseInt(thePiece.attr("row"));
	var oldCol = parseInt(thePiece.attr("col"));

	board[oldRow][oldCol] = 0;

	thePiece.css({
		left : position.left - positionFixer - 1,
		top : position.top - positionFixer + 2
	}).attr({
		row : row,
		col : col,
	});

	board[row][col] = parseInt(thePiece.attr("type"));
}

//Get x-y position from row-col position
function getCoordinate(row, col) {
	var index = 0;
	for(var i = 0; i < row; i++) {
		if(i < 4) {
			index += (4 + i);
		} else {
			index += (6 - (i - 4));
		}
	}
	index += col;

	var position = $($("#placeHolders").children()[index]).position();
	return position;
}

//Get row and col of a piece
function getPosition(thePlaceHolder) {
	var thePosition = [];
	thePosition["row"] = parseInt(thePlaceHolder.attr("row"));
	thePosition["col"] = parseInt(thePlaceHolder.attr("col"));
	return thePosition;
}



function drawCanvas() {
	var theCanvas = $("#boardCanvas")[0];
	$(theCanvas).attr('height', 500).attr('width', 500);
	var context = theCanvas.getContext('2d');
	context.drawImage(preloader.getImage('images/board.jpg'), 0, 0);
}


// singleton to preload images
var preloader = new function () {
this.imageArray = new Array();  // holds images, keyed by src
this.countImagesToLoad = 0;     // so we know when all images have been loaded

// loads images from an array of src values
this.preload = function (srcArray, allLoadedCallback) {
this.countImagesToLoad += srcArray.length;
for (var i = 0; i < srcArray.length; i++) {// create new image and set onload callback
var image = new Image();
image.onload = this.getImageLoadedCallback(this, allLoadedCallback);

// set image's src and add to our image array
var src = srcArray[i];
image.src = src;

this.imageArray[src] = image;
}
}
// returns a function object, which has stuff within to run when an image finishes loading
this.getImageLoadedCallback = function (preloaderObj, allLoadedCallback) {
return function () {
preloaderObj.countImagesToLoad--;
if (preloaderObj.countImagesToLoad == 0) {
// all images are now loaded, call the final callback function
allLoadedCallback();
}
};
}

// returns a preloaded image
this.getImage = function (src) {
return this.imageArray[src];
}
}