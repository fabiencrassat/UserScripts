// ==UserScript==
// @name         Pogdesign-Widgets
// @namespace    https://github.com/fabiencrassat
// @version      1.0.6
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

var tools = function() {

    function addZeroToOneNumber(number) {
        if (number.length < 2) { number = "0" + number; }
        return number;
    }

    return {
        addZeroToOneNumber
    };
};

var model = function() {

    var show = {
        title: "",
        season: "",
        episode: "",
        seasonAndEpisode: "",
        getTitle() { return this.title; },
        setTitle(title) { this.title = title; },
        getSeason() { return this.season; },
        setSeason(season) {
            this.season = fabiencrassat.tools.addZeroToOneNumber(season);
        },
        getEpisode() { return this.episode; },
        setEpisode(episode) {
            this.episode = fabiencrassat.tools.addZeroToOneNumber(episode);
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

    return {
        show
    };
};

var main = function() {

    var externalLinks = {
        links: [
            {site: "google",
                icon: "",
                url() { return "https://www.google.fr/search?q=" + fabiencrassat.model.show.getSearch() + "+vostfr+streaming"; }
            },
            {site: "binsearch",
                icon: "",
                url() { return "https://binsearch.info/?q=" + fabiencrassat.model.show.getSearch(); }
            },
            {site: "subscene",
                icon: "",
                url() { return "https://subscene.com/subtitles/release?q=" + fabiencrassat.model.show.getSearch(); }
            }
        ],
        getLinks() {
            var links = "<span>";
            for (var i = 0; i < this.links.length; i++) {
                links += "<a target='_blank' href='" + this.links[i].url() + "'>";
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
        createPopup(element, cssClass, cssDisplay, top, left) {
            var popup = "";
            popup = "<div id='" + this.popupId + "' style='position: absolute; width: 350px; z-index: 97; display: " + cssDisplay + ";" + this.getPixelStyle("top", top) + this.getPixelStyle("left", left) + "' class='cluetip ui-widget ui-widget-content ui-cluetip clue-right-default cluetip-default " + cssClass + "'>";
            popup += "<div class='cluetip-inner ui-widget-content ui-cluetip-content'>";
            popup += "<div id='pop'>";
            popup += "<div id='popheader'><a class='fcr-closePopup' href='javascript:fabiencrassat.pogdesignWidget.clearLinksElement();'>X</a>";
            popup += "<span>" + fabiencrassat.model.show.getTitle() + " " + fabiencrassat.model.show.getSeasonAndEpisode() + "</span>";
            popup += "</div>";
            popup += "<div id='poptext'>" + this.getLinks() + "</div>";
            popup += "<div id='popfooter'>" + fabiencrassat.model.show.getSearch() + "</div>";
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
                $("." + page.shared.externalLinksLinkClass).on("click", function(event) {
                    event.preventDefault();
                    getExternalLinksPopup($(this));
                });
            },
            removePopup() {
                $(document).mouseup(function (event) {
                    var container = externalLinks.getPopupContainer();
                    if (!container.is(event.target) &&          // if the target of the click isn't the container
                    container.has(event.target).length === 0) { // nor a descendant of the container
                        externalLinks.removePopup(container);
                    }
                });
            },
            clearLinksElement() {
                var container = externalLinks.getPopupContainer();
                if(container) {
                    externalLinks.removePopup(container);
                }
            }
        },
        shared: {
            linkImage: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAZdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjAuMTM0A1t6AAAA20lEQVQoU33RuQrCQBDG8YgHeIIHinhgZyNWgg8iCoqIpW/jg5nG0oew8b7j/wsZCSkM/Nbs7MzuuHE8z/snhlxIyhbaGEb0MMAb9myUvMAJR1xwxQEvJLCCPVsVKKGOMqqBAipIw8UTOskv0E55WHtGyRsocYYlXC3cUEQ0WTsrWS1bPKNBx9VCQSXv8MEEHZTgr2t4oGkBdKFLGAdz/cd58O4XnBFtKRN6V8tTm2tQS7pvSwjTh9tjZDENfehY7XSHbk2/immzNVT4K5A4smghGcwb0DexHHjOFwrY3c0uEFwZAAAAAElFTkSuQmCC",
            stylesheets: "a.fcr-closePopup {" +
                    "float: right;" +
                    "color: #66bbff !important;" +
                "}",
            externalLinksLinkClass: "fcr-externalLinksLink",
            externalLink(classText, linkText) {
                return "<a href='javascript:void(0)' class='" + page.shared.externalLinksLinkClass + " " + classText + "'>" +
                        linkText +
                    "</a>";
            },
            externalImageLink() {
                return page.shared.externalLink("fcr-externalLink-image", "");
            },
            externalTextLink() {
                return page.shared.externalLink("", "&lt;Links&gt;");
            }
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
            extractShow(element) {
                this.extractTitle(element);
                this.extractSeasonAndEpisode(element);
            },
            extractTitle(element) {
                var title = $.trim(element.parent().prev().text());
                fabiencrassat.model.show.setTitle(title);
            },
            extractSeasonAndEpisode(element) {
                var seasonAndEpisode = element.prev().text();
                fabiencrassat.model.show.setSeasonAndEpisode(seasonAndEpisode);
            },
            displayExternalLinksPopup(element) {
                var popup = externalLinks.createPopup(element, "fcr-calendar-page", "block");
                element.parent().parent().parent().after(popup);
            },
            getExternalLinksPopup(element) {
                page.controller.clearLinksElement();
                page.calendar.extractShow(element);
                page.calendar.displayExternalLinksPopup(element);
            },
            addExternalLink(element) {
                var container = $(element);
                if (container.length === 0) { return; }
                page.controller.insertStylesheets(page.calendar.stylesheets);

                container.wrap("<span class='fcr-episodeContainer'></span>");
                $("span.fcr-episodeContainer > :last-child").after(page.shared.externalImageLink());

                page.controller.loadClickEventOnLinkElement(page.calendar.getExternalLinksPopup);
                page.controller.removePopup();
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
            extractShow(element) {
                this.extractTitle();
                this.extractSeasonAndEpisode(element);
            },
            extractTitle() {
                var title = $.trim($("h2.sumhead > a").text());
                fabiencrassat.model.show.setTitle(title);
            },
            extractSeasonAndEpisode(element) {
                var season = element.parent().parent().parent().find("[itemprop=seasonNumber]").text();
                var episode = element.parent().parent().parent().find("[itemprop=episodeNumber]").text();
                fabiencrassat.model.show.setSeasonAndEpisode(season, episode);
            },
            displayExternalLinksPopup(element) {
                var top = element.offset().top + 20;
                var left = element.offset().left - 200;
                var popup = externalLinks.createPopup(element, "fcr-external-links-popup", "block", top, left);
                $("body > div:last").after(popup);
            },
            getExternalLinksPopup(element) {
                page.controller.clearLinksElement();
                page.summary.extractShow(element);
                page.summary.displayExternalLinksPopup(element);
            },
            addExternalLink(element) {
                var container = $(element);
                if (container.length === 0) { return; }
                page.controller.insertStylesheets(page.summary.stylesheets);

                container.wrap("<span class='fcr-episodeContainer'></span>");
                $(page.shared.externalImageLink()).appendTo("span.fcr-episodeContainer");

                page.controller.loadClickEventOnLinkElement(page.summary.getExternalLinksPopup);
                page.controller.removePopup();
            }
        },
        episode: {
            stylesheets() {
                var result = "";
                result += page.summary.stylesheets();
                return(result);
            },
            extractShow() {
                this.extractTitle();
                this.extractSeasonAndEpisode();
            },
            extractTitle() {
                var title = $("h3.sumunderhead").text();
                fabiencrassat.model.show.setTitle(title);
            },
            extractSeasonAndEpisode() {
                var seasonAndEpisode = $("h3.sdfsdf").children().first().text();
                fabiencrassat.model.show.setSeasonAndEpisode(seasonAndEpisode);
            },
            displayExternalLinksPopup(element) {
                var popup = externalLinks.createPopup(element, "fcr-external-links-popup", "inline-flex");
                element.after(popup);
            },
            getExternalLinksPopup(element) {
                page.controller.clearLinksElement();
                page.episode.extractShow();
                page.episode.displayExternalLinksPopup(element);
            },
            addExternalLink(element) {
                var container = $(element);
                if (container.length !== 1) { return; }
                page.controller.insertStylesheets(page.episode.stylesheets);

                $("<span> " + page.shared.externalTextLink() + "</span>").appendTo(element);

                page.controller.loadClickEventOnLinkElement(page.episode.getExternalLinksPopup);
                page.controller.removePopup();
            }
        }
    };

    return {
        calendar: {
            addExternalLink: page.calendar.addExternalLink
        },
        summary: {
            addExternalLink: page.summary.addExternalLink
        },
        episode: {
            addExternalLink: page.episode.addExternalLink
        },
        clearLinksElement: page.controller.clearLinksElement
    };
};

var script = document.createElement("script");
script.appendChild(document.createTextNode("var fabiencrassat = fabiencrassat || {}; fabiencrassat.tools = ("+ tools +")();"));
script.appendChild(document.createTextNode("var fabiencrassat = fabiencrassat || {}; fabiencrassat.model = ("+ model +")();"));
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
