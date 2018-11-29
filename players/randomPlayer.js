module.exports = randomPlayer;

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
