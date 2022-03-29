const dgram = require('dgram');
const Buffer = require('buffer').Buffer;
const EventEmitter = require('events');
const sexp = require('s-expression');

class Emitter extends EventEmitter {};

let port = 6001;
const client = dgram.createSocket('udp4');
const emitter = new Emitter();

let flags = {
    'g l': { x: -52.5, y: 0 },
    'g r': { x:  52.5, y: 0 }
};

let server = {
    goal_width: 14.02
};

function parseServerParam(message) {
    let tree = sexp(message);
    tree.forEach(element => {
        if (element instanceof Array) {
            switch (element[0]) {
                case 'goal_width':
                    server.goal_width = parseFloat(element[1]);
                    break;
                default:
                    break;
            }
        }
    });
}

client.on('message', (message, info) => {
    port = info.port;
    message = message.toString('utf8').slice(0, -1); // message is of type buffer, and it includes a strange char at the end
    let message_type = message.substring(1, message.indexOf(' '));
    switch (message_type) {
        case 'init':
        case 'see_global':
            emitter.emit(message_type, message);
            break;
        case 'server_param':
            parseServerParam(message);
            break;
        case 'error':
            console.error(message);
            emitter.emit('error', new Error(message));
            break;
        case 'ok':
            if (process.env.LOG_OK) { console.log(message); }
            break;
        case 'warning':
            console.log(message);
            break;
        default:
            break;
    }
});

client.on('close', () => {
    console.log('client disconnected');
});

client.on('error', err => {
    console.error(err);
    emitter.emit('error', err);
})

function send(message) {
    return new Promise((resolve, reject) => {
        let data = Buffer.from(message + '\0');
        client.send(data, port, 'localhost', err => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

module.exports.init = () => {
    return send('(init (version 15.1))').then(() => {
        return new Promise((resolve, reject) => {
            emitter.on('init', () => {
                resolve(send('(eye on)'));
            });
            emitter.on('error', err => {
                reject(err)
            });
        });
    });
}

module.exports.nextCycle = () => {
    return new Promise((resolve, reject) => {
        function onSeeGlobal(see_global) {
            emitter.removeListener('see_global', onSeeGlobal);
            emitter.removeListener('error', onError);
            let tree = sexp(see_global);
            if (tree instanceof Error) {
                reject(tree);
            } else {
                let see = { game_time: parseInt(tree[1]) };
                tree.forEach(element => {
                    if (element instanceof Array) {
                        let name = element[0];
                        if (name[0] == 'b') {
                            see.ball = { x: parseFloat(element[1]), y: parseFloat(element[2]) }
                        }
                    }
                });
                resolve(see);
            }
        }
        function onError(err) {
            emitter.removeListener('see_global', onSeeGlobal);
            emitter.removeListener('error', onError);
            reject(err);
        }
        emitter.on('see_global', onSeeGlobal);
        emitter.on('error', onError);
    })
}

module.exports.waitFor = (cycles) => {
    return new Promise((resolve, reject) => {
        function onSeeGlobal() {
            cycles = cycles - 1;
            if (cycles < 1) {
                emitter.removeListener('see_global', onSeeGlobal);
                emitter.removeListener('error', onError);
                resolve();
            }
        }
        function onError(err) {
            emitter.removeListener('see_global', onSeeGlobal);
            emitter.removeListener('error', onError);
            reject(err);
        }
        emitter.on('see_global', onSeeGlobal);
        emitter.on('error', onError);
    });
}

module.exports.say = (message) => {
    return send(`(say ${message})`);
}

module.exports.changeTo = (mode) => {
    return send(`(change_mode ${mode})`);
}

module.exports.moveBallTo = (x, y) => {
    return send(`(move (ball) ${x.toFixed(2)} ${y.toFixed(2)})`);
}

module.exports.recover = () => {
    return send('(recover)');
}

module.exports.commandMoveTo = (x, y) => {
    return send(`(say mt ${x.toFixed(2)} ${y.toFixed(2)})`);
}

module.exports.commandKickBallTo = (x, y) => {
    return send(`(say kt ${x.toFixed(2)} ${y.toFixed(2)})`);
}

module.exports.close = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            client.close();
            resolve();
        }, 1000);
    });
}

module.exports.randomPosition = () => {
    return {
        x: -52 + Math.random() * 104,
        y: -34 + Math.random() * 68
    };
}

module.exports.getFlag = (flag) => {
    return flags[flag];
}

module.exports.getServerParam = (server_param) => {
    return server[server_param];
}