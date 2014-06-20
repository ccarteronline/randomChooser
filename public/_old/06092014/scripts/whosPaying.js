$(document).ready(function(){

	var socket = io();
	var gameCreated = false;
	var inputAreas = $('#inputAreas');//input box in the beginning
	var nameEntry = $("#nameEntry");//name entry box
	var pleaseWait = $("#pleaseWait");//please wait dialog
	var nameInputBtn = $("#nameInputBtn");//name entry dialog
	var gamePanel = $('#gamePanel');

	//Actual used variables 
	var usersNumberSpot;
	var started = false;
	//


	var gameCreatedName = $('#gameCreate').val();

	var inputGameName = '';
	//



	socket.on('joinedUsers', function(userCount){
		//store the users spot to give them an identity
		if(!started){
			started = true;
			usersNumberSpot = userCount;
			$("#userIdentity").text(usersNumberSpot);
		}

		$("#numUsers").text(userCount);
		//reset dots
		$("#userDots").text("");
		for(i=1; i<= userCount; i++){
			$("#userDots").append("<li>new User</li>");
		}
	});


	initGame();//initialize the game

	//When user clicks create a game
	$('#createGame').click(function(){
		if($("#gameCreate").val()== ''){
			alert("you must enter a name");
		}else{
			//createGame();
			socket.emit('new game', $("#gameCreate").val());
		}
	});


	//When user clicks join game
	$('#joinGame').click(function(){
		if($("#gameJoin").val()==''){
			alert("you must enter a name");
		}else{
			joinGame();
			socket.emit('join game', $("#gameJoin").val());	
		}
	});

	//When a user has entered their name and they click Done!
	nameInputBtn.click(function(){
		//show please wait dialog IF they are joining,
		//but if the user is the admin, show the page with 
		//the start button and other user's joining

		// if(admin){
		// 	//display start screen
		// }else{
		// 	//display please wait
		// }

		pleaseWaitDialog();

	});


	socket.on('new user', function(newUser){
		//$("#people").append(newUser);
	});


	//Game has started, hide/show the correct things.
	function initGame(){
		nameEntry.hide();
		pleaseWait.hide();
		gamePanel.hide();
	}

	//This function is ran when a user clicks on the create a game button, 
	//they become the administrator or start button guy/girl
	function createGame(){
		inputAreas.hide();//hide the first input fields
		nameEntry.show();//show the name entry for the game to be created
	}

	//display the please wait dialog while hiding the other elements
	function pleaseWaitDialog(){
		nameEntry.hide();
		pleaseWait.show();
	}

	//When a user clicks on join a game, hide the wait dialog and 
	function joinGame(){
		//pleaseWaitDialog();
		inputAreas.hide();
		nameEntry.show();
	}
	


});//end document ready


	

