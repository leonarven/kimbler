const PLAYER_COUNT = 4;

const Kimble = require("./kimble");

/************************************************/
function Game(){ }
Game.prototype.init = function(){
	this.game        = new Kimble;
	this.players     = this.game.players;
	this.$playerTurn = 0;
}

Game.prototype.throwDice = function(){
	this.$lastDice = parseInt( 6 * Math.random( ));
	return this.$lastDice;
};
Game.prototype.start = function(){
	this.$playerTurn = 0;
};
Game.prototype.getCurrentPlayer = function(){
	return this.players[ this.$playerTurn ];
}
/** Pelaajan kierros aloitetaan */
Game.prototype.currentPlayerIterate = function(){
	var dice = this.throwDice();
	return dice;
};
/** Pelaaja jolla on nyt vuoro liikuttaa nappulaa numero num -> vuoro vaihtuu */
Game.prototype.currentPlayerMoves = function( pawn, dice ){
	if( dice == null ) dice = this.$lastDice;
	var player = this.getCurrentPlayer();
	pawn = player.getPawn( pawn );
	player.movePawn( pawn, dice );
	if( ++this.$playerTurn == PLAYER_COUNT ) this.$playerTurn %= PLAYER_COUNT;
};

/************************************************/

const game = new Game();
game.init();
game.start();

var iteration;

for( iteration = 0; iteration < 420; iteration++ ){
	if( game.$playerTurn == 0 ) console.log("\n\n");

	var player = game.getCurrentPlayer();
	var dice   = game.throwDice();
	console.log("#"+ iteration +": Pelaaja "+player.$num+" heitti:", (dice+1));

	var availPawns = player.pawns.filter(pawn=>{
		if( pawn.place.isEnd ) return false;

		var sight = pawn.getSight();
		var front = sight.front[dice];

		// Ei mitään paikalla, ok!
		if( !front.pawn ) return true;

		// Paikalla oleva nappu on vihun, ok!
		return front.pawn.$player != player;
	});
//	var availPawns = [ player.pawns[ player.$lastMovedPawn = ((player.$lastMovedPawn == null ? 0 : (player.$lastMovedPawn+1)) % PLAYER_COUNT) ]];
	for( var pawn of availPawns ) console.log( pawn.$num, pawn.getSightString());
	var pawn = availPawns[0];

	if( !pawn ) throw new Error("Pelaajalla ei mahdollisuuksia liikuttaa yhtään mitään!! Mites nyt suu pannaan, miro?");

	console.log( `Vuoroon valittu nappula: '${player.$num}${pawn.$num}'`, "$moved:"+pawn.$moved+"->"+((pawn.$moved||0)+(dice+1)));
	console.log("Vuorossa oleva pelaaja:", player.toString());
	game.currentPlayerMoves( pawn, dice );
	console.log("                      :", player.toString());
	console.log("");

	if( player.pawns.filter(v=>!v.place.isEnd).length == 0 ) throw "Peli päättyi, pelaaja "+player.$num+" voitti!";

}
