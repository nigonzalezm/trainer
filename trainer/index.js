const dgram = require('dgram');
const Buffer = require('buffer').Buffer;
const EventEmitter = require('events');

class Emitter extends EventEmitter {};

let port = 6001;
const client = dgram.createSocket('udp4');
const emitter = new Emitter();

client.on('message', (message, info) => {
    port = info.port;
    message = message.toString('utf8'); // message is of type buffer
    let message_type = message.substring(1, message.indexOf(' '));
    switch (message_type) {
        case 'init':
        case 'see_global':
            emitter.emit(message_type);
            break;
        case 'error':
            console.error(message);
            emitter.emit('error', new Error(message));
            break;
        case 'ok':
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

module.exports.close = () => {
    client.close();
}