import { Queue } from 'bullmq';

const myQueue = new Queue('RunCode');

export const addJobs = async (code, language, userId) => {
  await myQueue.add(`${userId}_${Date.now()}_${language}`, { 
    code ,
    language
  });
  ;
}


