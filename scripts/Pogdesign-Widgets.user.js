// ==UserScript==
// @name         Pogdesign-Widgets
// @namespace    https://github.com/fabiencrassat
// @version      0.5
// @description  Add links relative to the episode
// @author       You
// @match        https://www.pogdesign.co.uk/cat/
// @include      /^https:\/\/www\.pogdesign\.co\.uk\/cat\/\d{1,}-\d{4}/
// @grant        none
// @run-at       document-start
// ==/UserScript==

/*global $ */
"use strict";

var main = function() {

    var show = {
        title: "",
        getTitle: function() { return this.title; },
        setTitle: function(title) { this.title = title; },
        seasonAndEpisode: "",
        getSeasonAndEpisode: function() { return this.seasonAndEpisode; },
        setSeasonAndEpisode: function(seasonAndEpisode) { this.seasonAndEpisode = seasonAndEpisode; },

        extractShow: function(element) {
            this.extractTitle(element);
            this.extractSeasonAndEpisode(element);
        },
        extractTitle: function(element) {
            var title = $.trim(element.parent().prev().text());
            this.setTitle(title);
        },
        extractSeasonAndEpisode: function(element) {
            var seasonAndEpisode = element.prev().text();
            this.setSeasonAndEpisode(seasonAndEpisode);
        },

        getSearch: function() {
            return this.getTitle().replace(/ /gm, ".") + "." + this.getSeasonAndEpisode();
        }
    };

    var externalLinks = {
        links: [
            {site: "google",
                icon: "",
                url: function(show) { return "https://www.google.fr/search?q=" + show.getSearch() + "+vostfr+streaming"; },
            },
            {site: "binsearch",
                icon: "",
                url: function(show) { return "https://binsearch.info/?q=" + show.getSearch(); },
            },
            {site: "subscene",
                icon: "",
                url: function(show) { return "https://subscene.com/subtitles/release?q=" + show.getSearch(); },
            },
        ],
        getLinks: function(show) {
            var links = "<span>";
            for (var i = 0; i < externalLinks.links.length; i++) {
                links += "<a target='_blank' href='" + externalLinks.links[i].url(show) + "'>";
                links += externalLinks.links[i].site;
                links += "</a><br>";
            }
            links += "</span>";
            return links;
        },
    };

    function DisplayExternalLinkPopup(show, element) {
        var popup = "";
        popup = "<div id='fcr-externalLinkPopup' style='position: absolute; width: 350px; z-index: 97; display: block;' class='cluetip ui-widget ui-widget-content ui-cluetip clue-right-default cluetip-default'>";
        popup += "<div class='cluetip-inner ui-widget-content ui-cluetip-content'>";
        popup += "<div id='pop'>";
        popup += "<div id='popheader'><a class='fcr-closePopup' href='javascript:fabiencrassat.pogdesignWidget.closeExternalLinkPopup();'>X</a>";
        popup += "<span>" + show.getTitle() + "<br>" + show.getSeasonAndEpisode() + "</span>";
        popup += "</div>";
        popup += "<div id='poptext'>" + externalLinks.getLinks(show) + "</div>";
        popup += "<div id='popfooter'>" + show.getSearch() + "</div>";
        popup += "</div></div></div>";

        element.parent().parent().parent().after(popup);
    }

    function ClearOtherPopup() {
        var popup = $("#fcr-externalLinkPopup");
        if(popup) popup.remove();
    }

    function externalLinkPopup(element) {
        ClearOtherPopup();
        show.extractShow(element);
        DisplayExternalLinkPopup(show, element);
    }

    return {
        externalLinkPopup: externalLinkPopup,
        closeExternalLinkPopup: ClearOtherPopup,
    };
};

var script = document.createElement('script');
script.appendChild(document.createTextNode('var fabiencrassat = fabiencrassat || {}; fabiencrassat.pogdesignWidget = ('+ main +')();'));
(document.body || document.head || document.documentElement).appendChild(script);

var stylesheets = "";
stylesheets += "span.fcr-episodeContainer > :last-child {float: right; margin: 0 !important;}";
stylesheets += "span.fcr-episodeContainer > :first-child {float: left;}";
stylesheets += ".fcr-externalLink {height: 12px; width: 12px; background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAZdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjAuMTM0A1t6AAAA20lEQVQoU33RuQrCQBDG8YgHeIIHinhgZyNWgg8iCoqIpW/jg5nG0oew8b7j/wsZCSkM/Nbs7MzuuHE8z/snhlxIyhbaGEb0MMAb9myUvMAJR1xwxQEvJLCCPVsVKKGOMqqBAipIw8UTOskv0E55WHtGyRsocYYlXC3cUEQ0WTsrWS1bPKNBx9VCQSXv8MEEHZTgr2t4oGkBdKFLGAdz/cd58O4XnBFtKRN6V8tTm2tQS7pvSwjTh9tjZDENfehY7XSHbk2/immzNVT4K5A4smghGcwb0DexHHjOFwrY3c0uEFwZAAAAAElFTkSuQmCC')}";
stylesheets += ".ep.infochecked .fcr-externalLink {filter: contrast(0)}";
stylesheets += "a.fcr-closePopup {float: right; color: #66bbff !important}";
var style = document.createElement("style");
style.appendChild(document.createTextNode(stylesheets));
(document.body || document.head || document.documentElement).appendChild(style);

window.addEventListener('load', function() {
    // Add link to the search episode
    $("#month_box p > :last-child").wrap("<span class='fcr-episodeContainer'></span>");
    $("span.fcr-episodeContainer > :last-child").after("<a href='javascript:void(0)' class='fcr-externalLink'></a>");
    $(".fcr-externalLink").on("click", function(event) {
        event.preventDefault();
        fabiencrassat.pogdesignWidget.externalLinkPopup($(this));
    });
}, false);
