// ==UserScript==
// @name         Wikipedia-Widgets
// @description  Add widgets like the section toggle and the edit of the section 0 in the articles
// @namespace    https://github.com/fabiencrassat
// @version      0.2
// @description  Add some widgets!
// @author       Fabien Crassat <fabien@crassat.com>
// @match        https://*.wikipedia.org/wiki/*
// @grant        none
// ==/UserScript==

/* global $, mw */

function main () {
    "use strict";

    function toggleSection(obj) {
        var parentObj = $(obj).parent().parent();
        var localName = parentObj[0].localName;
        var n = parseInt(localName.replace("h", ""));
        var parentLocalName = [];
        for (var i = 1; i <= n; i++) {
            parentLocalName[i - 1] = "h" + i;
        }
        var r = parentLocalName.join(", ");

        if ($(obj).text() === "Hide") {
            $(parentObj).nextUntil(r).hide();
            $(obj).text("Show");
        } else {
            // by default the element is shown
            $(parentObj).nextUntil(r).show();
            $(obj).text("Hide");
        }
    }

    return {
        toggleSection
    };
}

var script = document.createElement("script");
script.appendChild(document.createTextNode("var fabiencrassat = fabiencrassat || {}; fabiencrassat.WikipediaWidget = ("+ main +")();"));
(document.body || document.head || document.documentElement).appendChild(script);

window.addEventListener("load", function() {
    // Add the edit section zero
    var articleTitle = encodeURIComponent( mw.config.get( "wgPageName" ) )
        .replace(/%20/g, "_").replace(/%3A/g, ":").replace(/%2F/g, "/").replace(/'/g, "%27");
    $("#firstHeading")
        .append("<span class='mw-editsection' style='margin-top:1.3em;'>")
        .append("<span class='mw-editsection-bracket'>[</span>")
        .append("<a href='/index.php?title=" + articleTitle +  "&amp;action=edit&amp;section=0' title='Edit first heading'>edit</a>")
        .append("<span class='mw-editsection-bracket'>]</span>")
        .append("</span>");

    // Add the toggle
    $("#mw-content-text > h2, #mw-content-text > h3, #mw-content-text > h4, #mw-content-text > h5, #mw-content-text > h6")
        .append("<span class='mw-editsection'>[<a href='#top'>top</a>]</span>")
        .append("<span class='mw-editsection'>[<a style='cursor:pointer' onclick='fabiencrassat.WikipediaWidget.toggleSection(this)'>Hide</a>]</span>");
}, false);
