const Kimble = require("./kimble");
const Game = require("./game");

const game = new Game( new Kimble([ randomPlayer, randomPlayer, randomPlayer, randomPlayer ]));
var winner;
for( var i = 0; i < 420; i++ ) if(winner = game.iterate()) break;
console.log( "\n\n", winner.playFn, `Pelattu ${game.iterations} vuoroa , pelaaja ${winner.$num} voitti!` );

/************************************************/

function randomPlayer(){
	return function( dice ){
		var pawns = this.getMovablePawns( dice );
		if( pawns.length == 0 ) throw new Error("Pelaajalla ei mahdollisuuksia liikuttaa yhtään mitään!! Mites nyt suu pannaan, miro?");

		for( var pawn of pawns )
			console.log( pawn.$num, pawn.getSightString());
		console.log( `Vuoroon valittu nappula: '${this.$num}${pawns[0].$num}'`, `${pawns[0].$moved}->`+((pawns[0].$moved||0)+dice+1));

		return pawns[0];
	}
}
