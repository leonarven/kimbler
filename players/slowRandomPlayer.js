module.exports = randomPlayer;

function randomPlayer(){
	return function( dice ){
		var player = this;
		return new Promise(resolve=>{
			setTimeout(function(){
				var pawns = player.getMovablePawns( dice );
				if( pawns.length == 0 ) throw new Error("Pelaajalla ei mahdollisuuksia liikuttaa yhtään mitään!! Mites nyt suu pannaan, miro?");

				for( var pawn of pawns )
					console.log( pawn.$num, pawn.getSightString());
				console.log( `Vuoroon valittu nappula: '${player.$num}${pawns[0].$num}'`, `${pawns[0].$moved}->`+((pawns[0].$moved||0)+dice+1));

				resolve(pawns[0]);
			}, 1000)
		})
	}
}
