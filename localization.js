const trainer = require('./trainer');

function randomPosition() {
    return {
        x: -52 + Math.random() * 104,
        y: -34 + Math.random() * 68
    };
}

async function script() {
    await trainer.init();
    await trainer.setStrategy('repeat');
    await trainer.commandKickBallTo(0, 0);
    for (let iteration = 0; iteration < 2; iteration++) {
        await trainer.waitFor(10);
        await trainer.changeTo('play_on');
        for (let move = 0; move < 5; move++) {
            let position = randomPosition();
            await trainer.moveBallTo(position.x, position.y);
            await trainer.waitFor(50);
        }
        await trainer.changeTo('before_kick_off');
        await trainer.recover();
    }
    await trainer.say('g/mode finish');
    await trainer.close();
}

script();