// ==UserScript==
// @name         Pogdesign-Widgets
// @namespace    https://github.com/fabiencrassat
// @version      1.0.11
// @description  Add links relative to the episode
// @author       Fabien Crassat <fabien@crassat.com>
// @match        https://www.pogdesign.co.uk/cat/
// @match        http://www.pogdesign.co.uk/cat/
// @include      /^https:\/\/www\.pogdesign\.co\.uk\/cat\/\d{1,}-\d{4}/
// @include      /^https:\/\/www\.pogdesign\.co\.uk\/cat\/\w+(-*\w+)*\/Season-\d+\/Episode-\d+/
// @include      /^https:\/\/www\.pogdesign\.co\.uk\/cat\/\w+(-*\w+)*-summary/
// @grant        none
// @run-at       document-start
// ==/UserScript==

/*global $ */
/*global fabiencrassat */
"use strict";

function checkProtocol() {
    if (location.protocol === "http:") {
        window.location.replace("https:" + window.location.href.substring(5));
    }
}
checkProtocol();

var tools = function() {

    function addZeroToOneNumber(number) {
        if (number.length < 2) { number = "0" + number; }
        return number;
    }
    function getPixelStyle(key, value) {
        if (key && value) {
            return " " + key + ": " + value + "px;";
        }
        return "";
    }

    return {
        addZeroToOneNumber,
        getPixelStyle
    };
};

var model = function() {

    var show = {
        title: "",
        season: "",
        episode: "",
        seasonAndEpisode: "",
        getTitle() { return show.title; },
        setTitle(title) { show.title = title; },
        getSeason() { return show.season; },
        setSeason(season) {
            show.season = fabiencrassat.tools.addZeroToOneNumber(season);
        },
        getEpisode() { return show.episode; },
        setEpisode(episode) {
            show.episode = fabiencrassat.tools.addZeroToOneNumber(episode);
        },
        getSeasonAndEpisode() { return show.seasonAndEpisode; },
        setSeasonAndEpisode() {
            if (arguments.length === 1) {
                show.seasonAndEpisode = arguments[0];
            }
            else if (arguments.length === 2) {
                show.setSeason(arguments[0]);
                show.setEpisode(arguments[1]);
                show.seasonAndEpisode = "S" + show.getSeason() + "E" + show.getEpisode();
            }
            else {
                throw new RangeError("Exception in setSeasonAndEpisode");
            }
        },

        getSearch() {
            return show.getTitle().replace(/ /gm, ".") + "." + show.getSeasonAndEpisode();
        }
    };

    return {
        show: {
            getSearch: show.getSearch,
            getTitle: show.getTitle,
            setTitle: show.setTitle,
            getSeasonAndEpisode: show.getSeasonAndEpisode,
            setSeasonAndEpisode: show.setSeasonAndEpisode
        }
    };
};

var view = function() {
    var popup = {
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
                links += "<a target='_blank' href='" + this.links[i].url() + "'>" + this.links[i].site + "</a><br>";
            }
            links += "</span>";
            return links;
        },

        popupId: "fcr-external-links-element",
        getContainer() {
            return $("#" + popup.popupId);
        },
        close() {
            var container = popup.getContainer();
            if(container) {
                container.remove();
            }
        },
        removeOnOutsideClickEvent() {
            $(document).mouseup(function (event) {
                var container = popup.getContainer();
                if (!container.is(event.target) &&          // if the target of the click isn't the container
                container.has(event.target).length === 0) { // nor a descendant of the container
                    container.remove();
                }
            });
        },
        create(element, cssClass, cssDisplay, top, left) {
            var result = `
            <div id='` + popup.popupId + `'
            style='position: absolute; width: 350px; z-index: 97; display: ` + cssDisplay + ";" + fabiencrassat.tools.getPixelStyle("top", top) + fabiencrassat.tools.getPixelStyle("left", left) + `'
            class='cluetip ui-widget ui-widget-content ui-cluetip clue-right-default cluetip-default ` + cssClass + `'>
              <div class='cluetip-inner ui-widget-content ui-cluetip-content'>
                <div id='pop'>
                  <div id='popheader'>
                    <a class='fcr-closePopup' href='javascript:fabiencrassat.view.externalLinks.close();'>X</a>
                    <span>` + fabiencrassat.model.show.getTitle() + " " + fabiencrassat.model.show.getSeasonAndEpisode() + `</span>
                  </div>
                  <div id='poptext'>` + popup.getLinks() + `</div>
                  <div id='popfooter'>` + fabiencrassat.model.show.getSearch() + `</div>
                </div>
              </div>
            </div>`;
            return(result);
        }
    };

    return {
        externalLinks : {
            removeOnOutsideClickEvent: popup.removeOnOutsideClickEvent,
            close: popup.close,
            create: popup.create
        }
    };
};

