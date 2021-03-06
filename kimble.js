const DICE_FACES = 6;
const PLAYER_COUNT = 4;
const PAWNS_PER_PLAYER_COUNT = 4;
const SECTOR_LENGTH = 7;

var generateUUID = function( chars, uuid, rnd, r ) {
	return function generateUUID() {
		for ( var i = 0; i < 36; i ++ ) {
			if ( i === 8 || i === 13 || i === 18 || i === 23 ) {
				uuid[ i ] = '-';
			} else if ( i === 14 ) {
				uuid[ i ] = '4';
			} else {
				if ( rnd <= 0x02 ) rnd = 0x2000000 + ( Math.random() * 0x1000000 ) | 0;
				r = rnd & 0xf;
				rnd = rnd >> 4;
				uuid[ i ] = chars[ ( i === 19 ) ? ( r & 0x3 ) | 0x8 : r ];
			}
		}
		return uuid.join( '' );
	};
}( '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split( '' ), new Array( 36 ), 0 );


/*
██████  ██       █████   ██████ ███████
██   ██ ██      ██   ██ ██      ██
██████  ██      ███████ ██      █████
██      ██      ██   ██ ██      ██
██      ███████ ██   ██  ██████ ███████
*/
function Place( board, prev ){
	this.uuid  = generateUUID();
	this.board = board;
	this.pawn  = null;
	this.$prev = null;
	this.$next = null;
	prev && prev.setNext( this )
}
Place.prototype.setNext = function( next ){
	this.$next = next;
	next.$prev = this;
}
Place.prototype.setPawn = function( pawn ){
	this.pawn = pawn;
}
Place.prototype.toPawnString = function(){
	return this.pawn && `${this.pawn.$player.$num}${this.pawn.$num}`;
}

/*
██████   █████  ██     ██ ███    ██
██   ██ ██   ██ ██     ██ ████   ██
██████  ███████ ██  █  ██ ██ ██  ██
██      ██   ██ ██ ███ ██ ██  ██ ██
██      ██   ██  ███ ███  ██   ████
*/
function Pawn( place ){
	if( !place ) throw "Pawn must have a place";

	this.uuid  = generateUUID();
	this.$board = place.board;

	this.place = place;
	place.pawn = this;
}
Pawn.prototype.getSight = function(){
	var back  = null;
	var front = null;

	if( !this.place ) throw "wtf?!";

	if( !this.place.isEnd ){
		front = [];

		if( !this.place.isStart ){
			back = [];

			cur = this.place.$prev;
			for( var i = 0; i < DICE_FACES; i++ ){
				back.push( cur );
				cur = cur.$prev;
			}
		}


		if( this.$moved > this.$board.length - DICE_FACES ){
			if( this.place.isStart||this.place.isEnd ) throw "Kovin lähellä takareunaa ollaan, mutta silti muka lähtöruudussa tai lopussa?!!";

			var move_a = this.$board.length - this.$moved;
			var move_b = DICE_FACES - move_a;

			cur = this.place.$next;
			for( var i = 0; i < move_a; i++ ){
				front.push( cur );
				cur = cur.$next;
			}

			for( var i = 0; i < move_b; i++ ){
				front.push( this.$player.ends[ i ] || { isEnd: true, pawn: this });
			}
		} else {
			if( this.place.isStart ){
				for( var i = 1; i < DICE_FACES; i++ ) front.push({ });
				front.push( this.$player.$startPlace );
			} else {
				cur = this.place.$next;
				for( var i = 0; i < DICE_FACES; i++ ){
					front.push( cur );
					cur = cur.$next;
				}
			}
		}
	}

	return { back, front }
}
Pawn.prototype.toString = function(){
	return this.$player.$num+""+this.$num;
}
Pawn.prototype.getSightString = function(){
	return "|"+this.getSight().front.map(v=>(
		v.pawn ? (v.pawn.$player.$num+""+v.pawn.$num) : "__"
	)).join("|")+"|";
}
/*
██████  ██       █████  ██    ██ ███████ ██████
██   ██ ██      ██   ██  ██  ██  ██      ██   ██
██████  ██      ███████   ████   █████   ██████
██      ██      ██   ██    ██    ██      ██   ██
██      ███████ ██   ██    ██    ███████ ██   ██
*/
function Player( $num, $game, playFn ){
	this.uuid = generateUUID();

	this.pawns  = new Array( PAWNS_PER_PLAYER_COUNT ).fill( null );
	this.starts = new Array( PAWNS_PER_PLAYER_COUNT ).fill( null );
	this.ends   = new Array( PAWNS_PER_PLAYER_COUNT ).fill( null );

	this.$num        = $num;
	this.$game       = $game;
	this.$board      = $game.board;
	this.$startPlace = this.$board.places[ this.$num * SECTOR_LENGTH ];

	for( var pawn, i = 0; i < PAWNS_PER_PLAYER_COUNT; i++ ){

		(this.starts[ i ] = new Place( this.$board, this.starts[ i-1 ]||null )).isStart = true;
		(this.ends[ i ]   = new Place( this.$board,   this.ends[ i-1 ]||null )).isEnd   = true;

		pawn = this.pawns[ i ] = new Pawn( this.starts[ i ]);
		pawn.$num    = i;
		pawn.$player = this;
		pawn.$game   = this.$game;
	}

	this.playFn = playFn;
	this.play   = this.playFn.call( this );
}
Player.prototype.getPlaces = function( join ){
	var prev = this.$startPlace;
	var arr  = [ prev ];
	for( var i = 1; i < this.$board.length; i++ ) arr.push( prev = prev.$next );
	return arr;
}
Player.prototype.getMovablePawns = function( dice ){
	return this.pawns.filter(pawn=>{
		if( pawn.place.isEnd ) return false;
		if( pawn.place.isStart && dice != (DICE_FACES-1) ) return false;

		var sight = pawn.getSight();
		var front = sight.front[dice];

		// Ei mitään paikalla, ok!
		if( !front.pawn ) return true;

		// Paikalla oleva nappu on vihun, ok!
		return front.pawn.$player != this;
	});
};
Player.prototype.movePawn = function( pawn, dice ){
	if( pawn.place.isEnd ) throw new Error( "Player.movePawn :: Ei voida liikuttaa nappulaa, on jo loppupisteessä" );

	/** @TODO  wtf tää tekee tässä? */
	var pos = this.$board.places.indexOf( pawn.place );
	pos = this.$num*SECTOR_LENGTH, pos == -1 ? "Ei sijaintia" : pos;

	this.$game.movePlayerPawn( pawn, dice );
}
Player.prototype.toString = function(){
	var self = this;
	var starts = this.starts;
	var center = this.getPlaces();
	var ends   =   this.ends;
	return this.$num +" |" + arrToStr(starts) + "|    |" + arrToStr(center) + "|    |" + arrToStr(ends) + "|";
	function arrToStr( arr ){
		return arr
		.map(v=>v && v.pawn ? v.pawn : null)
		.map(v=>(v ? (
			v.$player.$num+""+v.$num
		) : "__")).join("|");
	}
}
/*
██████   ██████   █████  ██████  ██████
██   ██ ██    ██ ██   ██ ██   ██ ██   ██
██████  ██    ██ ███████ ██████  ██   ██
██   ██ ██    ██ ██   ██ ██   ██ ██   ██
██████   ██████  ██   ██ ██   ██ ██████
*/
function Board(){
	this.uuid   = generateUUID();
	this.places = [];
	this.length = PLAYER_COUNT * SECTOR_LENGTH;

	var prev = null;
	for( var i = 0; i < this.length; i++ ){
		prev = new Place( this, prev );
		prev.$num = i;
		this.places.push( prev );
	}
	prev.setNext( this.places[ 0 ]);
}
Board.prototype.setPlacePawn = function( place, pawn ){
	if( place ){
		if( pawn ){
			if( place.pawn ) throw "paikalla on jo jotain";

			pawn.place.pawn = null;
			place.pawn = pawn;
			pawn.place = place;
		} else {
			throw "asd?"
		}
	} else {
		throw "???";
	}
};
/*
██   ██ ██ ███    ███ ██████  ██      ███████
██  ██  ██ ████  ████ ██   ██ ██      ██
█████   ██ ██ ████ ██ ██████  ██      █████
██  ██  ██ ██  ██  ██ ██   ██ ██      ██
██   ██ ██ ██      ██ ██████  ███████ ███████
*/
function Kimble( playerFn ){
	this.uuid    = generateUUID();
	this.board   = new Board();

	if( !Array.isArray( playerFn )) playerFn = [ playerFn ];
	var lastFn = playerFn[ 0 ];
	if( !lastFn ) throw new Error("No player fn given!");
	for( var i = 0; i < PLAYER_COUNT; i++ ){
		lastFn = playerFn[ i ] || lastFn;
		if( typeof lastFn == "string" ) lastFn = require("./players/"+ lastFn);
		playerFn[i] = lastFn;
	};

	this.players = playerFn.map(( fn, i )=>new Player( i, this, fn));
}
Kimble.prototype.movePlayerPawn = function( pawn, dice ){
	var sight = pawn.getSight();
	if( !sight.front ) throw new Error("Kimble.movePlayerPawn :: no places on front of pawn");

	// Tulevalla paikalla on joku
	if( sight.front[ dice ].pawn ){
		var phit = sight.front[ dice ].pawn;
		var plyr = sight.front[ dice ].pawn.$player;

		var strt = plyr.starts.filter(v=>(!v.pawn||v.pawn==phit))[0];
		if( !strt ) throw "Ei voida palauttaa osuttua nappulaa alkuun, ei tilaa?";

		console.log("Palautetaan pelaajan nappula alkuun");
		phit.$moved = null;
		this.board.setPlacePawn( strt, phit );
	}
	var moved = (pawn.$moved||0)+(dice+1);

	if( moved > this.board.length ){
		if( !sight.front[ dice ].isEnd ){
			console.error(sight.front[ dice ]);
			throw new Error("NAPPULA KIERTÄNYT KIERROKSEN EIKÄ PAIKKA OO EES LOPPU!!");
		}
	}
	if( sight.front[ dice ].isEnd ){
		console.log("pelinappulan matka ohi");
	}
	pawn.$moved = moved;
	this.board.setPlacePawn( sight.front[ dice ], pawn );
};

Kimble.Pawn   = Pawn;
Kimble.Player = Player;
Kimble.Board  = Board;



module.exports = Kimble;
