import { emailQueue } from '../../src/queues/email.queue.js';

const checkQueue = async () => {
    try {
        const counts = await emailQueue.getJobCounts(
            'waiting',
            'active',
            'completed',
            'failed',
            'delayed'
        );

        console.log('\n📊 EMAIL QUEUE STATUS');
        console.log('----------------------');
        console.log('Waiting   :', counts.waiting);
        console.log('Active    :', counts.active);
        console.log('Completed :', counts.completed);
        console.log('Failed    :', counts.failed);
        console.log('Delayed   :', counts.delayed);

        const waitingJobs = await emailQueue.getJobs(
            ['waiting', 'active', 'failed'],
            0,
            10
        );

        console.log('\n📦 JOBS');

        for (const job of waitingJobs) {
            console.log({
                id: job.id,
                name: job.name,
                state: await job.getState(),
                attemptsMade: job.attemptsMade,
            });
        }

        await emailQueue.close();

        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to inspect email queue');
        console.error(error);

        process.exit(1);
    }
};

checkQueue();