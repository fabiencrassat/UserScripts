// ==UserScript==
// @name         Toggl - Weekly report
// @namespace    https://github.com/fabiencrassat
// @version      0.8.3
// @description  Calculate and display the work day percentages
// @author       Fabien Crassat <fabien@crassat.com>
// @include      https://toggl.com/app/*
// @grant        none
// ==/UserScript==

/*global $, console */

/*eslint no-console: ["error", { allow: ["info", "warn", "error"] }] */

"use strict";

const weekDays = [0, 1, 2, 3, 4, 5, 6];
const urlToFollow = /^https:\/\/toggl\.com\/app\/reports\/weekly\/\d+\/period\/([a-z])\w+/;
const apiTimeEntriesUrlToFollow = "https://toggl.com/reports/api/v3/workspace/2294752/weekly/time_entries";
const apiProjectsUrlToFollow = "https://toggl.com/api/v9/me/projects";
const decimalLenght = 2;
const debugMode = false;

let projects = [];

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
};
const backFetch = function() {
    fetch = oldFetch;
};

const sleep = function() {
    return new Promise((resolve) => setTimeout(resolve, 1000));
};

const cleanDisplay = function() {
    $(".fcr-toggl").remove();
};

const percentage = function(numerator, denumerator) {
    if (!numerator || !denumerator || denumerator === 0) {
        return 0;
    }
    return (numerator / denumerator);
};

const calculate = function(weeklyData) {
    /**
     * The weeklyData argument in the V3 API has this values
     * [
     *   {
     *     "user_id": 2644339,
     *     "project_id": 150741509,
     *     "seconds": // Mon, Tue, Wed, Thu, Fri, Sat, Sun
     *       [0, 7200, 0, 0, 0, 0, 0],
     *   },
     *   {...}
     * ]
     *
     * The result:
     * [
     *   {
     *     client: '',
     *     project: 'name',
     *     data: // Mon, Tue, Wed, Thu, Fri, Sat, Sun
     *       [0, 0.23, 0, 0, 0, 0, 0],
     *     conso: sum(weeklyData[].seconds) / sum(allProjectsDays),
     *   },
     *   {...}
     * ]
     */

    let projectSum = {};
    let daysSum = [];
    weeklyData.forEach(function(line) {
      // Sum the line
      projectSum[line.project_id] = line.seconds.reduce(function(acc, cur) {
        return acc + cur;
      });
      // Sum the days
      weekDays.forEach(function(day) {
        daysSum[day] = (daysSum[day] || 0) + line.seconds[day];
      });
    });

    // Sum the week
    let weekSum = daysSum.reduce(function(acc, cur) {
      return acc + cur;
    });

    let result = [];
    weeklyData.forEach(function(line) {
      let data = [];
      line.seconds.forEach(function(day, index) {
        data.push(percentage(day, daysSum[index]));
      });
      const project = projects.find((project) => project.id === line.project_id);
      const projectName = project ? project.name : null;
      result.push({
        client: "",
        project: projectName,
        data: data,
        conso: percentage(projectSum[line.project_id], weekSum)
      });
    });

    return result;
};

const filterDataFromProject = function(data, lineElement) {
    const text = $(lineElement).find(".css-70qvj9.efdmxuc2 > span:first-child").text();
    if (text.trim() === "Without project") {
        return data.find((value) => value.project === null);
    }
    return data.find((value) => value.project === text);
};

const displayInTheLine = function(lineElement, data) {
    // For each line, select only days and total columns
    const columns = $(lineElement).find(".css-7ajft7.euf6jrl1");
    if (columns.length <= 0) {
        console.warn("There is no display column", columns);
        return;
    }
    columns.each(function(indexColumn) {
        let dataInCeil = 0;
        if (columns.length === indexColumn + 1) {
          dataInCeil = data.conso;
        } else {
          dataInCeil = data.data[indexColumn];
        }
        if (dataInCeil !== 0) {
            $(this).append("<p class='fcr-toggl'><br />" + dataInCeil.toFixed(decimalLenght) + "</p>");
        }
    });
};

const display = function(data = []) {
    // Select the data line in the tab
    const displayLines = $(".css-1v0lzu.euf6jrl0:not(:first, :last)");
    if (!displayLines || displayLines.length === 0) {
        console.warn("There is no display line", displayLines);
        return;
    }
    displayLines.each(function() {
        displayInTheLine(this, filterDataFromProject(data, this));
    });
};

const calculateAndDisplay = async function(data) {
    await sleep(); // Need to wait to the table built
    cleanDisplay();
    display(calculate(data));
};

const fillProjects = async function(data = []) {
    projects = data.map((project) => {
        return { id: project.id, name: project.name, clientId : project.client_id };
    });
};

const checkResponseAndUrl = function(response, url, apiRUl) {
    return response.ok && response.status === 200 && url && url.startsWith(apiRUl);
};

const response = function(response) {
    const responseClone = response.clone(); // clone to consume json body stream response
    const url = response.url;
    if (checkResponseAndUrl(responseClone, url, apiProjectsUrlToFollow)) {
        console.info("Url to follow found!", url);
        responseClone.json().then(fillProjects);
    }
    if (checkResponseAndUrl(responseClone, url, apiTimeEntriesUrlToFollow)) {
        console.info("Url to follow found!", url);
        responseClone.json().then(calculateAndDisplay);
    }
};

const fireOnChange = function(url = "") {
    // Check if we are in the good page
    if (urlToFollow.test(url)) {
        buildFetch(response);
        return true;
    }
    backFetch();
    return false;
};

console.info("== Toggl - Weekly report ==");
// Follow the HTML5 url change in the API browser
(function (old) {
    window.history.pushState = function () {
        old.apply(window.history, arguments);
        fireOnChange(window.location.href);
    };
}(window.history.pushState));
fireOnChange(location.href);
