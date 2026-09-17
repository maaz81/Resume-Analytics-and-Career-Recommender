import { addPasswordResetEmailJob } from '../../src/queues/email.queue.js';

const test = async () => {
    try {
        const job = await addPasswordResetEmailJob({
            userId: 999,
            email: 'test@example.com',
            resetToken: 'test-reset-token-123',
        });

        console.log('✅ Test email job added');
        console.log('Job ID:', job.id);

        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to add email job');
        console.error(error);

        process.exit(1);
    }
};

test();