// ==UserScript==
// @name         Subscene
// @namespace    https://github.com/fabiencrassat
// @version      0.1.2
// @description  Filter with english language!
// @author       Fabien Crassat <fabien@crassat.com>
// @match        https://subscene.com/*
// @grant        none
// @require      https://cdn.jsdelivr.net/npm/js-cookie@2/src/js.cookie.min.js
// ==/UserScript==

/* global Cookies */
'use strict';

(function subscene() {
  const SEPARATOR_VALUES = ',';

  const languages = {
    arePresents() {
      const languageFilterCookie = Cookies.get(languages.key);
      if (!languageFilterCookie) {
        return false;
      }
      if (languageFilterCookie !== languages.getKeyValues()) {
        return false;
      }
      return true;
    },
    domain: '.subscene.com',
    getKeyValues() {
      return Object.keys(languages.values).join(SEPARATOR_VALUES);
    },
    key: 'LanguageFilter',
    path: '/',
    setCookie() {
      Cookies.set(languages.key, languages.getKeyValues(), {
        domain: languages.domain,
        path: languages.path,
        secure: true
      });
    },
    values: {
      13: 'english'
    }
  };

  /* Main */
  if (languages.arePresents()) {
    return;
  }
  languages.setCookie();
  location.reload();
}());
