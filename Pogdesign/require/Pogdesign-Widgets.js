// @name         Pogdesign-Widgets.require
// @namespace    https://github.com/fabiencrassat
// @version      1.0.0
// @description  Add the core object for the Pogdesign-Widgets.user.js
// @author       Fabien Crassat <fabien@crassat.com>

/*global $, fabiencrassat */
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
    var tools = fabiencrassat.tools;

    var show = {
        title: "",
        season: "",
        episode: "",
        getTitle() { return show.title; },
        setTitle(title) { show.title = title; },
        getSeason() { return show.season; },
        setSeason(season) {
            show.season = tools.addZeroToOneNumber(season);
        },
        getEpisode() { return show.episode; },
        setEpisode(episode) {
            show.episode = tools.addZeroToOneNumber(episode);
        },
        getSeasonAndEpisode() { return "S" + show.getSeason() + "E" + show.getEpisode(); },
        setSeasonAndEpisode() {
            if (arguments.length === 1) {
                var regex = /^s(\d{1,})e(\d{1,})/gi;
                show.setSeason(arguments[0].replace(regex, "$1"));
                show.setEpisode(arguments[0].replace(regex, "$2"));
                return;
            }
            if (arguments.length === 2) {
                show.setSeason(arguments[0]);
                show.setEpisode(arguments[1]);
                return;
            }
            throw new RangeError("Exception in setSeasonAndEpisode");
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
    var tools = fabiencrassat.tools;
    var show = fabiencrassat.model.show;

    var popup = {
        links: [
            {site: "google",
                icon: "",
                url() { return "https://www.google.fr/search?q=" + show.getSearch() + "+vostfr+streaming"; }
            },
            {site: "binsearch",
                icon: "",
                url() { return "https://binsearch.info/?q=" + show.getSearch(); }
            },
            {site: "subscene",
                icon: "",
                url() { return "https://subscene.com/subtitles/release?q=" + show.getSearch(); }
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
            style='position: absolute; width: 350px; z-index: 97; display: ` + cssDisplay + ";" + tools.getPixelStyle("top", top) + tools.getPixelStyle("left", left) + `'
            class='cluetip ui-widget ui-widget-content ui-cluetip clue-right-default cluetip-default ` + cssClass + `'>
              <div class='cluetip-inner ui-widget-content ui-cluetip-content'>
                <div id='pop'>
                  <div id='popheader'>
                    <a class='fcr-closePopup' href='javascript:fabiencrassat.view.externalLinks.close();'>X</a>
                    <span>` + show.getTitle() + " " + show.getSeasonAndEpisode() + `</span>
                  </div>
                  <div id='poptext'>` + popup.getLinks() + `</div>
                  <div id='popfooter'>` + show.getSearch() + `</div>
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
    var externalLinks = fabiencrassat.view.externalLinks;
    var show = fabiencrassat.model.show;

    var page = {
        controller: {
            insertStylesheets(stylesheets) {
                var style = document.createElement("style");
                style.appendChild(document.createTextNode(stylesheets));
                (document.body || document.head || document.documentElement).appendChild(style);
            },
            extractTitle(pageElement, element) {
                var title = $.trim(pageElement.extractTitle(element));
                show.setTitle(title);
            },
            extractSeasonAndEpisode(pageElement, element) {
                var seasonAndEpisode = pageElement.extractSeasonAndEpisode(element);
                if (typeof seasonAndEpisode === "string") {
                    show.setSeasonAndEpisode(seasonAndEpisode);
                    return;
                }
                show.setSeasonAndEpisode(seasonAndEpisode.season, seasonAndEpisode.episode);
            },
            extractShow(pageElement, element) {
                page.controller.extractTitle(pageElement, element);
                page.controller.extractSeasonAndEpisode(pageElement, element);
            },
            getExternalLinksPopup(pageElement, element) {
                page.controller.extractShow(pageElement, element);
                pageElement.displayExternalLinksPopup(element);
            },
            loadClickEventOnLinkElement(pageElement) {
                $("." + page.shared.externalLinksLinkClass).on("click", function(event) {
                    event.preventDefault();
                    externalLinks.close();
                    page.controller.getExternalLinksPopup(pageElement, $(this));
                });
                externalLinks.removeOnOutsideClickEvent();
            },
            isInLocationPage(regex) {
              return regex.test(window.location.href);
            },
            canAddExternalLink(isInLocationPage, element) {
                if (!isInLocationPage()) { return false; }
                if ($(element).length === 0) { return false; }
                return true;
            },
            addExternalLink(pageElement, element) {
                if (!page.controller.canAddExternalLink(pageElement.isInLocationPage, element)) { return; }
                page.controller.insertStylesheets(page.shared.stylesheets(pageElement));
                pageElement.insertExternalLink(element);
                page.controller.loadClickEventOnLinkElement(pageElement);
            }
        },
        shared: {
            linkImage: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAZdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjAuMTM0A1t6AAAA20lEQVQoU33RuQrCQBDG8YgHeIIHinhgZyNWgg8iCoqIpW/jg5nG0oew8b7j/wsZCSkM/Nbs7MzuuHE8z/snhlxIyhbaGEb0MMAb9myUvMAJR1xwxQEvJLCCPVsVKKGOMqqBAipIw8UTOskv0E55WHtGyRsocYYlXC3cUEQ0WTsrWS1bPKNBx9VCQSXv8MEEHZTgr2t4oGkBdKFLGAdz/cd58O4XnBFtKRN6V8tTm2tQS7pvSwjTh9tjZDENfehY7XSHbk2/immzNVT4K5A4smghGcwb0DexHHjOFwrY3c0uEFwZAAAAAElFTkSuQmCC",
            stylesheets(pageElement) {
                return `a.fcr-closePopup {
                    float: right;
                    color: #66bbff !important;
                }` + pageElement.stylesheets();
            },
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
        }
    };

    return {
        controller: {
            isInLocationPage: page.controller.isInLocationPage,
            addExternalLink: page.controller.addExternalLink
        },
        shared: {
          linkImage: page.shared.linkImage,
          externalImageLink: page.shared.externalImageLink,
          externalTextLink: page.shared.externalTextLink
        }
    };
};

var script = document.createElement("script");
script.appendChild(document.createTextNode("var fabiencrassat = fabiencrassat || {}; fabiencrassat.tools = ("+ tools +")();"));
script.appendChild(document.createTextNode("var fabiencrassat = fabiencrassat || {}; fabiencrassat.model = ("+ model +")();"));
script.appendChild(document.createTextNode("var fabiencrassat = fabiencrassat || {}; fabiencrassat.view = ("+ view +")();"));
script.appendChild(document.createTextNode("var fabiencrassat = fabiencrassat || {}; fabiencrassat.main = ("+ main +")();"));
(document.body || document.head || document.documentElement).appendChild(script);

