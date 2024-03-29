import * as amqp from 'amqplib';
import { Random } from 'random-js';

const exchange = 'pubsub-queue-exchange';
const random = new Random();

async function send() {
    try {
        const connection = await amqp.connect('amqp://localhost');
        const channel = await connection.createChannel();

        await channel.assertExchange(exchange, 'fanout', { durable: false });

        for (let k = 0; k < 10; ++k) {
            const msg = random.string(10);
            channel.publish(exchange, '', Buffer.from(msg));
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

        await channel.assertExchange(exchange, 'fanout', { durable: false });

        const q = await channel.assertQueue('', { exclusive: true });
        await channel.bindQueue(q.queue, exchange, '');

        console.log("[*] %d Waiting for messages in %s. To exit press CTRL+C", k, q.queue);
        channel.consume(q.queue, (msg) => {
            console.log('[x] %d Received %s', k, msg.content.toString());
        }, {
            noAck: true
        });
    } catch (err) {
        console.log(err);
        throw err;
    }
}

export async function run() {
    setInterval(send, 5000);
    await receive(1);
    await receive(2);
}