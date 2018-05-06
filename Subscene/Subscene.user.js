// ==UserScript==
// @name         Subscene
// @namespace    https://github.com/fabiencrassat
// @version      0.1
// @description  Filter with english language!
// @author       Fabien Crassat <fabien@crassat.com>
// @match        https://subscene.com/*
// @grant        none
// @require      https://cdn.jsdelivr.net/npm/js-cookie@2/src/js.cookie.min.js
// ==/UserScript==

(function() {
  'use strict';

  const SEPARATOR_VALUES = ',';

  const languages = {
    values : {
      13: 'english'
    },

    getKeys() {
      return Object.keys(languages.values).join(SEPARATOR_VALUES);
    },
    arePresents() {
      const languageFilterCookie = Cookies.get('LanguageFilter');

      if (languageFilterCookie === undefined) return false;
      if (languageFilterCookie !== languages.getKeys()) return false;

      return true;
    },
    setCookie() {
      Cookies.set('LanguageFilter', languages.getKeys(), {
        domain: '.subscene.com',
        path: '/',
        secure: true
      });
    }
  };

  /* Main */
  console.log(Cookies.get());
  if (languages.arePresents()) {
    console.log("No need to reload");
    return;
  }
  console.log("Set languages and refresh");
  languages.setCookie();
  location.reload();
})();
