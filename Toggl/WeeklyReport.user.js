// ==UserScript==
// @name         Toggl - Weekly report
// @namespace    https://github.com/fabiencrassat
// @version      0.5
// @description  Calculate and display the work day percentages
// @author       Fabien Crassat <fabien@crassat.com>
// @include      /^https:\/\/toggl\.com\/app\/reports\/weekly\/\d+\/period\/([a-z])\w+/
// @grant        none
// ==/UserScript==

/** global: $, console */

(function() {
    "use strict";

    const weekDaysPlusTotal = [0, 1, 2, 3, 4, 5, 6, 7];
    const urlToFollow = "https://toggl.com/reports/api/v2/weekly.json";
    const displayLinesSelector = "table.data-table tr:not(:first, .subgroup, :last)";
    const displayColumnsSelector = "td[class^='day-'], td.col-total";
    const decimalLenght = 2;

    const percentage = function(numerator, denumerator) {
        if (!numerator || !denumerator || denumerator === 0) {
            return 0;
        }
        return (numerator / denumerator);
    };

    const extractOneDay = function(data, dayNumber, totalDay) {
        var dataDay = [];
        data.forEach(function(dataLine) {
            dataDay.push(percentage(dataLine.totals[dayNumber], totalDay));
        });
        return dataDay;
    };

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function getDisplayLines() {
        await sleep(1000); // Need to wait to the table built
        const displayLines = $(displayLinesSelector);
        if (!displayLines || displayLines.length === 0) {
            console.warn('There is no display line', displayLines);
            return {}
        }
        return displayLines;
    };

    async function main(weeklyData) {
        // Calculate
        var dataDaysPlusTotal = [];
        weekDaysPlusTotal.forEach(function(dayOrTotal, index) {
            dataDaysPlusTotal.push(extractOneDay(weeklyData.data, index, weeklyData.week_totals[index]));
        });

        // Display
        getDisplayLines().then(function(displayLines) {
            if (displayLines.length !== dataDaysPlusTotal[0].length) {
                console.warn("There is not the same calculated and display lines.", displayLines, dataDaysPlusTotal[0]);
                return;
            }
            displayLines.each(function(indexLine) {
                const element = $(this).find(displayColumnsSelector);
                element.each(function(indexColumn) {
                    const dataInCeil = dataDaysPlusTotal[indexColumn][displayLines.length - indexLine - 1];
                    if (dataInCeil !== 0) {
                        $(this).append("<p>" + dataInCeil.toFixed(decimalLenght) + "</p>");
                    }
                });
            });
        });
    };

    console.info('== Toggl - Weekly report ==');
    var oldFetch = fetch;  // must be on the global scope
    fetch = function(url, options) {
        var promise = oldFetch(url, options);
        // Do something with the promise
        promise.then(function(response) {
            const responseClone = response.clone(); // clone to consume json body stream response
            if (responseClone.ok && responseClone.status === 200 && responseClone.url && responseClone.url.startsWith(urlToFollow)) {
                console.info('Url to follow found!');
                responseClone.json().then(function(data) {
                    main(data);
                });
            }
        }).catch(function(error) {
            console.log('Error in fetch processing', error);
        });
        return promise;
    }
})();
