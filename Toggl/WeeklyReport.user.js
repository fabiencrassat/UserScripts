// ==UserScript==
// @name         Toggl - Weekly report
// @namespace    https://github.com/fabiencrassat
// @version      0.7.0
// @description  Calculate and display the work day percentages
// @author       Fabien Crassat <fabien@crassat.com>
// @include      https://toggl.com/app/*
// @grant        none
// ==/UserScript==

/*global $, console */

/*eslint no-console: ["error", { allow: ["info", "warn", "error"] }] */

"use strict";

const weekDaysPlusTotal = [0, 1, 2, 3, 4, 5, 6, 7];
const urlToFollow = /^https:\/\/toggl\.com\/app\/reports\/weekly\/\d+\/period\/([a-z])\w+/;
const apiUrlToFollow = "https://toggl.com/reports/api/v2/weekly.json";
const decimalLenght = 2;

var oldFetch = fetch; // must be on the global scope

const buildFetch = function(doSomethingWithResponse) {
    fetch = function(url, options) {
        var promise = oldFetch(url, options);
        // Do something with the promise
        promise.then(doSomethingWithResponse).catch(function(error) {
            console.error("Error in fetch processing", error);
        });
        return promise;
    };
}
const backFetch = function() {
    fetch = oldFetch;
}

function sleep() {
    return new Promise((resolve) => setTimeout(resolve, 1000));
}

const cleanDisplay = function() {
    $(".fcr-toggl").remove();
}

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

const calculate = function(weeklyData) {
    let dataDaysPlusTotal = [];
    weekDaysPlusTotal.forEach(function(dayOrTotal, index) {
        dataDaysPlusTotal.push(extractOneDay(weeklyData.data, index, weeklyData.week_totals[index]));
    });

    let result = [];
    weeklyData.data.forEach(function(data, index) {
        let dataDayPlusTotal = dataDaysPlusTotal.map(value => value[index]);
        result.push({ client: data.title.client, project: data.title.project, data: dataDayPlusTotal });
    });

    return result;
}

const filterDataFromProject = function(data, lineElement) {
    const text = $(lineElement).find(".col-grouping").text();
    if (text.trim() === '(no project)') {
        return data.find(value => value.project === null && value.client === null);
    }
    return data.find(value => value.project + " " + value.client === text);
}

const displayInTheLine = function(lineElement, data) {
    $(lineElement).find("td[class^='day-'], td.col-total").each(function(indexColumn) {
        const dataInCeil = data.data[indexColumn];
        if (dataInCeil !== 0) {
            $(this).append("<p class='fcr-toggl'>" + dataInCeil.toFixed(decimalLenght) + "</p>");
        }
    });
}

const display = function(data = []) {
    const displayLines = $("table.data-table tr:not(:first, .subgroup, :last)");
    if (!displayLines || displayLines.length === 0) {
        console.warn("There is no display line", displayLines);
        return;
    }
    displayLines.each(function() {
        displayInTheLine(this, filterDataFromProject(data, this))
    });
}

const calculateAndDisplay = async function(data) {
    await sleep(); // Need to wait to the table built
    cleanDisplay();
    display(calculate(data));
}

const response = function(response) {
    const responseClone = response.clone(); // clone to consume json body stream response
    const url = response.url;
    if (responseClone.ok && responseClone.status === 200 && url && url.startsWith(apiUrlToFollow)) {
        console.info("Url to follow found!", url);
        responseClone.json().then(calculateAndDisplay);
    }
}

const fireOnChange = function(url = '') {
    // Check if we are in the good page
    if (urlToFollow.test(url)) {
        buildFetch(response);
        return true;
    }
    backFetch();
    return false;
}

console.info("== Toggl - Weekly report ==");
// Follow the HTML5 url change in the API browser
(function (old) {
    window.history.pushState = function () {
        old.apply(window.history, arguments);
        fireOnChange(window.location.href);
    };
}(window.history.pushState));
fireOnChange(location.href);
