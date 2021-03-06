var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = 7878;//You can change this to whatever port you want
var timerTime = 1000;//The timer decrements every second, this can be changed
var createdRooms = new Array();//The created rooms are stored as objects in this array

//make the main directory in the public folder
app.use(express.static(__dirname + "/public"));


//create server and listen for it
http.listen(port, function(){
	console.log('listening on: ' + port);
});

io.on('connection', function(socket){
	
	socket.join(socket.id);
	//When an admin starts the game
	socket.on('startGame', function(inRoom){
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
			io.sockets.in(socket.id).emit('errorMessage', "This room does not exist, Create it above");
		}

	});

	//increment the usercount
	socket.on("addUserCount", function(rmRoom){
		//tell the client that the user count has changed, increment it
		io.sockets.in(rmRoom).emit('get user count', handleUsers(createdRooms, rmRoom, socket.id, "add"), rmRoom);
	});


	socket.on('disconnect', function(){
		for(ype = 1; ype<= createdRooms.length; ype++){
			if(createdRooms[ype-1].usersList.indexOf(socket.id) != -1){
				socket.leave(createdRooms[ype-1].room);
				io.sockets.in(createdRooms[ype-1].room).emit('get user count', handleUsers(createdRooms, createdRooms[ype-1].room, socket.id, "subtract"), createdRooms[ype-1].room);
				sweepIfNone(createdRooms, (ype-1), createdRooms[ype-1].usersList.length);
			}
		}
	});

	socket.on('displayUI', function(inThisRoom){
		io.sockets.in(inThisRoom).emit('showGameUI', inThisRoom);
	});

});

function handleUsers(roomArray, specificRoom, userId, way){
	//if way is to subtract, the decrement, otherwise increment
	if(way == "add"){
		for(rme=1; rme<=roomArray.length; rme++){
			if(roomArray[rme-1].room == specificRoom){
				roomArray[rme-1].usersList.push(userId);//add the user in the array, their socket id
				io.sockets.in(specificRoom).emit('update user position', roomArray[rme-1].usersList);
				console.log(createdRooms);
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
				//console.log("There are: " + roomArray[rmd-1].usersList.length + "in this room");
				//console.log("What is the object? " + roomArray.indexOf(roomArray[rmd-1]));
				console.log(createdRooms);
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
	this.roomExistence = false;

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
	console.log(this.roomExistence);
	console.log('the length of the array is: ', roomArray.length);
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
					//Send a message to the user that they are almost
					sendMessageToUser(roomsObj[asd-1].usersList.length, room, "fake");
				}else{
					clearInterval(this);
					sendMessageToUser(roomsObj[asd-1].usersList.length, room, "lastMessage");
				}
			}
		}

	}, timerTime);
}
function sendMessageToUser(amtOfUsers, inRoom, way){
	this.userToNotify = Math.floor((Math.random() * amtOfUsers) + 1);

	if(way == "fake"){

		io.sockets.in(inRoom).emit('fake message', inRoom, this.userToNotify);

	}else if(way == "lastMessage"){

		io.sockets.in(inRoom).emit('last message', inRoom, this.userToNotify);
	}
	
}

function sweepIfNone(_theArray, _objSpot, _numItems){
	if(_numItems == 0){
		//delete the object from the array
		createdRooms.splice(_objSpot,1);
		console.log(createdRooms);
	}else{
		console.log("A USER HAS DISCONNECTED");
	}
}

