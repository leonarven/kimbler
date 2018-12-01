module.exports = randomPlayer;

function randomPlayer(){
	return function( dice ){
		var player = this;
		return new Promise(resolve=>{
			setTimeout(()=>{
				var pawns = this.getMovablePawns( dice );
				if( pawns.length > 0 ){
					for( var pawn of pawns ) console.log( pawn.$num, pawn.getSightString());
					console.log( `Vuoroon valittu nappula: '${this.$num}${pawns[0].$num}'`, `${pawns[0].$moved}->`+((pawns[0].$moved||0)+dice+1));

					resolve( select( pawns ))
				}
				resolve( null );
			}, 50)
		})
	}
	function select( pawns ){
		return pawns[ parseInt( Math.random() * pawns.length )];
	}
}
