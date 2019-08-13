import * as amqp from 'amqplib';

const queue = 'hello-queue';

async function send() {
    try {
        const connection = await amqp.connect('amqp://localhost');
        const channel = await connection.createChannel();

        await channel.assertQueue(queue, { durable: false });

        const msg = 'Hello World!!!';
        channel.sendToQueue(queue, Buffer.from(msg));
        console.log("[x] Sent %s", msg);
    } catch (err) {
        console.log(err);
        throw err;
    }
}

async function receive() {
    try {
        const connection = await amqp.connect('amqp://localhost');
        const channel = await connection.createChannel();

        await channel.assertQueue(queue, { durable: false });

        console.log("[*] Waiting for messages in %s. To exit press CTRL+C", queue);
        channel.consume(queue, (msg) => {
            console.log("[x] Received %s", msg.content.toString());
        }, {
            noAck: true
        });
    } catch (err) {
        console.log(err);
        throw err;
    }
}

export default async function run() {
    receive().then(() => setInterval(send, 1000));
}