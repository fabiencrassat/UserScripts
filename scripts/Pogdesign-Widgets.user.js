// ==UserScript==
// @name         Pogdesign-Widgets
// @namespace    https://github.com/fabiencrassat
// @version      1.0.3
// @description  Add links relative to the episode
// @author       You
// @match        https://www.pogdesign.co.uk/cat/
// @include      /^https:\/\/www\.pogdesign\.co\.uk\/cat\/\d{1,}-\d{4}/
// @include      /^https:\/\/www\.pogdesign\.co\.uk\/cat\/\w+(-*\w+)*\/Season-\d+\/Episode-\d+/
// @include      /^https:\/\/www\.pogdesign\.co\.uk\/cat\/\w+(-*\w+)*-summary/
// @grant        none
// @run-at       document-start
// ==/UserScript==

/*global $, alert */
/*global fabiencrassat */
"use strict";

var main = function() {

    var show = {
        title: "",
        season: "",
        episode: "",
        seasonAndEpisode: "",
        getTitle() { return this.title; },
        setTitle(title) { this.title = title; },
        getSeason() { return this.season; },
        setSeason(season) {
            if (season.length < 2) { season = "0" + season; }
            this.season = season;
        },
        getEpisode() { return this.episode; },
        setEpisode(episode) {
            if (episode.length < 2) { episode = "0" + episode; }
            this.episode = episode;
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
                alert("Exception in setSeasonAndEpisode");
            }
        },

        getSearch() {
            return this.getTitle().replace(/ /gm, ".") + "." + this.getSeasonAndEpisode();
        },
    };

    var externalLinks = {
        links: [
            {site: "google",
                icon: "",
                url(show) { return "https://www.google.fr/search?q=" + show.getSearch() + "+vostfr+streaming"; },
            },
            {site: "binsearch",
                icon: "",
                url(show) { return "https://binsearch.info/?q=" + show.getSearch(); },
            },
            {site: "subscene",
                icon: "",
                url(show) { return "https://subscene.com/subtitles/release?q=" + show.getSearch(); },
            },
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
        createPopup(show, element, cssClass, cssDisplay) {
            var popup = "";
            popup = "<div id='fcr-external-links-element' style='position: absolute; width: 350px; z-index: 97; display: " + cssDisplay + ";' class='cluetip ui-widget ui-widget-content ui-cluetip clue-right-default cluetip-default " + cssClass + "'>";
            popup += "<div class='cluetip-inner ui-widget-content ui-cluetip-content'>";
            popup += "<div id='pop'>";
            popup += "<div id='popheader'><a class='fcr-closePopup' href='javascript:fabiencrassat.pogdesignWidget.clearLinksElement();'>X</a>";
            popup += "<span>" + show.getTitle() + " " + show.getSeasonAndEpisode() + "</span>";
            popup += "</div>";
            popup += "<div id='poptext'>" + this.getLinks(show) + "</div>";
            popup += "<div id='popfooter'>" + show.getSearch() + "</div>";
            popup += "</div></div></div>";
            return(popup);
        },
    };

    var page = {
        shared: {
            linkImage: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAZdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjAuMTM0A1t6AAAA20lEQVQoU33RuQrCQBDG8YgHeIIHinhgZyNWgg8iCoqIpW/jg5nG0oew8b7j/wsZCSkM/Nbs7MzuuHE8z/snhlxIyhbaGEb0MMAb9myUvMAJR1xwxQEvJLCCPVsVKKGOMqqBAipIw8UTOskv0E55WHtGyRsocYYlXC3cUEQ0WTsrWS1bPKNBx9VCQSXv8MEEHZTgr2t4oGkBdKFLGAdz/cd58O4XnBFtKRN6V8tTm2tQS7pvSwjTh9tjZDENfehY7XSHbk2/immzNVT4K5A4smghGcwb0DexHHjOFwrY3c0uEFwZAAAAAElFTkSuQmCC",

            stylesheets() {
                var result = "";
                result += "a.fcr-closePopup {" +
                    "float: right;" +
                    "color: #66bbff !important;" +
                "}";
                return(result);
            },
            insertStylesheets(stylesheets) {
                var style = document.createElement("style");
                style.appendChild(document.createTextNode(stylesheets));
                (document.body || document.head || document.documentElement).appendChild(style);
            },
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
                result += ".fcr-externalLink-calendar-page {" +
                    "height: 12px;" +
                    "width: 12px;" +
                    "background-image: url('" + page.shared.linkImage + "');" +
                "}";
                result += ".ep.infochecked .fcr-externalLink-calendar-page {" +
                    "filter: contrast(0);" +
                "}";
                result += page.shared.stylesheets();
                return(result);
            },
            insertStylesheets() {
                page.shared.insertStylesheets(page.calendar.stylesheets());
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
        },
        summary: {
            stylesheets() {
                var result = "";
                result += "span.fcr-episodeContainer {" +
                    "display: flex;" +
                "}";
                result += ".fcr-externalLink-summary-page {" +
                    "height: 12px !important;" +
                    "width: 12px !important;" +
                    "filter: contrast(0);" +
                    "margin: 9px -12px 9px 54px;" +
                    "background-image: url('" + page.shared.linkImage + "');" +
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
                result += page.shared.stylesheets();
                return(result);
            },
            insertStylesheets() {
                page.shared.insertStylesheets(page.summary.stylesheets());
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
                var popup = externalLinks.createPopup(show, element, "fcr-external-links-popup", "block");
                element.parent().parent().parent().after(popup);
            },
        },
        episode: {
            stylesheets() {
                var result = "";
                result += page.summary.stylesheets();
                return(result);
            },
            insertStylesheets() {
                page.shared.insertStylesheets(page.episode.stylesheets());
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
        },
    };

    function clearLinksElement() {
        var element = $("#fcr-external-links-element");
        if(element) { element.remove(); }
    }

    function externalLinksPopupOnCalendarPage(element) {
        clearLinksElement();
        page.calendar.extractShow(show, element);
        page.calendar.displayExternalLinksPopup(show, element);
    }

    function externalLinksPopupOnEpisodePage(element) {
        clearLinksElement();
        page.episode.extractShow(show);
        page.episode.displayExternalLinksPopup(show, element);
    }

    function externalLinksPopupOnSummaryPage(element) {
        clearLinksElement();
        page.summary.extractShow(show, element);
        page.summary.displayExternalLinksPopup(show, element);
    }

    return {
        calendar: {
            externalLinksPopup: externalLinksPopupOnCalendarPage,
            stylesheets: page.calendar.insertStylesheets,
        },
        episode: {
            externalLinksPopup: externalLinksPopupOnEpisodePage,
            stylesheets: page.episode.insertStylesheets,
        },
        summary: {
            externalLinksPopup: externalLinksPopupOnSummaryPage,
            stylesheets: page.summary.insertStylesheets,
        },
        clearLinksElement,
    };
};

var script = document.createElement("script");
script.appendChild(document.createTextNode("var fabiencrassat = fabiencrassat || {}; fabiencrassat.pogdesignWidget = ("+ main +")();"));
(document.body || document.head || document.documentElement).appendChild(script);

window.addEventListener("load", function() {
    // Add search episode links for calendar pages
    if ($("#month_box p > :last-child").length > 0) {
        fabiencrassat.pogdesignWidget.calendar.stylesheets();

        $("#month_box p > :last-child").wrap("<span class='fcr-episodeContainer'></span>");
        $("span.fcr-episodeContainer > :last-child").after("<a href='javascript:void(0)' class='fcr-externalLink-calendar-page'></a>");
        $(".fcr-externalLink-calendar-page").on("click", function(event) {
            event.preventDefault();
            fabiencrassat.pogdesignWidget.calendar.externalLinksPopup($(this));
        });
    }
    // Add search episode links for episode page
    else if ($("h3.sdfsdf").length === 1) {
        fabiencrassat.pogdesignWidget.episode.stylesheets();

        $("<span> <a href='javascript:void(0)' class='fcr-externalLink-episode-page'>&lt;Links&gt;</a></span>").appendTo("h3.sdfsdf");
        $(".fcr-externalLink-episode-page").on("click", function(event) {
            event.preventDefault();
            fabiencrassat.pogdesignWidget.episode.externalLinksPopup($(this));
        });
    }
    // Add search episode links for summary page
    else if ($("li.ep.info").length > 0) {
        fabiencrassat.pogdesignWidget.summary.stylesheets();

        $("li.ep > strong > a, li.ep > strong > a").wrap("<span class='fcr-episodeContainer'></span>");
        $("<a href='javascript:void(0)' class='fcr-externalLink-summary-page'></a>").appendTo("span.fcr-episodeContainer");
        $(".fcr-externalLink-summary-page").on("click", function(event) {
            event.preventDefault();
            fabiencrassat.pogdesignWidget.summary.externalLinksPopup($(this));
        });
    }
    // no page found
}, false);
