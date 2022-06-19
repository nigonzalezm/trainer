const trainer = require('./trainer');

async function script() {
    await trainer.init();
    await trainer.setStrategy('repeat');
    await trainer.commandKickBallTo(52.5, 0);
    await trainer.waitFor(5);
    let goal_width = trainer.getServerParam('goal_width');
    let flag_gr = trainer.getFlag('g r');
    await trainer.changeTo('play_on');
    for (let iteration = 0; iteration < 10; iteration++) {
        let is_goal = false;
        let {x, y} = trainer.randomPosition();
        await trainer.moveBallTo(x, y);
        while (!is_goal) {
            let see = await trainer.nextCycle();
            let ball = see.ball;
            if (ball.x > flag_gr.x && 
                ball.x < flag_gr.x + 2 && 
                ball.y < flag_gr.y + goal_width / 2 && 
                ball.y > flag_gr.y - goal_width) {
                console.log('goal!');
                is_goal = true;
            }
        }
    }
    await trainer.changeTo('before_kick_off');
    await trainer.say('g/mode finish');
    await trainer.close();
}

script();