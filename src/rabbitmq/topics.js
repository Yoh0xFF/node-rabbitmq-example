import * as amqp from 'amqplib';
import { Random } from 'random-js';

const exchange = 'topics-queue-exchange';
const random = new Random();

async function send() {
    try {
        const connection = await amqp.connect('amqp://localhost');
        const channel = await connection.createChannel();

        await channel.assertExchange(exchange, 'topic', { durable: false });

        for (let k = 0; k < 10; ++k) {
            const msg = random.string(10);
            const route = (random.integer(1, 100) % 2 == 0 ? 'app': 'sys')
                + (random.integer(1, 100) % 2 == 0 ? '.green': '.red');
            channel.publish(exchange, route, Buffer.from(msg));
            console.log("[x] Sent %s %s", route, msg);
        }
    } catch (err) {
        console.log(err);
        throw err;
    }
}

async function receive(k, route) {
    try {
        const connection = await amqp.connect('amqp://localhost');
        const channel = await connection.createChannel();

        await channel.assertExchange(exchange, 'topic', { durable: false });

        const q = await channel.assertQueue('', { exclusive: true });
        await channel.bindQueue(q.queue, exchange, route);

        console.log("[*] %d Waiting for messages in %s. To exit press CTRL+C", k, q.queue);
        channel.consume(q.queue, (msg) => {
            console.log('[x] %d Received %s %s', k, msg.fields.routingKey, msg.content.toString());
        }, {
            noAck: true
        });
    } catch (err) {
        console.log(err);
        throw err;
    }
}

export default async function run() {
    setInterval(send, 5000);
    await receive(1, 'sys.*');
    await receive(2, 'app.*');
    await receive(3, '*.red');
}