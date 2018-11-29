const PLAYER_COUNT = 4;
const DICE_FACES   = 6;

function Game( kimble ){
	this.game = kimble;

	this.throwDice        = ()=>parseInt( DICE_FACES * Math.random());
	this.getCurrentPlayer = ()=>this.game.players[ this.playerTurn ];

	this.iterations = 0;
	this.playerTurn = 0;
};
Game.prototype.iterate = function(){
	this.iterations++;

	if( this.playerTurn == 0 ) console.log("\n\n");

	var player = this.getCurrentPlayer();
	var dice   = this.throwDice();

	console.log(`\n#${this.iterations}: Pelaaja ${player.$num} heitti: ${dice+1}`);

	var pawn = player.play( dice );

	console.log( `Pelaajan: ${player.toString()}`);
	player.movePawn( pawn, dice );
	console.log( `        : ${player.toString()}`);

	if( player.pawns.filter(v=>!v.place.isEnd).length == 0 ) return player;

	this.playerTurn++;
	this.playerTurn %= PLAYER_COUNT;
};

module.exports = Game;
