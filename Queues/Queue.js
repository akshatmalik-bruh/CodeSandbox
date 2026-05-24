import {Queue} from 'bullmq';
import {connection} from './connection.js';

export const RunQueue = new Queue('runQueue', {
  connection,
});