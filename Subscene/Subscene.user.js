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

/** global: Cookies */

((function() {
  "use strict";

  const SEPARATOR_VALUES = ",";

  const languages = {
    domain : ".subscene.com",
    path : "/",
    key : "LanguageFilter",
    values : {
      13: "english"
    },

    getKeyValues() {
      return Object.keys(languages.values).join(SEPARATOR_VALUES);
    },
    arePresents() {
      const languageFilterCookie = Cookies.get(languages.key);

      if (!languageFilterCookie || languageFilterCookie !== languages.getKeyValues()) {
        return false;
      }

      return true;
    },
    setCookie() {
      Cookies.set(languages.key, languages.getKeyValues(), {
        domain: languages.domain,
        path: languages.path,
        secure: true
      });
    }
  };

  /* Main */
  if (languages.arePresents()) {
    return;
  }
  languages.setCookie();
  location.reload();
})());