var main = function() {
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
            }
        },
        shared: {
            linkImage: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAZdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjAuMTM0A1t6AAAA20lEQVQoU33RuQrCQBDG8YgHeIIHinhgZyNWgg8iCoqIpW/jg5nG0oew8b7j/wsZCSkM/Nbs7MzuuHE8z/snhlxIyhbaGEb0MMAb9myUvMAJR1xwxQEvJLCCPVsVKKGOMqqBAipIw8UTOskv0E55WHtGyRsocYYlXC3cUEQ0WTsrWS1bPKNBx9VCQSXv8MEEHZTgr2t4oGkBdKFLGAdz/cd58O4XnBFtKRN6V8tTm2tQS7pvSwjTh9tjZDENfehY7XSHbk2/immzNVT4K5A4smghGcwb0DexHHjOFwrY3c0uEFwZAAAAAElFTkSuQmCC",
            stylesheets: `a.fcr-closePopup {
                    float: right;
                    color: #66bbff !important;
                }`,
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
                var result = `
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
                    background-image: url('` + page.shared.linkImage + `');
                }`;
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
                var popup = fabiencrassat.view.externalLinks.create(element, "fcr-calendar-page", "block");
                element.parent().parent().parent().after(popup);
            },
            getExternalLinksPopup(element) {
                fabiencrassat.view.externalLinks.close();
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
                fabiencrassat.view.externalLinks.removeOnOutsideClickEvent();
            }
        },
        summary: {
            stylesheets() {
                var result = `
                span.fcr-episodeContainer {
                    display: flex;
                }
                .fcr-externalLink-image {
                    height: 12px !important;
                    width: 12px !important;
                    filter: contrast(0);
                    margin: 9px -12px 9px 54px;
                    background-image: url('` + page.shared.linkImage + `');
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
                var popup = fabiencrassat.view.externalLinks.create(element, "fcr-external-links-popup", "block", top, left);
                $("body > div:last").after(popup);
            },
            getExternalLinksPopup(element) {
                fabiencrassat.view.externalLinks.close();
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
                fabiencrassat.view.externalLinks.removeOnOutsideClickEvent();
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
                var popup = fabiencrassat.view.externalLinks.create(element, "fcr-external-links-popup", "inline-flex");
                element.after(popup);
            },
            getExternalLinksPopup(element) {
                fabiencrassat.view.externalLinks.close();
                page.episode.extractShow();
                page.episode.displayExternalLinksPopup(element);
            },
            addExternalLink(element) {
                var container = $(element);
                if (container.length !== 1) { return; }
                page.controller.insertStylesheets(page.episode.stylesheets);

                $("<span> " + page.shared.externalTextLink() + "</span>").appendTo(element);

                page.controller.loadClickEventOnLinkElement(page.episode.getExternalLinksPopup);
                fabiencrassat.view.externalLinks.removeOnOutsideClickEvent();
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
        }
    };
};

var script = document.createElement("script");
script.appendChild(document.createTextNode("var fabiencrassat = fabiencrassat || {}; fabiencrassat.tools = ("+ tools +")();"));
script.appendChild(document.createTextNode("var fabiencrassat = fabiencrassat || {}; fabiencrassat.model = ("+ model +")();"));
script.appendChild(document.createTextNode("var fabiencrassat = fabiencrassat || {}; fabiencrassat.view = ("+ view +")();"));
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
