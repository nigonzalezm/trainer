const trainer = require('./trainer');

async function script() {
    await trainer.init();
    await trainer.waitFor(10);
    await trainer.commandMoveTo(20, 20);
    await trainer.changeTo('play_on');
    await trainer.commandKickBallTo(-30, -30);
    await trainer.commandMoveTo(20, -20);
    await trainer.commandKickBallTo(30, 30);
    await trainer.waitFor(1000);
    await trainer.changeTo('before_kick_off');
    await trainer.say('g/mode finish');
    await trainer.close();
}

script();