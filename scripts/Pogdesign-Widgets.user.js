// ==UserScript==
// @name         Pogdesign-Widgets
// @namespace    https://github.com/fabiencrassat
// @version      1.0.4
// @description  Add links relative to the episode
// @author       You
// @match        https://www.pogdesign.co.uk/cat/
// @include      /^https:\/\/www\.pogdesign\.co\.uk\/cat\/\d{1,}-\d{4}/
// @include      /^https:\/\/www\.pogdesign\.co\.uk\/cat\/\w+(-*\w+)*\/Season-\d+\/Episode-\d+/
// @include      /^https:\/\/www\.pogdesign\.co\.uk\/cat\/\w+(-*\w+)*-summary/
// @grant        none
// @run-at       document-start
// ==/UserScript==

/*global $ */
/*global fabiencrassat */
"use strict";

var main = function() {

    var tools = {
        addZeroToOneNumber(number) {
            if (number.length < 2) { number = "0" + number; }
            return number;
        }
    };

    var show = {
        title: "",
        season: "",
        episode: "",
        seasonAndEpisode: "",
        getTitle() { return this.title; },
        setTitle(title) { this.title = title; },
        getSeason() { return this.season; },
        setSeason(season) {
            this.season = tools.addZeroToOneNumber(season);
        },
        getEpisode() { return this.episode; },
        setEpisode(episode) {
            this.episode = tools.addZeroToOneNumber(episode);
        },
        getSeasonAndEpisode() { return this.seasonAndEpisode; },
        setSeasonAndEpisode() {
            if (arguments.length === 1) {
                this.seasonAndEpisode = arguments[0];
            }
            else if (arguments.length === 2) {
                this.setSeason(arguments[0]);
                this.setEpisode(arguments[1]);
                this.seasonAndEpisode = "S" + this.getSeason() + "E" + this.getEpisode();
            }
            else {
                throw new RangeError("Exception in setSeasonAndEpisode");
            }
        },

        getSearch() {
            return this.getTitle().replace(/ /gm, ".") + "." + this.getSeasonAndEpisode();
        }
    };

    var externalLinks = {
        links: [
            {site: "google",
                icon: "",
                url(show) { return "https://www.google.fr/search?q=" + show.getSearch() + "+vostfr+streaming"; }
            },
            {site: "binsearch",
                icon: "",
                url(show) { return "https://binsearch.info/?q=" + show.getSearch(); }
            },
            {site: "subscene",
                icon: "",
                url(show) { return "https://subscene.com/subtitles/release?q=" + show.getSearch(); }
            }
        ],
        getLinks(show) {
            var links = "<span>";
            for (var i = 0; i < this.links.length; i++) {
                links += "<a target='_blank' href='" + this.links[i].url(show) + "'>";
                links += this.links[i].site;
                links += "</a><br>";
            }
            links += "</span>";
            return links;
        },

        popupId: "fcr-external-links-element",
        getPopupContainer() {
            return $("#" + this.popupId);
        },
        removePopup(container) {
            container.remove();
        },
        getPixelStyle(key, value) {
            if (key && value) {
                return " " + key + ": " + value + "px;";
            }
            return "";
        },
        createPopup(show, element, cssClass, cssDisplay, top, left) {
            var popup = "";
            popup = "<div id='" + this.popupId + "' style='position: absolute; width: 350px; z-index: 97; display: " + cssDisplay + ";" + this.getPixelStyle("top", top) + this.getPixelStyle("left", left) + "' class='cluetip ui-widget ui-widget-content ui-cluetip clue-right-default cluetip-default " + cssClass + "'>";
            popup += "<div class='cluetip-inner ui-widget-content ui-cluetip-content'>";
            popup += "<div id='pop'>";
            popup += "<div id='popheader'><a class='fcr-closePopup' href='javascript:fabiencrassat.pogdesignWidget.clearLinksElement();'>X</a>";
            popup += "<span>" + show.getTitle() + " " + show.getSeasonAndEpisode() + "</span>";
            popup += "</div>";
            popup += "<div id='poptext'>" + this.getLinks(show) + "</div>";
            popup += "<div id='popfooter'>" + show.getSearch() + "</div>";
            popup += "</div></div></div>";
            return(popup);
        }
    };

    var page = {
        controller: {
            insertStylesheets(stylesheets) {
                var style = document.createElement("style");
                style.appendChild(document.createTextNode(stylesheets()));
                (document.body || document.head || document.documentElement).appendChild(style);
            },
            loadClickEventOnLinkElement(getExternalLinksPopup) {
                $(".fcr-externalLinksLink").on("click", function(event) {
                    event.preventDefault();
                    getExternalLinksPopup($(this));
                });
            }
        },
        shared: {
            linkImage: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAZdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjAuMTM0A1t6AAAA20lEQVQoU33RuQrCQBDG8YgHeIIHinhgZyNWgg8iCoqIpW/jg5nG0oew8b7j/wsZCSkM/Nbs7MzuuHE8z/snhlxIyhbaGEb0MMAb9myUvMAJR1xwxQEvJLCCPVsVKKGOMqqBAipIw8UTOskv0E55WHtGyRsocYYlXC3cUEQ0WTsrWS1bPKNBx9VCQSXv8MEEHZTgr2t4oGkBdKFLGAdz/cd58O4XnBFtKRN6V8tTm2tQS7pvSwjTh9tjZDENfehY7XSHbk2/immzNVT4K5A4smghGcwb0DexHHjOFwrY3c0uEFwZAAAAAElFTkSuQmCC",
            stylesheets: "a.fcr-closePopup {" +
                    "float: right;" +
                    "color: #66bbff !important;" +
                "}"
        },
        calendar: {
            stylesheets() {
                var result = "";
                result += "span.fcr-episodeContainer > :last-child {" +
                    "float: right;" +
                    "margin: 0 !important;" +
                "}";
                result += "span.fcr-episodeContainer > :first-child {" +
                    "float: left;" +
                "}";
                result += ".fcr-externalLink-image {" +
                    "height: 12px;" +
                    "width: 12px;" +
                    "background-image: url('" + page.shared.linkImage + "');" +
                "}";
                result += ".ep.infochecked .fcr-externalLink-image {" +
                    "filter: contrast(0);" +
                "}";
                result += page.shared.stylesheets;
                return(result);
            },
            extractShow(show, element) {
                this.extractTitle(show, element);
                this.extractSeasonAndEpisode(show, element);
            },
            extractTitle(show, element) {
                var title = $.trim(element.parent().prev().text());
                show.setTitle(title);
            },
            extractSeasonAndEpisode(show, element) {
                var seasonAndEpisode = element.prev().text();
                show.setSeasonAndEpisode(seasonAndEpisode);
            },
            displayExternalLinksPopup(show, element) {
                var popup = externalLinks.createPopup(show, element, "fcr-calendar-page", "block");
                element.parent().parent().parent().after(popup);
            },
            getExternalLinksPopup(element) {
                clearLinksElement();
                page.calendar.extractShow(show, element);
                page.calendar.displayExternalLinksPopup(show, element);
            }
        },
        summary: {
            stylesheets() {
                var result = "";
                result += "span.fcr-episodeContainer {" +
                    "display: flex;" +
                "}";
                result += ".fcr-externalLink-image {" +
                    "height: 12px !important;" +
                    "width: 12px !important;" +
                    "filter: contrast(0);" +
                    "margin: 9px -12px 9px 54px;" +
                    "background-image: url('" + page.shared.linkImage + "');" +
                "}";
                result += ".ep.infochecked .fcr-externalLink-image {" +
                    "filter: contrast(0.4);" +
                "}";
                result += ".fcr-external-links-popup #pop {" +
                    "padding: 1px;" +
                    "font-size: initial;" +
                    "letter-spacing: initial;" +
                    "line-height: 1.5;" +
                    "border: 1px solid #000;" +
                    "border-radius: 10px;" +
                    "box-shadow: 0px 0px 21px rgba(0, 0, 0, 0.5);" +
                    "text-shadow: 1px 1px 0 #000;" +
                    "background-color: rgba(38, 38, 38, 0.9);" +
                    "opacity: .95;" +
                "}";
                result += ".fcr-external-links-popup #popheader {" +
                    "background-color: rgba(0, 0, 0, 0.3);" +
                    "color: #fff;" +
                    "border-radius: 9px 9px 0 0;" +
                "}";
                result += ".fcr-external-links-popup #poptext > span > a {" +
                    "color: #66bbff;" +
                "}";
                result += ".fcr-external-links-popup #popfooter {" +
                    "background-color: rgba(0, 0, 0, 0.3);" +
                    "color: #FF9326;" +
                    "border-radius: 0 0 9px 9px;" +
                "}";
                result += page.shared.stylesheets;
                return(result);
            },
            extractShow(show, element) {
                this.extractTitle(show);
                this.extractSeasonAndEpisode(show, element);
            },
            extractTitle(show) {
                var title = $.trim($("h2.sumhead > a").text());
                show.setTitle(title);
            },
            extractSeasonAndEpisode(show, element) {
                var season = element.parent().parent().parent().find("[itemprop=seasonNumber]").text();
                var episode = element.parent().parent().parent().find("[itemprop=episodeNumber]").text();
                show.setSeasonAndEpisode(season, episode);
            },
            displayExternalLinksPopup(show, element) {
                var top = element.offset().top + 20;
                var left = element.offset().left - 200;
                var popup = externalLinks.createPopup(show, element, "fcr-external-links-popup", "block", top, left);
                $("body > div:last").after(popup);
            },
            getExternalLinksPopup(element) {
                clearLinksElement();
                page.summary.extractShow(show, element);
                page.summary.displayExternalLinksPopup(show, element);
            }
        },
        episode: {
            stylesheets() {
                var result = "";
                result += page.summary.stylesheets();
                return(result);
            },
            extractShow(show) {
                this.extractTitle(show);
                this.extractSeasonAndEpisode(show);
            },
            extractTitle(show) {
                var title = $("h3.sumunderhead").text();
                show.setTitle(title);
            },
            extractSeasonAndEpisode(show) {
                var seasonAndEpisode = $("h3.sdfsdf").children().first().text();
                show.setSeasonAndEpisode(seasonAndEpisode);
            },
            displayExternalLinksPopup(show, element) {
                var popup = externalLinks.createPopup(show, element, "fcr-external-links-popup", "inline-flex");
                element.after(popup);
            },
            getExternalLinksPopup(element) {
                clearLinksElement();
                page.episode.extractShow(show);
                page.episode.displayExternalLinksPopup(show, element);
            }
        }
    };

    function clearLinksElement() {
        var container = externalLinks.getPopupContainer();
        if(container) {
            externalLinks.removePopup(container);
        }
    }
    function removePopup() {
        $(document).mouseup(function (event) {
            var container = externalLinks.getPopupContainer();
            if (!container.is(event.target) &&          // if the target of the click isn't the container
            container.has(event.target).length === 0) { // nor a descendant of the container
                externalLinks.removePopup(container);
            }
        });
    }

    function addExternalLinkOnCalendarPage(element) {
        var container = $(element);
        if (container.length === 0) { return; }
        page.controller.insertStylesheets(page.calendar.stylesheets);

        container.wrap("<span class='fcr-episodeContainer'></span>");
        $("span.fcr-episodeContainer > :last-child").after("<a href='javascript:void(0)' class='fcr-externalLinksLink fcr-externalLink-image'></a>");
        page.controller.loadClickEventOnLinkElement(page.calendar.getExternalLinksPopup);
        removePopup();
    }

    function addExternalLinkOnSummaryPage(element) {
        var container = $(element);
        if (container.length === 0) { return; }
        page.controller.insertStylesheets(page.summary.stylesheets);

        container.wrap("<span class='fcr-episodeContainer'></span>");
        $("<a href='javascript:void(0)' class='fcr-externalLinksLink fcr-externalLink-image'></a>").appendTo("span.fcr-episodeContainer");
        page.controller.loadClickEventOnLinkElement(page.summary.getExternalLinksPopup);
        removePopup();
    }

    function addExternalLinkOnEpisodePage(element) {
        var container = $(element);
        if (container.length != 1) { return; }
        page.controller.insertStylesheets(page.episode.stylesheets);

        $("<span> <a href='javascript:void(0)' class='fcr-externalLinksLink'>&lt;Links&gt;</a></span>").appendTo(element);
        page.controller.loadClickEventOnLinkElement(page.episode.getExternalLinksPopup);
        removePopup();
    }

    return {
        calendar: {
            addExternalLink: addExternalLinkOnCalendarPage
        },
        summary: {
            addExternalLink: addExternalLinkOnSummaryPage
        },
        episode: {
            addExternalLink: addExternalLinkOnEpisodePage
        },
        clearLinksElement
    };
};

var script = document.createElement("script");
script.appendChild(document.createTextNode("var fabiencrassat = fabiencrassat || {}; fabiencrassat.pogdesignWidget = ("+ main +")();"));
(document.body || document.head || document.documentElement).appendChild(script);

window.addEventListener("load", function() {
    // Add search episode links for calendar pages
    fabiencrassat.pogdesignWidget.calendar.addExternalLink("#month_box p > :last-child");
    // Add search episode links for summary page
    fabiencrassat.pogdesignWidget.summary.addExternalLink("li.ep > strong > a");
    // Add search episode links for episode page
    fabiencrassat.pogdesignWidget.episode.addExternalLink("h3.sdfsdf");
    // no page found
}, false);
