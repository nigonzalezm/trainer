const trainer = require('./trainer');

async function script() {
    await trainer.init();
    await trainer.waitFor(10);
    await trainer.commandMoveTo(20, 20);
    await trainer.changeTo('play_on');
    await trainer.waitFor(100);
    await trainer.commandKickBallTo(-30, -30);
    await trainer.waitFor(300);
    await trainer.commandMoveTo(20, -20);
    await trainer.waitFor(100);
    await trainer.commandKickBallTo(30, 30);
    await trainer.waitFor(300);
    await trainer.changeTo('before_kick_off');
    await trainer.say('sm finish');
    await trainer.close();
}

script();