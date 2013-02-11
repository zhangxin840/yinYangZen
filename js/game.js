//Author: Zhang Xin
//Mail: 116943915@qq.com
//

//0 for player, 1 for computer
var currentPlayer = 0;
//0 for qi, 1 for fish
var currentType = 1;
var currentMode = "move";

//The selected piece to move
var currentPiece = null;

var legalPositions = [];
var qiPositions = [];

$(function() {
	preloader.preload(['images/board.jpg'], drawCanvas);

	setupGame();

	//setTimeout("testTimerClicked()", 100);

	$("#testBlock1").html("White player move");

	$("#testButton1").click(function() {
		if(currentPlayer == 0) {
			currentPlayer = 1;
		} else {
			currentPlayer = 0;
		}
		$("#testBlock1").html("Player: " + currentPlayer);
	});
	$("#testButton2").click(function() {
		currentType = 0;
		$("#testBlock1").html("Type: " + currentType);
	});
	$("#testButton3").click(function() {
		currentType = 1;
		$("#testBlock1").html("Type: " + currentType);
	});
	$("#testButton4").click(function() {
		currentMode = "place";
		$("#testBlock1").html("Mode: " + currentMode);
	});
	$("#testButton5").click(function() {
		currentMode = "move";
		$("#testBlock1").html("Mode: " + currentMode);
	});
});


function setupGame() {
	var horizontalDistance = 73.5;
	var verticalDistance = horizontalDistance * 0.866025;
	//Half of square root of 3
	var indentation = horizontalDistance * 0.5;

	var rows = [];
	var cols = [];

	for(var i = 0; i < 7; i++) {
		cols = [];
		if(i < 4) {
			for(var j = 0; j < i + 4; j++) {
				$("<img/>", {
					"class" : "positionHolder",
					src : "images/positionHolder" + ".png",
				}).css({
					left : (3 - i) * indentation + j * horizontalDistance + "px",
					top : i * verticalDistance + "px"
				}).attr({
					row : i,
					col : j
				}).appendTo($("#placeHolders"));

				cols.push(0);
			}
		} else {
			for(var j = 0; j < 6 - (i - 4); j++) {
				$("<img/>", {
					"class" : "positionHolder",
					src : "images/positionHolder" + ".png",
				}).css({
					left : (i - 3) * indentation + j * horizontalDistance + "px",
					top : i * verticalDistance + "px"
				}).attr({
					row : i,
					col : j
				}).appendTo($("#placeHolders"));

				cols.push(0);
			}
		}

		rows.push(cols);
	};
	board = rows;
	board[3][3] = 5;

	setupPieces();

	$(".positionHolder").mouseenter(function() {
	});

	$(".positionHolder").click(placeHolderClicked);
};

//Initial pieces setup for alternative rule
function setupPieces() {
	//Black fish""
	for(var i = 0; i < 2; i++) {
		for(var j = 0; j < 2 + i; j++) {
			placePiece(1, 1, i, 1 + j);
		}
	}
	//White fish
	for(var i = 5; i < 7; i++) {
		for(var j = 0; j < 8 - i; j++) {
			placePiece(1, 0, i, 1 + j);
		}
	}
}

function placeHolderClicked() {
	if(currentMode == "place") {
		var thePosition = getPosition($(this));
		if(!thePosition) {
			return;
		}
		placePiece(currentType, currentPlayer, thePosition.row, thePosition.col);
	} else if(currentMode == "move") {
		if(!(currentPiece && $(this).hasClass("legalPosition"))) {
			return;
		}
		var thePosition = getPosition($(this));
		makeMove(thePosition, currentPiece);
	}
}

function pieceClicked() {
	//Only current player's fishes are clickable
	var theType = parseInt($(this).attr("type"));
	if(currentPlayer != Math.floor((theType - 1) / 2)) {
		return;
	}
	currentPiece = $(this);
	getFishLegalPositions($(this));
}

//Get possible positions to move, and show the positions to player
function getFishLegalPositions(theFish) {
	theFishType = parseInt(theFish.attr("type"));

	if(!(theFishType == currentPlayer * 2 + 2)) {
		return;
	}

	//Clear global positions
	removeLegalPositions();

	var thePosition = getPosition(theFish);

	var movePositions = getMovePositions(thePosition, currentPlayer);

	//Global
	legalPositions = movePositions["legalPositions"];
	qiPositions = movePositions["qiPositions"];

	//Highlight possible move, prepare move
	showLegalPositions();

	if(legalPositions.length == 0) {
		$("#testBlock1").html("No position to move");
	} else {
		$("#testBlock1").html(legalPositions.length);
	}
}

