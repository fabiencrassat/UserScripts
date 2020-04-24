/* eslint-disable max-lines */
// @name         Pogdesign-Widgets.require
// @namespace    https://github.com/fabiencrassat
// @version      1.0.6
// @description  Add the core object for the Pogdesign-Widgets.user.js
// @author       Fabien Crassat <fabien@crassat.com>

/* global $, fabiencrassat */
'use strict';

const checkProtocol = function checkProtocol() {
  const http = 'http:';
  const httpLenght = http.length;
  const https = 'https:';
  if (location.protocol === http) {
    window.location.replace(https + window.location.href.substring(httpLenght));
  }
};
checkProtocol();

const mainTools = function mainTools() {
  const addZeroToOneNumber = function addZeroToOneNumber(number) {
    const maxNumberLenght = 2;
    if (number.length < maxNumberLenght) {
      return `0${number}`;
    }
    return number;
  };
  const getPixelStyle = function getPixelStyle(key, value) {
    if (key && value) {
      return ` ${key}: ${value}px;`;
    }
    return '';
  };
  const encodeURL = function encodeURL(urlToEncode) {
    return encodeURIComponent(urlToEncode).replace(/'/gu, '%27');
  };

  return {
    addZeroToOneNumber,
    encodeURL,
    getPixelStyle
  };
};

// eslint-disable-next-line max-lines-per-function
const model = function model() {
  const tools = fabiencrassat.mainTools;

  const show = {
    episode: '',
    getEpisode() {
      return show.episode;
    },
    getSearch() {
      // eslint-disable-next-line max-len
      return `${show.getTitle().replace(/ /gmu, '.')}.${show.getSeasonAndEpisode()}`;
    },
    getSeason() {
      return show.season;
    },
    getSeasonAndEpisode() {
      return `S${show.getSeason()}E${show.getEpisode()}`;
    },
    getTitle() {
      return show.title;
    },
    season: '',
    setEpisode(episode) {
      show.episode = tools.addZeroToOneNumber(episode);
    },
    setSeason(season) {
      show.season = tools.addZeroToOneNumber(season);
    },
    setSeasonAndEpisode(...args) {
      const increment = 1;
      let maxArgsNumber = 1;
      if (args.length === maxArgsNumber) {
        // eslint-disable-next-line no-magic-numbers
        show.setSeasonAndEpisodeWithOneArgument(args[0]);
        return;
      }
      maxArgsNumber += increment;
      if (args.length === maxArgsNumber) {
        // eslint-disable-next-line no-magic-numbers
        show.setSeasonAndEpisodeWithTwoArgument(args[0], args[1]);
        return;
      }
      throw new RangeError('Exception in setSeasonAndEpisode');
    },
    setSeasonAndEpisodeWithOneArgument(seasonAndEpisode) {
      // eslint-disable-next-line prefer-named-capture-group
      const regex = /^s(\d{1,})e(\d{1,})/giu;
      show.setSeason(seasonAndEpisode.replace(regex, '$1'));
      show.setEpisode(seasonAndEpisode.replace(regex, '$2'));
    },
    setSeasonAndEpisodeWithTwoArgument(season, episode) {
      show.setSeason(season);
      show.setEpisode(episode);
    },
    setTitle(title) {
      show.title = title.replace('.', '');
    },
    title: ''
  };

  return {
    show: {
      getSearch: show.getSearch,
      getSeason: show.getSeason,
      getSeasonAndEpisode: show.getSeasonAndEpisode,
      getTitle: show.getTitle,
      setSeasonAndEpisode: show.setSeasonAndEpisode,
      setTitle: show.setTitle
    }
  };
};

// eslint-disable-next-line max-lines-per-function
const view = function view() {
  const tools = fabiencrassat.mainTools;
  const { show } = fabiencrassat.model;

  const popup = {
    close() {
      const container = popup.getContainer();
      if (container) {
        container.remove();
      }
    },
    create(cssClass, cssDisplay, { left, top } = {}) {
      const result = `
      <div
        id='${popup.popupId}'
        style='
          position: absolute;
          width: 350px;
          z-index: 97;
          display: ${cssDisplay};
          ${tools.getPixelStyle('top', top)}
          ${tools.getPixelStyle('left', left)}
        '
        class='
          cluetip
          ui-widget
          ui-widget-content
          ui-cluetip
          clue-right-default
          cluetip-default
          ${cssClass}
        '
      >
        <div class='cluetip-inner ui-widget-content ui-cluetip-content'>
          <div id='pop'>
            <div id='popheader'>
              <a
                class='fcr-closePopup'
                href='javascript:fabiencrassat.view.externalLinks.close();'
              >
                X
              </a>
              <span>${show.getTitle()} ${show.getSeasonAndEpisode()}</span>
            </div>
            <div id='poptext'>${popup.getLinks()}</div>
            <div id='popfooter'>${show.getSearch()}</div>
          </div>
        </div>
      </div>`;
      return result;
    },
    getContainer() {
      return $(`#${popup.popupId}`);
    },
    getLinks() {
      let links = '<span>';
      this.links.forEach(link => {
        links += `${link.name}: `;
        link.sites.forEach((site, index) => {
          const firstIndex = 0;
          if (index !== firstIndex) {
            links += ' | ';
          }
          links += `<a target="_blank" href="${site.url()}">
            ${site.name}
          </a>`;
        });
        links += '<br/>';
      }, links);
      links += '</span>';
      return links;
    },
    links: [
      { name: 'Streaming',
        sites: [
          { name: 'google',
            url() {
              // eslint-disable-next-line max-len
              return `https://www.google.fr/search?q=${tools.encodeURL(show.getSearch())}+vostfr+streaming`;
            } }
        ] },
      { name: 'Download',
        sites: [
          { name: 'direct',
            url() {
              // eslint-disable-next-line max-len
              return `https://www.google.fr/search?q=${tools.encodeURL(show.getSearch())}+direct+download+-torrent`;
            } },
          { name: 'megaddl',
            url() {
              // eslint-disable-next-line max-len
              return `https://megaddl.co/?s=${tools.encodeURL(show.getSearch())}`;
            } },
          { name: 'yourserie',
            url() {
              // eslint-disable-next-line max-len
              return `http://www.yourserie.com/?s=${tools.encodeURL(show.getTitle())}`;
            } },
          { name: 'todaytvseries2',
            url() {
              // eslint-disable-next-line max-len
              return `http://www.todaytvseries2.com/search-series?searchword=${tools.encodeURL(show.getTitle())}`;
            } },
          { name: 'reddit',
            url() {
              // eslint-disable-next-line max-len
              return `https://www.reddit.com/r/megalinks/search?q=${tools.encodeURL(show.getSearch())}&restrict_sr=on`;
            } },
          { name: 'binsearch',
            url() {
              // eslint-disable-next-line max-len
              return `https://binsearch.info/?q=${tools.encodeURL(show.getSearch())}`;
            } }
        ] },
      { name: 'Subtitle',
        sites: [
          { name: 'subscene',
            url() {
              // eslint-disable-next-line max-len
              return `https://subscene.com/subtitles/release?q=${tools.encodeURL(show.getSearch())}`;
            } },
          { name: 'subtitlecat',
            url() {
              // eslint-disable-next-line max-len
              return `https://www.subtitlecat.com/index.php?search=${tools.encodeURL(show.getSearch())}`;
            } }
        ] }
    ],
    popupId: 'fcr-external-links-element',
    removeOnOutsideClickEvent() {
      $(document).mouseup(event => {
        const container = popup.getContainer();
        const noEventTarget = 0;
        // If the target of the click isn't the container
        // Nor a descendant of the container
        if (!container.is(event.target) &&
        container.has(event.target).length === noEventTarget) {
          this.close();
        }
      });
    }
  };

  return {
    externalLinks: {
      close: popup.close,
      create: popup.create,
      removeOnOutsideClickEvent: popup.removeOnOutsideClickEvent
    }
  };
};

// eslint-disable-next-line max-lines-per-function
const main = function main() {
  const { externalLinks } = fabiencrassat.view;
  const { show } = fabiencrassat.model;

  const page = {
    controller: {
      addExternalLink(pageElement, element) {
        if (!page.controller.canAddExternalLink(
          pageElement.isInLocationPage,
          element
        )) {
          return;
        }
        page.controller.insertStylesheets(page.shared.stylesheets(pageElement));
        pageElement.insertExternalLink(element);
        page.controller.loadClickEventOnLinkElement(pageElement);
      },
      canAddExternalLink(isInLocationPage, element) {
        if (!isInLocationPage()) {
          return false;
        }
        const noElementValue = 0;
        if ($(element).length === noElementValue) {
          return false;
        }
        return true;
      },
      extractSeasonAndEpisode(pageElement, element) {
        const seasonAndEpisode = pageElement.extractSeasonAndEpisode(element);
        if (typeof seasonAndEpisode === 'string') {
          show.setSeasonAndEpisode(seasonAndEpisode);
          return;
        }
        show.setSeasonAndEpisode(
          seasonAndEpisode.season,
          seasonAndEpisode.episode
        );
      },
      extractShow(pageElement, element) {
        page.controller.extractTitle(pageElement, element);
        page.controller.extractSeasonAndEpisode(pageElement, element);
      },
      extractTitle(pageElement, element) {
        const title = $.trim(pageElement.extractTitle(element));
        show.setTitle(title);
      },
      getExternalLinksPopup(pageElement, element) {
        page.controller.extractShow(pageElement, element);
        pageElement.displayExternalLinksPopup(element);
      },
      insertStylesheets(stylesheets) {
        const style = document.createElement('style');
        style.appendChild(document.createTextNode(stylesheets));
        (document.body || document.head || document.documentElement)
          .appendChild(style);
      },
      isInLocationPage(regex) {
        return regex.test(window.location.href);
      },
      loadClickEventOnLinkElement(pageElement) {
        $(`.${page.shared.externalLinksLinkClass}`)
          .on('click', function onClick(event) {
            event.preventDefault();
            externalLinks.close();
            // eslint-disable-next-line no-invalid-this
            page.controller.getExternalLinksPopup(pageElement, $(this));
          });
        externalLinks.removeOnOutsideClickEvent();
      }
    },
    shared: {
      externalImageLink() {
        return page.shared.externalLink('fcr-externalLink-image', '');
      },
      externalLink(classText, linkText) {
        return `<a
          href="javascript:void(0)"
          class="${page.shared.externalLinksLinkClass} ${classText}">
            ${linkText}
        </a>`;
      },
      externalLinksLinkClass: 'fcr-externalLinksLink',
      externalTextLink() {
        return page.shared.externalLink('', '&lt;Links&gt;');
      },
      // eslint-disable-next-line max-len
      linkImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAZdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjAuMTM0A1t6AAAA20lEQVQoU33RuQrCQBDG8YgHeIIHinhgZyNWgg8iCoqIpW/jg5nG0oew8b7j/wsZCSkM/Nbs7MzuuHE8z/snhlxIyhbaGEb0MMAb9myUvMAJR1xwxQEvJLCCPVsVKKGOMqqBAipIw8UTOskv0E55WHtGyRsocYYlXC3cUEQ0WTsrWS1bPKNBx9VCQSXv8MEEHZTgr2t4oGkBdKFLGAdz/cd58O4XnBFtKRN6V8tTm2tQS7pvSwjTh9tjZDENfehY7XSHbk2/immzNVT4K5A4smghGcwb0DexHHjOFwrY3c0uEFwZAAAAAElFTkSuQmCC',
      stylesheets(pageElement) {
        return `a.fcr-closePopup {
          float: right;
          color: #66bbff !important;
        }${pageElement.stylesheets()}`;
      }
    }
  };

  return {
    controller: {
      addExternalLink: page.controller.addExternalLink,
      isInLocationPage: page.controller.isInLocationPage
    },
    shared: {
      externalImageLink: page.shared.externalImageLink,
      externalTextLink: page.shared.externalTextLink,
      linkImage: page.shared.linkImage
    }
  };
};

const fcrScriptElement = document.createElement('script');
const initFcrScript = function initFcrScript(strValue, value) {
  return `var fabiencrassat = fabiencrassat || {};
          fabiencrassat.${strValue} = (${value})();`;
};
fcrScriptElement
  .appendChild(document.createTextNode(initFcrScript('mainTools', mainTools)));
fcrScriptElement
  .appendChild(document.createTextNode(initFcrScript('model', model)));
fcrScriptElement
  .appendChild(document.createTextNode(initFcrScript('view', view)));
fcrScriptElement
  .appendChild(document.createTextNode(initFcrScript('main', main)));
(document.body || document.head || document.documentElement)
  .appendChild(fcrScriptElement);
