// ==UserScript==
// @name         Pogdesign-Widgets
// @namespace    https://github.com/fabiencrassat
// @version      1.3.6
// @description  Add links relative to the episode
// @author       Fabien Crassat <fabien@crassat.com>
// @match        https://www.pogdesign.co.uk/cat/
// @match        http://www.pogdesign.co.uk/cat/
// @include      /^https:\/\/www\.pogdesign\.co\.uk\/cat\/\d{1,}-\d{4}/
// @include      /^https:\/\/www\.pogdesign\.co\.uk\/cat\/day\/\d{1,}-\d{1,}-\d{4}/
// @include      /^https:\/\/www\.pogdesign\.co\.uk\/cat\/\w+(-*\w+)*\/Season-\d+\/Episode-\d+/
// @include      /^https:\/\/www\.pogdesign\.co\.uk\/cat\/\w+(-*\w+)*-summary/
// @require      https://greasyfork.org/scripts/35624-pogdesign-widgets-js/code/Pogdesign-Widgetsjs.js?version=608231
// @grant        none
// @run-at       document-start
// ==/UserScript==

/*global $, fabiencrassat */
"use strict";

var page = function() {
    var externalLinks = fabiencrassat.view.externalLinks;
    var controller = fabiencrassat.main.controller;
    var shared = fabiencrassat.main.shared;

    var page = {
        calendar: {
            stylesheets() {
                return `
                span.fcr-episodeContainer > :last-child {
                    float: right;
                }
                span.fcr-episodeContainer > :first-child {
                    float: left;
                }
                .ep.infochecked .fcr-externalLink-image {
                    filter: contrast(0);
                }
                .fcr-externalLink-image {
                    height: 12px;
                    width: 12px;
                    background-image: url('` + shared.linkImage + `');
                }`;
            },
            extractTitle(element) {
                return element.parent().prev().text();
            },
            extractSeasonAndEpisode(element) {
                return element.prev().text();
            },
            displayExternalLinksPopup(element) {
                var popup = externalLinks.create(element, "fcr-calendar-page", "block");
                element.parent().parent().parent().after(popup);
            },
            isInLocationPage() {
                /* The regex is the same than the @include in the header */
                return controller.isInLocationPage(/^https:\/\/www\.pogdesign\.co\.uk\/cat\/($|\d{1,}-\d{4})/g);
            },
            insertExternalLink(element) {
                $(element).wrap("<span class='fcr-episodeContainer'></span>");
                $("span.fcr-episodeContainer > :last-child").after(shared.externalImageLink());
            }
        },
        day: {
            stylesheets() {
                return `
                .overbox h4 a {
                    width: 35%;
                    padding-right: 0;
                    margin-right: 25%;
                }
                span.fcr-episodeContainer {
                    padding-top: 24px !important;
                    padding-left: 30px !important;
                    float: left !important;
                    width: 36px !important;
                }
                .fcr-externalLink-image {
                    height: 12px;
                    width: 12px !important;
                    padding: 0 !important;
                    background-image: url('` + shared.linkImage + `');
                }
                .fcr-external-links-popup #poptext > span > a {
                    color: #66bbff;
                }`;
            },
            extractTitle(element) {
                return element.parent().prev().text();
            },
            extractSeasonAndEpisode(element) {
                var seasonAndEpisode = element.parent().next().text();
                var regex = /^Season (\d{1,}), Episode (\d{1,})/g;
                return {
                    season: seasonAndEpisode.replace(regex, "$1"),
                    episode: seasonAndEpisode.replace(regex, "$2")
                };
            },
            displayExternalLinksPopup(element) {
                page.summary.displayExternalLinksPopup(element);
            },
            isInLocationPage() {
                /* The regex is the same than the @include in the header */
                return controller.isInLocationPage(/^https:\/\/www\.pogdesign\.co\.uk\/cat\/day\/\d{1,}-\d{1,}-\d{4}/g);
            },
            insertExternalLink(element) {
                $("<span class='fcr-episodeContainer'></span>").insertAfter(element);
                $(shared.externalImageLink()).appendTo("span.fcr-episodeContainer");
            }
        },
        summary: {
            stylesheets() {
                return `
                span.fcr-episodeContainer {
                    display: flex;
                }
                .fcr-externalLink-image {
                    height: 12px !important;
                    width: 12px !important;
                    filter: contrast(0);
                    margin: 9px -12px 9px 54px;
                    background-image: url('` + shared.linkImage + `');
                }
                .ep.infochecked .fcr-externalLink-image {
                    filter: contrast(0.4);
                }
                .fcr-external-links-popup #pop {
                    padding: 1px;
                    font-size: initial;
                    letter-spacing: initial;
                    line-height: 1.5;
                    border: 1px solid #000;
                    border-radius: 10px;
                    box-shadow: 0px 0px 21px rgba(0, 0, 0, 0.5);
                    text-shadow: 1px 1px 0 #000;
                    background-color: rgba(38, 38, 38, 0.9);
                    opacity: .95;
                }
                .fcr-external-links-popup #popheader {
                    background-color: rgba(0, 0, 0, 0.3);
                    color: #fff;
                    border-radius: 9px 9px 0 0;
                }
                .fcr-external-links-popup #poptext > span > a {
                    color: #66bbff;
                }
                .fcr-external-links-popup #popfooter {
                    background-color: rgba(0, 0, 0, 0.3);
                    color: #FF9326;
                    border-radius: 0 0 9px 9px;
                }`;
            },
            extractTitle() {
                return $("h2.sumhead > a").text().replace(/  Summary & Series Guide/g,'');;
            },
            extractSeasonAndEpisode(element) {
                var seasonAndEpisodeElement = element.parent().parent().parent();
                return {
                    season: seasonAndEpisodeElement.find("[itemprop=seasonNumber]").text(),
                    episode: seasonAndEpisodeElement.find("[itemprop=episodeNumber]").text()
                };
            },
            displayExternalLinksPopup(element) {
                var top = element.offset().top + 20;
                var left = element.offset().left - 200;
                var popup = externalLinks.create(element, "fcr-external-links-popup", "block", top, left);
                $("body > div:last").after(popup);
            },
            isInLocationPage() {
                /* The regex is the same than the @include in the header */
                return controller.isInLocationPage(/^https:\/\/www\.pogdesign\.co\.uk\/cat\/\w+(-*\w+)*-summary/g);
            },
            insertExternalLink(element) {
                $(element).wrap("<span class='fcr-episodeContainer'></span>");
                $(shared.externalImageLink()).appendTo("span.fcr-episodeContainer");
            }
        },
        episode: {
            stylesheets() {
                return page.summary.stylesheets();
            },
            extractTitle() {
                return $(".furtherinfo a:first").text();
            },
            extractSeasonAndEpisode() {
                return $("h3.sdfsdf").children().first().text();
            },
            displayExternalLinksPopup(element) {
                var popup = externalLinks.create(element, "fcr-external-links-popup", "inline-flex");
                element.after(popup);
            },
            isInLocationPage() {
                /* The regex is the same than the @include in the header */
                return controller.isInLocationPage(/^https:\/\/www\.pogdesign\.co\.uk\/cat\/\w+(-*\w+)*\/Season-\d+\/Episode-\d+/g);
            },
            insertExternalLink(element) {
                $("<span> " + shared.externalTextLink() + "</span>").appendTo(element);
            }
        }
    };

    return {
        calendar: page.calendar,
        day: page.day,
        summary: page.summary,
        episode: page.episode
    };
};

var script = document.createElement("script");
script.appendChild(document.createTextNode("var fabiencrassat = fabiencrassat || {}; fabiencrassat.page = ("+ page +")();"));
(document.body || document.head || document.documentElement).appendChild(script);

window.addEventListener("load", function() {
    // Add search episode links for calendar pages
    fabiencrassat.main.controller.addExternalLink(fabiencrassat.page.calendar, "#month_box p > :last-child");
    // Add search episode links for day pages
    fabiencrassat.main.controller.addExternalLink(fabiencrassat.page.day, ".overbox > h4 > a");
    // Add search episode links for summary page
    fabiencrassat.main.controller.addExternalLink(fabiencrassat.page.summary, "li.ep > strong > a");
    // Add search episode links for episode page
    fabiencrassat.main.controller.addExternalLink(fabiencrassat.page.episode, "h3.sdfsdf");
    // no page found
}, false);
