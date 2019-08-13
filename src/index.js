import * as helloWorld from './rabbitmq/hello-world';
import * as workQueues from './rabbitmq/work-queues';
import * as publishSubscribe from './rabbitmq/publish-subscribe';
import * as routing from './rabbitmq/routing';
import * as topics from './rabbitmq/topics';

const mod = process.env.MOD;

switch (mod) {
    case 'hello-world':
        helloWorld.run()
            .then(() => console.log('Success!'))
            .catch((err) => console.log('Fail %s!', err));
        break;
    case 'work-queues':
        workQueues.run()
            .then(() => console.log('Success!'))
            .catch((err) => console.log('Fail %s!', err));
        break;
    case 'publish-subscribe':
        publishSubscribe.run()
            .then(() => console.log('Success!'))
            .catch((err) => console.log('Fail %s!', err));
        break;
    case 'routing':
        routing.run()
            .then(() => console.log('Success!'))
            .catch((err) => console.log('Fail %s!', err));
        break;
    case 'topics':
        topics.run()
            .then(() => console.log('Success!'))
            .catch((err) => console.log('Fail %s!', err));
        break;
    default:
        console.log('Unknown module!')
}