//Highlight position holders of possible moves
function showLegalPositions() {
	$(".legalPosition").removeClass("legalPosition");

	var legalPositionHolders = [];
	var thePosition = [];
	var selector = "";
	for(var i = 0; i < legalPositions.length; i++) {
		thePosition = legalPositions[i];
		selector = ".positionHolder";
		selector += "[row = " + "'" + thePosition["row"] + "'" + "]";
		selector += "[col = " + "'" + thePosition["col"] + "'" + "]";

		legalPositionHolders.push($(selector));
	}
	for(var i = 0; i < legalPositionHolders.length; i++) {
		legalPositionHolders[i].addClass("legalPosition");
		if(currentPlayer == 1) {
			legalPositionHolders[i].addClass("black");
		}
	}
}

//Clear global positions
function removeLegalPositions() {
	legalPositions = [];
	qiPositions = [];
	$(".positionHolder.black").removeClass("black");
	$(".positionHolder.legalPosition").removeClass("legalPosition");
}

//Should fill global legalPositions and qiPositions before make move
function makeMove(thePosition, thePiece) {
	if((!thePosition)||(!thePiece)){
		return;
	}
	//Move fish
	movePiece(thePiece, thePosition.row, thePosition.col);

	//Put qi
	//Get direction
	var direction;
	$.each(legalPositions, function(key, value) {
		if(value["row"] == thePosition["row"] && value["col"] == thePosition["col"]) {
			direction = value["dir"];
		};
	})
	//Put qi from a direction of qiPositions
	var positionsToPutQi = qiPositions[direction];
	var theRow;
	var theCol;
	for(var i = 0; i < positionsToPutQi.length; i++) {
		theRow = positionsToPutQi[i]["row"];
		theCol = positionsToPutQi[i]["col"]

		//Remove other player's qi
		if(board[theRow][theCol] == 1 || board[theRow][theCol] == 3) {
			selector = ".piece";
			selector += "[row = " + "'" + theRow + "'" + "]";
			selector += "[col = " + "'" + theCol + "'" + "]";
			removePiece($(selector));
		}

		placePiece(0, currentPlayer, theRow, theCol);
	}

	//Reset move
	removeLegalPositions()
	currentPiece = null;

	//Check win
	if(checkWin(board)) {
		//Game over
		gameOver();
	} else {
		//Change player
		changePlayer();
	}
}

function checkWin(board) {
	var whiteQiSum = 0;
	var blackQiSum = 0;

	for(var i = 0; i < board.length; i++) {
		for(var j = 0; j < board[i].length; j++) {
			if(board[i][j] == 1) {
				whiteQiSum++;
			} else if(board[i][j] == 3) {
				blackQiSum++;
			}
		}
	}

	if(currentPlayer == 0) {
		if(whiteQiSum >= 14) {
			return true;
		}
	} else {
		if(blackQiSum >= 14) {
			return true;
		}
	}

	return false;
}

function changePlayer() {
	if(currentPlayer == 0) {
		$("#testBlock1").html("Black player move");
		currentPlayer = 1;
		$("#testBlock1").html("AI is thinking");
		//Delay the long runed AI function for UI updating;		
		setTimeout(makeAIMove, 200);
	} else {
		$("#testBlock1").html("White player move");
		currentPlayer = 0;
	}
}

function makeAIMove(){
	var theAIMove;
	
	//
	//Long time block here
	//
	theAIMove = getAIMove();

	var theFish = theAIMove["fish"];
	var thePosition = theAIMove["position"];

	var movePositions = getMovePositions(getPosition(theFish), currentPlayer);
	//Fill Global
	legalPositions = movePositions["legalPositions"];
	qiPositions = movePositions["qiPositions"];
	
	$("#testBlock1").html("AI move");
	makeMove(thePosition, theFish);
}

function gameOver() {
	$(".piece").unbind('click');
	$(".placeHolder").unbind('click');
	if(currentPlayer == 0) {
		$("#testBlock1").html("White player win");
	} else {
		$("#testBlock1").html("Black player win");
	}
}