'use strict';

exports.isStar = false;
exports.runParallel = runParallel;
// призыв проверки
/** Функция паралелльно запускает указанное число промисов
 * @param {Array} jobs – функции, которые возвращают промисы
 * @param {Number} parallelNum - число одновременно исполняющихся промисов
 * @param {Number} timeout - таймаут работы промиса
 * @returns {Promise}
 */
function runParallel(jobs, parallelNum, timeout = 1000) {
    let nextJob = parallelNum;
    let finishedJob = 0;
    let result = [];
    let firsts = jobs.slice(0, parallelNum);

    return new Promise(resolve => {
        firsts.forEach((job, indexThread) => {
            runJob(job, indexThread, resolve);
        });
    });

    function runJob(job, index, resolve) {
        getPromise(job, timeout).then(answer => helper(answer, index, resolve));
    }

    function helper(answer, index, resolve) {
        result[index] = answer;
        finishedJob++;
        if (finishedJob === jobs.length) {
            resolve(result);
        }
        if (nextJob < jobs.length) {
            let currentJob = nextJob;
            nextJob++;
            runJob(jobs[currentJob], currentJob, resolve);
        }
    }

    function getPromise(job) {
        return new Promise(resolve => {
            job().then(resolve, resolve);
            setTimeout(() => resolve(new Error('Promise timeout')), timeout);
        });
    }
}
