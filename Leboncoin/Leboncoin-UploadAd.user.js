// ==UserScript==
// @name         UploadAdInLeBonCoin
// @namespace    https://github.com/fabiencrassat
// @version      0.0.2
// @description  Upload an advertisement json file into LeBonCoin site
// @author       Fabien Crassat <fabien@crassat.com>
// @match        https://www.leboncoin.fr/ai/form/*
// @match        https://www2.leboncoin.fr/ai/form/*
// @grant        none
// ==/UserScript==

/* global $, MultipleLocationNewad */

(function() {
  "use strict";

  const selectorForDom = {
    inputText(key, value) {
        $(key).val(value);
    },
    select(key, value) {
        const optionValue = $(key + " option").filter(function () {
          return $(this).html() === value;
        }).val();
        $(key).val(optionValue).trigger("change");
    },
    localisation(key, value) {
      $.ajax({
        type: "GET",
        url: "/beta/ajax/location_list_newad.html",
        data: {
          city: value.city,
          zipcode: value.zipcode,
        },
        success(response) {
          const localisation = new MultipleLocationNewad(key, 1, 1);
          localisation.spreadCityAndZipcode(response);
          $(key).val(value.city + " " + value.zipcode);
          localisation.addLocation($(response), null, null, true);
        }
      });
    }
  };

  const mapping = {
    "Catégorie *": {
      selector: "#category",
      mandatory: true,
      type: selectorForDom.select
    },
    "Titre de l'annonce *": {
      selector: "#subject",
      mandatory: true,
      type: selectorForDom.inputText
    },
    "Type de bien": {
      selector: "#real_estate_type",
      type: selectorForDom.select
    },
    "Surface": {
      selector: "#square",
      type: selectorForDom.inputText
    },
    "Pièces": {
      selector: "#rooms",
      type: selectorForDom.inputText
    },
    "Classe énergie": {
      selector: "#energy_rate",
      type: selectorForDom.select
    },
    "GES": {
      selector: "#ges",
      type: selectorForDom.select
    },
    "Texte de l'annonce *": {
      selector: "#body",
      mandatory: true,
      type: selectorForDom.inputText
    },
    "Prix": {
      selector: "#price",
      mandatory: true,
      type: selectorForDom.inputText
    },
    "Ville ou code postal *": {
      selector: "#location_p",
      mandatory: true,
      type: selectorForDom.localisation,
      children: [ "zipcode", "city" ]
    },
    "Téléphone *": {
      selector: "#phone",
      mandatory: true,
      type: selectorForDom.inputText
    }
  };

  function setValue(data, key) {
      if (mapping[key].mandatory && !data[key]) {
        throw new Error(`Missig '${key}' key in the JSON file`);
      }
      if (mapping[key].mandatory && mapping[key].children) {
        mapping[key].children.forEach(function(childKey) {
          if (!data[key][childKey]) {
            throw new Error(`Missig '${childKey}' key inside the '${key}' key in the JSON file`);
          }
        });
      }
      mapping[key].type(mapping[key].selector, data[key]);
  }

  function popuplate(data) {
    const keys = Object.keys(mapping);
    keys.forEach(function(key) {
      setValue(data, key);
    });
}

function readFile(file) {
    var reader = new FileReader();
    reader.onload = function(evt) {
      const result = evt.target.result;
      popuplate(JSON.parse(result));
    };
    reader.readAsText(file);
  }

  const header = $("main header > h1");
  header.after("<div class='line'><label class='label' for='category'>Upload your JSON ad</label><div class='single'><input type='file' id='fileInput'></div></div>");

  $("#fileInput").on("change", function() {
      if (this.files.length === 1) {
        const file = this.files[0];
        if (file.type === "application/json") {
            readFile(file);
        }
      }
  });
}());
