'use strict';

exports.isStar = true;
exports.runParallel = runParallel;

/** Функция паралелльно запускает указанное число промисов
 * @param {Array} jobs – функции, которые возвращают промисы
 * @param {Number} parallelNum - число одновременно исполняющихся промисов
 * @param {Number} timeout - таймаут работы промиса
 * @returns {Promise}
 */
function runParallel(jobs, parallelNum, timeout = 1000) {
    let nextThread = 1;
    let finishedJob = 0;
    let result = [];
    let parallelThreads = jobs.reduce(function (acc, element) {
        if (acc[acc.length - 1].length < parallelNum) {
            acc[acc.length - 1] = (acc[acc.length - 1].concat(element));

            return acc;
        }
        acc.push([element]);

        return acc;
    }, [[]]);

    return new Promise(resolve => {
        parallelThreads.forEach((job, indexThread) => {
            runJob(job, indexThread, resolve);
        });
    });

    function runJob(thread, indexThread, resolve) {
        thread.forEach((job, indexJob) => getPromise(job, timeout).then(data =>
            helper(data, indexThread * parallelNum + indexJob, resolve)));
    }

    function helper(data, index, resolve) {
        result[index] = data;
        finishedJob++;
        if (finishedJob === jobs.length) {
            resolve(result);
        }
        if (nextThread < parallelThreads.length) {
            let currentThread = nextThread;
            nextThread++;
            runJob(parallelThreads[currentThread], currentThread, resolve);
        }
    }

    function getPromise(job) {
        return new Promise(resolve => {
            job().then(resolve, resolve);
            setTimeout(() => resolve(new Error('Promise timeout')), timeout);
        });
    }
}
