$(document).ready(function(){

	var socket = io();
	var userAdminStartNumber = 1;
	var amountOfUsers;//Store the user count 
	var maxUsersBeforeStart = 4;//The default amount of users needed to join
	var userJoined = false;
	var admin = false;
	var createRoomVal = $("#createRoomName");
	var joinRoomVal = $("#joinRoomName");
	var joinedRoomName;//This is the server variable for the room passed through functions
	var userPlaceNum;//This is the user's spot in the userslist array
	var gameStarted = false;//This value changes when the first user is joined as admin
	var usersHeldId;




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

		if(!userJoined){

			userJoined = true;

			$("#createJoinRoom").hide();
			$("#mainContent").show();

			//name the room
			joinedRoomName = nameOfRoom;
			$("#roomNameID").text(nameOfRoom);
			//show the usercount
			socket.emit('addUserCount', nameOfRoom);

			//console.log(userId);
			usersHeldId = userId;
		}

	});

	//Get the amount of users that are in the game
	socket.on('get user count', function(rmData, rmName){
		
		if(joinedRoomName == rmName){
			this.liPrfx = 'listObj_';
			//Show how many users are in the room
			$("#numUsers").text(rmData);
			amountOfUsers = rmData;
			//reset the dots to nothing
			$("#userDots").text("");
			//for each amount of users, add them to the list
			for(i=1; i<= rmData; i++){
				$("#userDots").append("<li id='"+(this.liPrfx+i)+"'></li>");
			}
			$("#listObj_"+$("#userIdentity").text()).css({"background" : "black"});
			
			
		}else{
			//console.log('User used user count');
		}
		

	});

	//get users position
	socket.on('update user position', function(userList){
		$("#userIdentity").text(userList.indexOf(usersHeldId)+1);
		userPlaceNum = (userList.indexOf(usersHeldId)+1);
		checkIfAdmin(userPlaceNum);
	});


	//Error messages
	socket.on("errorMessage", function(message){
		alert(message);
		//later change this to a proper message displayed in red or something
	});
	
	socket.on("change game status", function(itemRoom){
		if(itemRoom == joinedRoomName){
			gameStarted = true;
		}
	});

	socket.on("update the time for users", function(newTime, inRoom){
		if(inRoom == joinedRoomName){
			$("#timeLeft").text(newTime);
		}
	});
	

	//When the user chooses to leave of closes out the window
	window.onbeforeunload = function(e) {
		//user has clicked the close button, remove them from the room
		socket.emit('leaveRoom', joinedRoomName);
	};


	$("#startGame").click(function(){
		if(amountOfUsers < maxUsersBeforeStart){
			alert("You need atleast "+maxUsersBeforeStart+" users to join");
		}else{
			socket.emit('startGame', joinedRoomName);
			$("#admin").hide();
			
			gameStarted = true;
		}
	});

	//check if admin, if so, show admin controls
	function checkIfAdmin(adminNum){
		if(adminNum == userAdminStartNumber && gameStarted == false){
			$("#admin").show();
			admin = true;
		}
	}


});//end document ready


	


	