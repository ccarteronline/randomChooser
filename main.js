var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = 8888;
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
	
	socket.join(socket.id);
	//When an admin starts the game
	socket.on('startGame', function(inRoom){
		console.log(inRoom);
		startTheTimer(createdRooms, inRoom);
	});

	//Create a room
	socket.on("createARoom", function(roomName){
		//If the room exists, emit an error otherwise, join it	
		if(searchTheRoom(createdRooms, roomName)){
			io.sockets.in(socket.id).emit('errorMessage', "This room already exists, please create a new one");

		}else{
			socket.leave(socket.id);//leave old room
			socket.join(roomName);
				createdRooms.push({

				"room" : roomName,
				"gameTime" : 30,
				"usersList" : [],
				"gameStarted" : false,

			});

			io.sockets.in(roomName).emit('joinedRoom', roomName, socket.id);
			//io.sockets.in(roomName).emit('testRoomEmit', ('room: ' + roomName));
		}
		
	});

	//Join a room
	socket.on("joinRoom", function(roomToJoin){
		//look through the array of rooms and if it exists, join it, otherwise alert an error
		if(searchTheRoom(createdRooms, roomToJoin)){
			socket.leave(socket.id);//leave old room
			socket.join(roomToJoin);

			io.sockets.in(roomToJoin).emit('joinedRoom', roomToJoin, socket.id);

		}else{
			io.sockets.in(socket.id).emit('errorMessage', "room doesnt exist, create");
		}

	});

	//When a user leaves a room or closes out their browser
	socket.on("leaveRoom", function(roomToLeave){
		//leave the room, then send the amount of users connected to the client after subtracting
		socket.leave(roomToLeave);
		io.sockets.in(roomToLeave).emit('get user count', handleUsers(createdRooms, roomToLeave, socket.id, "subtract"), roomToLeave);
	});


	//increment the usercount
	socket.on("addUserCount", function(rmRoom){
		//tell the client that the user count has changed, increment it
		io.sockets.in(rmRoom).emit('get user count', handleUsers(createdRooms, rmRoom, socket.id, "add"), rmRoom);
	});


});

function handleUsers(roomArray, specificRoom, userId, way){
	//if way is to subtract, the decrement, otherwise increment
	if(way == "add"){
		for(rme=1; rme<=roomArray.length; rme++){
			if(roomArray[rme-1].room == specificRoom){
				roomArray[rme-1].usersList.push(userId);//add the user in the array, their socket id
				io.sockets.in(specificRoom).emit('update user position', roomArray[rme-1].usersList);
				console.log(roomArray);
				break;
			}
		}
		//to stop node from crashing because it seeks an undefined value
		if(roomArray[rme-1] != undefined){
			return roomArray[rme-1].usersList.length;
		}
		

	}else if(way == "subtract"){

		for(rmd=1; rmd<=roomArray.length; rmd++){
			if(roomArray[rmd-1].room == specificRoom){
				this.arIndex = roomArray[rmd-1].usersList.indexOf(userId);
				roomArray[rmd-1].usersList.splice(this.arIndex,1);//remove the user that left
				io.sockets.in(specificRoom).emit('update user position', roomArray[rmd-1].usersList);
				console.log(roomArray);
				break;
			}
		}
		//to stop node from crashing because it seeks an undefined value
		if(roomArray[rmd-1] != undefined){
			return roomArray[rmd-1].usersList.length;
		}
		
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

function startTheTimer(roomsObj, inRoom){
	//change the value with the room and
	//emit to the client that the game is started
	for(fhy = 1; fhy<=roomsObj.length; fhy++){
		if(roomsObj[fhy-1].room == inRoom){
			roomsObj[fhy-1].gameStarted = true;
			io.sockets.in(inRoom).emit('change game status', inRoom);
			
			createTimerForRooms(roomsObj, inRoom);
		}
	}
	
}



function createTimerForRooms(roomsObj, room){

	timerName = (room + "_timer").toString();

	timerName = setInterval(function(timerName){

		for(asd=1; asd<=roomsObj.length; asd++){
			if(roomsObj[asd-1].room == room){
				if(roomsObj[asd-1].gameTime!=0){
					roomsObj[asd-1].gameTime--;
					io.sockets.in(room).emit('update the time for users', roomsObj[asd-1].gameTime, room);
				}else{
					clearInterval(this);
				}
			}
		}

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
