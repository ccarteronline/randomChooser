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
	var joinedRoomName;
	

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
	socket.on('joinedRoom', function(nameOfRoom){
		if(!started){

			started = true;

			$("#createJoinRoom").hide();
			$("#mainContent").show();

			//name the room
			joinedRoomName = nameOfRoom;
			$("#roomNameID").text(nameOfRoom);
			//show the usercount
			socket.emit('addUserCount', nameOfRoom);
		}

	});

	//Get the amount of users that are in the game
	socket.on('get user count', function(usrCnt){
		//Show how many users are in the room
		$("#numUsers").text(usrCnt);
		//reset the dots to nothing
		$("#userDots").text("");
		//for each amount of users, add them to the list
		for(i=1; i<= usrCnt; i++){
			$("#userDots").append("<li></li>");
		}

	});

	//When the user chooses to leave of closes out the window
	window.onbeforeunload = function(e) {
		//user has clicked the close button, remove them from the room
		socket.emit('leaveRoom', joinedRoomName);
	};




	//User has joined the game
	socket.on('joinedUsers', function(userCount){
		/*amountOfUsers = userCount;


		//store the users spot to give them an identity
		//and only do this one time to avoid repetition
		if(!started){
			started = true;
			usersNumberSpot = userCount;
			$("#userIdentity").text(usersNumberSpot);
			checkIfAdmin(usersNumberSpot);//check if they are admin, if so, enable them to start the game
		}

		//Update the amount of users that are in the game
		$("#numUsers").text(userCount);

		//reset dots then loop through the 
		//usercount and add or remove users
		$("#userDots").text("");
		
		
		
		for(i=1; i<= userCount; i++){
			$("#userDots").append("<li></li>");
		}
		
		//If users disconnect, the number decrements, 
		//but if they are 1, do not decrement, only decrement
		//if the number is less than 1
		if(admin){
			//dont decrement the number
		}else if(userCount < usersNumberSpot){
			usersNumberSpot--;
			$("#userIdentity").text(usersNumberSpot);
		}
		//
		*/
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

});//end document ready


	


	