'use strict';

exports.isStar = true;
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
    let firstSeries = jobs.slice(0, parallelNum);

    return new Promise(resolve => {
        if (jobs.length === 0) {
            resolve([]);
        } else {
            firstSeries.forEach((job, index) => {
                runJob(job, index, resolve);
            });
        }
    });

    function runJob(job, index, resolve) {
        return new Promise(currentResolve => {
            job().then(currentResolve, currentResolve);
            setTimeout(() => currentResolve(new Error('Promise timeout')), timeout);
        }).then(answer => saveAndContinue(answer, index, resolve));
    }

    function saveAndContinue(answer, index, resolve) {
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
}
