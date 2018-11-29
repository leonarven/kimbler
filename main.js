const Kimble = require("./kimble");
const Game   = require("./game");

const game = new Game( new Kimble([ "slowRandomPlayer", "randomPlayer", "randomPlayer", "randomPlayer" ]));

game.run().then(winner=>{
	console.log( "\n\n", winner.playFn, `Pelattu ${game.iterations} vuoroa , pelaaja ${winner.$num} voitti!` );
}).catch(err=>{
	console.error( err );
})
