const Kimble = require("./kimble");
const Game   = require("./game");

const game = new Game( new Kimble([ "randomPlayer", "randomPlayer", "randomPlayer", "randomPlayer" ]));

game.run().then(winner=>{
	console.log( "\n\n", winner.playFn, `Pelattu ${game.iterations} vuoroa , pelaaja ${winner.$num} voitti!` );
	console.log(game.$history.filter(v=>v[1]==winner.$num))
}).catch(err=>{
	console.error( err );
})
