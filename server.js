const websocket = require('websocket');
const express   = require('express');
const http      = require('http');
const app       = express();

const connections = [];

const Kimble = require("./kimble");
const Game   = require("./game");

/**************************/

app.use( express.static( "public" ));
app.get('/start', function (req, res) {
	res.send( 'hello world' );
});
app.listen( 8080, ()=>console.log((new Date()) + ` HTTPServer listening port 8080!`));

/**************************/

const server = http.createServer(( req, res )=>{
	console.log((new Date()) + ' Received request for ' + req.url);
	res.writeHead(404);
	res.end();
});
const wsServer = new websocket.server({
	httpServer: server,
	autoAcceptConnections: false
});
server.listen(8081, ()=>console.log((new Date()) + ' SocketServer is listening on port 8081!'));

/**************************/

function sendJSON( data ){
	for( var c of connections ) c.sendUTF( JSON.stringify( data ));
}

wsServer.on('request', function( request ){
	console.log((new Date()) + ' Connection accepted.');
	var connection = request.accept( 'echo-protocol', request.origin );
	connections.push( connection );

	function placeArrToStrings( arr ){
		return arr.map(v=>v.toPawnString())
	}

	connection.on('message', function(message) {
		if( message.type !== 'utf8' ) throw new Error("Invalid message received (not urf8 but '"+message.type+"')");
		var data = JSON.parse( message.utf8Data );
		console.log( "Received message:", message.utf8Data );

		switch( data.act ){
			default: throw new Error("Invalid message.act '"+data.act+"' received");
			case "CLEAR": case "STOP": STOP(); break;
			case "START":
				var game = START( data );
				sendJSON({ act: "game.players", players: game.game.players.map(v=>({ uuid: v.uuid }))});
				game.run(shift=>{
					sendJSON({ act: "game.state", game: {
						players: game.game.players.map(v=>({
							starts : placeArrToStrings( v.starts ),
							ends   : placeArrToStrings( v.ends )
						})),
						board: placeArrToStrings( game.game.board.places )
					}});
				}).then(winner=>{
					if( winner ) sendJSON({ act: "game.gameover", winner: winner.toString( )});
				}).catch(error=>{
					sendJSON({ act: "game.error", error: error });
					console.error( error );
				}).then(()=>{
					STOP();
				});
		}
	});
	connection.on('close', function( reasonCode, description ){
		console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
	});
});

/**************************/

var game;

function START( data ){
	if( game ){
		throw new Error( "There is already var game" );
	}
	if( !data.players ){
		throw new Error( "no message.players?!" );
	}
	if( !Array.isArray( data.players )){
		throw new Error( "no message.players?!" );
	}

	return game = new Game( new Kimble( data.players ))
}
function STOP(){
	if( game ){
		game.destroy();
	}
	game = null;
}
