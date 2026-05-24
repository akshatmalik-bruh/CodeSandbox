import {Queue} from 'bullmq';
import {connection} from './connection.js';

export const RunQueue = new Queue('runQueue', {
  connection,
});
export const EmailQueue = new Queue('emailQueue',{
    connection,
});