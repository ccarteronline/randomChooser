$(document).ready(function(){

	navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;

	var socket = io();
	var userAdminStartNumber = 1;
	var usersNumberSpot;
	var amountOfUsers;//Store the user count 
	var maxUsersBeforeStart = 4;//The default amount of users needed to join
	var started = false;
	var shortVibeTime = 500;
	var longVibeTime = 1000;
	var admin = false;
	var coinSound = new Audio("sounds/coinDrop.mp3");


	var createRoomVal = $("#createRoomName");
	var joinRoomVal = $("#joinRoomName");
	 
	var joinedRoomName;//This is the server variable for the room passed through functions
	var userPlaceNum;
	
	
	
	var userSpots = [];
	var usersHeldId;


	socket.on("testRoomEmit", function(sessionVal){
		console.log(sessionVal);
	});


	//When user clicks to create a room, take the value and create it on server side
	$("#createNewRoom").click(function(){
		if(createRoomVal.val() == ""){
			alert("This cannot be left blank");
		}else{
			socket.emit("createARoom", createRoomVal.val());
		}
		
	});
	

	//When a user clicks join a room, take the value and search for it in the array
	$("#joinRoomBtn").click(function(){
		if(joinRoomVal.val() == ""){
			alert("This cannot be left blank");
		}else{
			socket.emit("joinRoom", joinRoomVal.val());
		}
	});

	//User has joined a room
	socket.on('joinedRoom', function(nameOfRoom, userId){

		if(!started){

			started = true;

			$("#createJoinRoom").hide();
			$("#mainContent").show();

			//name the room
			joinedRoomName = nameOfRoom;
			$("#roomNameID").text(nameOfRoom);
			//show the usercount
			socket.emit('addUserCount', nameOfRoom);

			//console.log(userId);
			usersHeldId = userId;
			$("#userIdentity").text(userId);
			console.log(usersHeldId);
		}

	});

	//Get the amount of users that are in the game
	socket.on('get user count', function(rmData, rmName){
		
		if(joinedRoomName == rmName){
			this.liPrfx = 'listObj_';
			//Show how many users are in the room
			$("#numUsers").text(rmData);
			//reset the dots to nothing
			$("#userDots").text("");
			//for each amount of users, add them to the list
			for(i=1; i<= rmData; i++){
				$("#userDots").append("<li id='"+(this.liPrfx+i)+"'></li>");
			}
			console.log($("#userIdentity").text());
			$("#listObj_"+$("#userIdentity").text()).css({"background" : "black"});
		}else{
			//console.log('User used user count');
		}
		

	});

	//get users position
	socket.on('update user position', function(userList){
		$("#userIdentity").text(userList.indexOf(usersHeldId)+1);
	});


	//Error messages
	socket.on("errorMessage", function(message){
		alert(message);
		//later change this to a proper message displayed in red or something
	});

	

	//When the user chooses to leave of closes out the window
	window.onbeforeunload = function(e) {
		//user has clicked the close button, remove them from the room
		socket.emit('leaveRoom', joinedRoomName);
	};




	//User has joined the game
	socket.on('joinedUsers', function(userCount){
		
	});
	//

	$("#startGame").click(function(){
		if(amountOfUsers < maxUsersBeforeStart){
			alert("You need more people to join");
		}else{
			socket.emit('startGame', true);
			$("#admin").hide();
		}
	});

	//Update everyone with the time.
	socket.on('showTime', function(gameTime){
		if(gameTime == 0){
			//window.close();
		}
		$("#timeLeft").text(gameTime);
	});

	//Beep the user for a faux pas that they have to pay
	socket.on('beepUser', function(userNum){
		if(userNum == usersNumberSpot){
			/*navigator.vibrate(shortVibeTime);
			navigator.webkitVibrate(shortVibeTime);
			navigator.mozVibrate(shortVibeTime);
			navigator.msVibrate(shortVibeTime);*/
			navigator.vibrate(shortVibeTime);
			soundHandle = document.getElementById('soundHandle');
			soundHandle.src = 'sounds/coinDrop.mp3';
			soundHandle.play();
			$("body").css({"background" : "yellow"});
			coinSound.play();
			alert('Watch Out!');
			$("body").css({"background" : "white"});
		}
	});

	socket.on('finalBeep', function(person){
		if(person == usersNumberSpot){
			/*navigator.vibrate(longVibeTime);
			navigator.webkitVibrate(longVibeTime);
			navigator.mozVibrate(longVibeTime);
			navigator.msVibrate(longVibeTime);*/
			navigator.vibrate(longVibeTime);
			$("body").css({"background" : "yellow"});

			soundHandle = document.getElementById('soundHandle');
			soundHandle.src = 'sounds/coinDrop.mp3';
			soundHandle.play();

			coinSound.play();

			alert('YO, ITS You!');
			alert("GAME OVER! Close the page and restart!");
		}else{
			alert("GAME OVER! Close the page and restart!");
		}
	});


	//check if admin, if so, show admin controls
	function checkIfAdmin(adminNum){
		if(adminNum == userAdminStartNumber){
			$("#admin").show();
			admin = true;
			console.log("asdf", $("#numUsers"));
		}
	}


	function handleUserSpots(usrSpotArray, usrCnt){
		// if(usrCnt>1){
		// 	//push more imagined users to the array
		// 	usrSpotArray.push("notYou");
		// }else{

		// }
		// usrSpotArray.push("me");
		// console.log("The amount of users are:", usrCnt, "The array: ", usrSpotArray);
		// console.log(usrSpotArray);
		
	}

});//end document ready


	


	