module.exports = randomPlayer;

function randomPlayer(){
	return function( dice ){
		var pawns = this.getMovablePawns( dice );
		if( pawns.length > 0 ){
			for( var pawn of pawns ) console.log( pawn.$num, pawn.getSightString());
			console.log( `Vuoroon valittu nappula: '${this.$num}${pawns[0].$num}'`, `${pawns[0].$moved}->`+((pawns[0].$moved||0)+dice+1));

			return select( pawns );
		}
	}
	function select( pawns ){
		return pawns[ 0 ];
	}
}
