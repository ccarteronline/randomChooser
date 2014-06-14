var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = 1234;
//
var userCount = 0;
var gameTimer;
var gameTimeEndAt = 30; //seconds
var randomPickedForBeeps = new Array();


var createdRooms = new Array();


//create server and listen for it
http.listen(port, function(){
	console.log('listening on: ' + port);
});



//make the main directory in the public folder
app.use(express.static(__dirname + "/public"));

io.on('connection', function(socket){
	console.log(socket.id);
	//user connected increment the amount of users joined
	userCount++;
	console.log('a user has connected. The amount of users: ', userCount);

	//When a user joins, create a random time for the fake chooser to beep
	randomizePickers(userCount, randomPickedForBeeps);

	//send the user count to the client side
	io.emit('joinedUsers', userCount);

	//When a user disconnects
	socket.on('disconnect', function(){
		userCount--;
		console.log('A User DISCONNECTED. The amount of users: ', userCount);	
		//send the user count to the client side
		io.emit('joinedUsers', userCount);
		randomPickedForBeeps.pop();
		console.log(randomPickedForBeeps);


	});

	//When an admin starts the game
	socket.on('startGame', function(){
		startTheTimer();
	});



	//Create a room
	socket.on("createARoom", function(roomName){
		//If the room exists, emit an error otherwise, join it	
		if(searchTheRoom(createdRooms, roomName)){

			console.log("This room already exists, please create a new one");

		}else{

			socket.join(roomName);
				createdRooms.push({

				"room" : roomName,
				"userCount" : 0,
				"gameTimeEndAt" : 30

			});

			io.sockets.in(roomName).emit('joinedRoom', roomName);
		}
		
	});

	//Join a room
	socket.on("joinRoom", function(roomToJoin){

		if(searchTheRoom(createdRooms, roomToJoin)){
			socket.join(roomToJoin);
			io.sockets.in(roomToJoin).emit('joinedRoom', roomToJoin);
		}else{
			console.log("room doesnt exist, create");
		}

	});

	//When a user leaves a room or closes out their browser
	socket.on("leaveRoom", function(roomToLeave){
		socket.leave(roomToLeave);
		io.sockets.in(roomToLeave).emit('get user count', changeUserCount(createdRooms, roomToLeave, "subtract"));
	});


	//increment the usercount
	socket.on("addUserCount", function(rmRoom){
		io.sockets.in(rmRoom).emit('get user count', changeUserCount(createdRooms, rmRoom, "add"));
	});


});

function changeUserCount(roomArray, specificRoom, way){
	//if way is to subtract, the decrement, otherwise increment
	if(way == "add"){
		for(rme=1; rme<=roomArray.length; rme++){
			//search for the room in the array
			//then add the number of people to it
			if(roomArray[rme-1].room == specificRoom){
				roomArray[rme-1].userCount++;
				console.log(roomArray);
				break;
			}
		}
		return roomArray[rme-1].userCount;
	}else if(way == "subtract"){

		for(rmd=1; rmd<=roomArray.length; rmd++){
			//search for the room in the array
			//then subtract the number of people to it
			if(roomArray[rmd-1].room == specificRoom){
				roomArray[rmd-1].userCount--;
				console.log(roomArray);
				break;
			}
		}
		return roomArray[rmd-1].userCount;
	}
	
}



function searchTheRoom(roomArray, specificRoom){

	for(el=1; el<=roomArray.length; el++){
		if(roomArray[el-1].room == specificRoom){
			this.roomExistence = true;
			break;
		}else{
			this.roomExistence = false;
			continue;
		}
	}
	//when the loop is done, the room existence is set, log it
	return this.roomExistence;
}



function startTheTimer(){
	//start the timer
	gameTimer = setInterval(function(){
		//console.log("time: ", gameTimeEndAt);

		//if the time is at the end, then stop 
		//timer otherwise, subtract time
		if(gameTimeEndAt == 0){
			clearInterval(gameTimer);
			//randomPickedForBeeps = [];
			finalBeepMessage(userCount);
			
		}else{

			gameTimeEndAt--;

			//choose a person to beep at if that time hits 
			chooseFakePersonToBeep(gameTimeEndAt, randomPickedForBeeps, userCount);
		}

		//show time
		io.emit('showTime', gameTimeEndAt);
		
	},1000);
}

//Get the amount of users that are present, then create a random number 
//for each of them as far as who will be the person to pay
function randomizePickers(numberOfUsers, randomPeopleArray){
	
	this.numValue = Math.floor((Math.random() * gameTimeEndAt) + 1);
	randomPeopleArray.push(this.numValue);
	console.log(randomPeopleArray);
}

//search through array of random times, if they match
//choose a random person to beep
function chooseFakePersonToBeep(carriedTimer, timeKeptArray, userTotal){
	
	if(timeKeptArray.indexOf(carriedTimer) != -1){
		this.randomBeepPerson = Math.floor((Math.random() * userTotal) + 1);
		console.log(this.randomBeepPerson);
		io.emit('beepUser', this.randomBeepPerson);//show time
	}
}

//This is actually all that we need to choose the actual person in the end
function finalBeepMessage(amountOfUsers){
	this.randomUser = Math.floor((Math.random() * amountOfUsers) + 1);
	io.emit('finalBeep', this.randomUser);
	console.log(this.randomUser);
}
