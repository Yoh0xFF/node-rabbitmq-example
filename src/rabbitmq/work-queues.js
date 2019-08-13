import * as amqp from 'amqplib';
import { Random } from 'random-js';

const queue = 'worker-queue';
const random = new Random();

async function send() {
    try {
        const connection = await amqp.connect('amqp://localhost');
        const channel = await connection.createChannel();

        await channel.assertQueue(queue, { durable: true });

        for (let k = 0; k < 10; ++k) {
            const msg = 'Hello World' + '.'.repeat(random.integer(1, 5));
            channel.sendToQueue(queue, Buffer.from(msg));
            console.log("[x] Sent %s", msg);
        }
    } catch (err) {
        console.log(err);
        throw err;
    }
}

async function receive(k) {
    try {
        const connection = await amqp.connect('amqp://localhost');
        const channel = await connection.createChannel();

        await channel.assertQueue(queue, { durable: true });
        channel.prefetch(1);

        console.log("[*] %d Waiting for messages in %s. To exit press CTRL+C", k, queue);
        channel.consume(queue, (msg) => {
            const str = msg.content.toString();
            const secs = str.split('.').length - 1;

            setTimeout(() => {
                console.log('[x] %d Received %s, Done', k, str);
                channel.ack(msg);
            }, secs * 1000);
        }, {
            noAck: false
        });
    } catch (err) {
        console.log(err);
        throw err;
    }
}

export default async function run() {
    setInterval(send, 30000);
    receive(1);
    receive(2);
    receive(3);
}