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
	

	//New Creation
	$("#createNewRoom").click(function(){
		if(createRoomVal.val() == ""){
			alert("You left something blank");
		}else{
			socket.emit("createdRoom", createRoomVal.val());
		}
		
	});


	socket.on('joinedRoom', function(roomData){
		$("body").append(roomData);
	});
	//End New creation




	//User has joined the game
	socket.on('joinedUsers', function(userCount){
		amountOfUsers = userCount;


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

			alert('YO, PAY UP!!!!');
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


	

