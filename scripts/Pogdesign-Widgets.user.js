  // ==UserScript==
  // @name         Pogdesign-Widgets
  // @namespace    https://github.com/fabiencrassat
  // @version      1.1.0
  // @description  Add links relative to the episode
  // @author       Fabien Crassat <fabien@crassat.com>
  // @match        https://www.pogdesign.co.uk/cat/
  // @match        http://www.pogdesign.co.uk/cat/
  // @include      /^https:\/\/www\.pogdesign\.co\.uk\/cat\/\d{1,}-\d{4}/
  // @include      /^https:\/\/www\.pogdesign\.co\.uk\/cat\/day\/\d{1,}-\d{1,}-\d{4}/
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
                  show.setSeason(arguments[0].replace(regex, '$1'));
                  show.setEpisode(arguments[0].replace(regex, '$2'));
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
                  if (!isInLocationPage) { return false; }
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
          },
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
                      background-image: url('` + page.shared.linkImage + `');
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
                  return page.controller.isInLocationPage(/^https:\/\/www\.pogdesign\.co\.uk\/cat\/($|\d{1,}-\d{4})/g);
              },
              insertExternalLink(element) {
                  $(element).wrap("<span class='fcr-episodeContainer'></span>");
                  $("span.fcr-episodeContainer > :last-child").after(page.shared.externalImageLink());
              }
          },
          day: {
              stylesheets() {
                  return `
                  span.fcr-episodeContainer {
                      padding-top: 24px !important;
                      padding-left: 30px !important;
                      float: left !important;
                  }
                  .fcr-externalLink-image {
                      height: 12px;
                      width: 12px;
                      padding: 0 !important;
                      background-image: url('` + page.shared.linkImage + `');
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
                      season: seasonAndEpisode.replace(regex, '$1'),
                      episode: seasonAndEpisode.replace(regex, '$2')
                  };
              },
              displayExternalLinksPopup(element) {
                  page.summary.displayExternalLinksPopup(element);
              },
              isInLocationPage() {
                  /* The regex is the same than the @include in the header */
                  return page.controller.isInLocationPage(/^https:\/\/www\.pogdesign\.co\.uk\/cat\/day\/\d{1,}-\d{1,}-\d{4}/g);
              },
              insertExternalLink(element) {
                  $("<span class='fcr-episodeContainer'></span>").insertAfter(element);
                  $(page.shared.externalImageLink()).appendTo("span.fcr-episodeContainer");
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
              },
              extractTitle() {
                  return $("h2.sumhead > a").text();
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
                  return page.controller.isInLocationPage(/^https:\/\/www\.pogdesign\.co\.uk\/cat\/\w+(-*\w+)*-summary/g);
              },
              insertExternalLink(element) {
                  $(element).wrap("<span class='fcr-episodeContainer'></span>");
                  $(page.shared.externalImageLink()).appendTo("span.fcr-episodeContainer");
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
                  return page.controller.isInLocationPage(/^https:\/\/www\.pogdesign\.co\.uk\/cat\/\w+(-*\w+)*\/Season-\d+\/Episode-\d+/g);
              },
              insertExternalLink(element) {
                  $("<span> " + page.shared.externalTextLink() + "</span>").appendTo(element);
              }
          }
      };

      return {
          addExternalLink: page.controller.addExternalLink,
          calendar: page.calendar,
          day: page.day,
          summary: page.summary,
          episode: page.episode
      };
  };

  var script = document.createElement("script");
  script.appendChild(document.createTextNode("var fabiencrassat = fabiencrassat || {}; fabiencrassat.tools = ("+ tools +")();"));
  script.appendChild(document.createTextNode("var fabiencrassat = fabiencrassat || {}; fabiencrassat.model = ("+ model +")();"));
  script.appendChild(document.createTextNode("var fabiencrassat = fabiencrassat || {}; fabiencrassat.view = ("+ view +")();"));
  script.appendChild(document.createTextNode("var fabiencrassat = fabiencrassat || {}; fabiencrassat.main = ("+ main +")();"));
  (document.body || document.head || document.documentElement).appendChild(script);

  window.addEventListener("load", function() {
      // Add search episode links for calendar pages
      fabiencrassat.main.addExternalLink(fabiencrassat.main.calendar, "#month_box p > :last-child");
      // Add search episode links for day pages
      fabiencrassat.main.addExternalLink(fabiencrassat.main.day, ".overbox > h4 > a");
      // Add search episode links for summary page
      fabiencrassat.main.addExternalLink(fabiencrassat.main.summary, "li.ep > strong > a");
      // Add search episode links for episode page
      fabiencrassat.main.addExternalLink(fabiencrassat.main.episode, "h3.sdfsdf");
      // no page found
  }, false);
