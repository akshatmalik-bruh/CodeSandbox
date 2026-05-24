import { Queue, Worker } from 'bullmq';


export const myQueue = new Queue('myqueue', {
  connection: {
    host: 'localhost',
    port: 6379,
  },
});

export const myWorker = new Worker('myqueue', async job => {}, {
  connection: {
    host: 'localhost',
    port: 6379  ,
  },
});