// ==UserScript==
// @name         Toggl - Weekly report
// @namespace    https://github.com/fabiencrassat
// @version      0.3
// @description  Calculate and display the work day percentages
// @author       Fabien Crassat <fabien@crassat.com>
// @include      /^https:\/\/toggl\.com\/app\/reports\/weekly\/\d+\/period\/thisWeek/
// @grant        none
// ==/UserScript==

/** global: $, console */

(function() {
    'use strict';

    const weekDaysPlusTotal = [0, 1, 2, 3, 4, 5, 6, 7];
    const urlToFollow = "https://toggl.com/reports/api/v2/weekly.json";
    const displayLinesSelector = "table.data-table tr:not(:first, .subgroup, :last)";
    const displayColumnsSelector = "td[class^='day-'], td.col-total";
    const decimalLenght = 3;

    const textToJsonObject = function(text) {
        if (!text) return {};
        const obj = JSON.parse(text);
        return obj;
    };

    const percentage = function(numerator, denumerator) {
        if (!numerator || !denumerator || denumerator === 0) return 0;
        return (numerator / denumerator);
    };

    const extractOneDay = function(data, dayNumber, totalDay) {
        var dataDay = [];
        data.forEach(function(dataLine) {
            dataDay.push(percentage(dataLine.totals[dayNumber], totalDay));
        });
        return dataDay;
    };

    const main = function(weeklyData) {
        // Calculate
        var dataDaysPlusTotal = [];
        weekDaysPlusTotal.forEach(function(dayOrTotal, index) {
            dataDaysPlusTotal.push(extractOneDay(weeklyData.data, index, weeklyData.week_totals[index]));
        });

        // Display
        const displayLines = $(displayLinesSelector);
        if (!displayLines || displayLines.length !== dataDaysPlusTotal[0].length) {
            console.warn("There is not the same calculated and display lines.");
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
    };

    const origOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function() {
        this.addEventListener('load', function() {
            if (this.responseURL && this.responseURL.startsWith(urlToFollow)) {
                const weeklyData = textToJsonObject(this.responseText);
                main(weeklyData);
            }
        });
        origOpen.apply(this, arguments);
    };
})();
