const PLAYER_COUNT = 4;
const DICE_FACES   = 6;

function Game( kimble ){
	this.game = kimble;

	this.throwDice        = ()=>parseInt( DICE_FACES * Math.random());
	this.getCurrentPlayer = ()=>this.game.players[ this.playerTurn ];

	this.iterations = 0;
	this.playerTurn = 0;
	this.$history   = [];
};
Game.prototype.iterate = async function( callback, winner ){
	if( winner = await this.iteration( callback )) return winner;

	this.playerTurn = (this.playerTurn + 1) % PLAYER_COUNT;
};
Game.prototype.iteration = async function( callback, _cont ){
	this.iterations++;

	var player = this.getCurrentPlayer();
	var dice   = this.throwDice();
	console.log(`\n#${this.iterations}: Pelaaja ${player.$num} heitti: ${dice+1}`);

	var pawn = await player.play( dice );

	console.log( `Pelaajan: ${player.toString()}`);
	if( pawn ){
		player.movePawn( pawn, dice );
	} else {
		console.log( 'Yhtään nappulaa ei voida liikuttaa' );
	}
	console.log( `        : ${player.toString()}`);

	var shift = [ this.iterations, player.$num, dice+1, pawn ? pawn.$num : null ].concat(player.pawns.map(p=>{
		if( p.place.isStart ) return "S";
		if( p.place.isEnd   ) return "E";
		return p.place.$num;
	}));
	callback( shift );
	this.$history.push( shift );

	if( player.pawns.filter(v=>!v.place.isEnd).length == 0 ) return player;

	if( !_cont && dice == 5 ) return await this.iteration( callback, true );
};
Game.prototype.destroy = function(){
	this.running = false;
};
Game.prototype.run = async function( callback ){
	this.running = true;
	for( var winner, i = 0; this.running && i < 420; i++ ){
		if( winner = await this.iterate( callback )) return winner;
	}
};

module.exports = Game;
