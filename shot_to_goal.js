const trainer = require('./trainer');

async function script() {
    await trainer.init();
    await trainer.changeTo('play_on');
    while (true) {
        let see = await trainer.nextCycle();
        console.log(`(b ${see.ball.x} ${see.ball.y})`);
        if (see.game_time > 100) {
            break;
        }
    }
    await trainer.changeTo('before_kick_off');
    await trainer.say('finish');
    await trainer.close();
}

script();