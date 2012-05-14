(function (global) {
    "use strict";

 // The URL module loader.
    (function (el) {
        var input, button;
        input = el.querySelector("input");
        button = el.querySelector("button");
        button.addEventListener("click", function (event) {
            event.preventDefault();
            TCGA.loadScript(input.value, function (err) {
                if (err) {
                    alert("Script loading failed.");
                } else {
                    input.value = "";
                }
            });
        });
    }(document.getElementById("url-module-loader")));

 // The manifest module loader.
    (function (el) {
        var authors;
        authors = el.querySelector(".authors");
        authors.addEventListener("change", function (event) {
            var elModulesByAuthor, elModuleDetails;
            event.preventDefault();
         // Delete already populated module list.
            elModulesByAuthor = el.querySelector("#modules-by-author");
            if (elModulesByAuthor !== null) {
                elModulesByAuthor.parentNode.removeChild(elModulesByAuthor);
            }
         // Delete already populated module details.
            elModuleDetails = el.querySelector("#module-details");
            if (elModuleDetails !== null) {
                elModuleDetails.parentNode.removeChild(elModuleDetails);
            }
         // Prepare callback for manifest loading.
            exports.manifest = function (manifest) {
                var elModuleList, elModuleListElement;
             // Populate module list based on manifest.
                elModuleList = document.createElement("select");
                elModuleList.id = "modules-by-author";
                elModuleListElement = document.createElement("option");
                elModuleListElement.selected = true;
                elModuleListElement.disabled = true;
                elModuleListElement.appendChild(document.createTextNode("Select module ..."));
                elModuleList.appendChild(elModuleListElement);
                elModuleList.addEventListener("change", function (moduleListEvent) {
                    var elModuleDetails, elDescription, elButton, description;
                 // Delete already populated module details.
                    elModuleDetails = el.querySelector("#module-details");
                    if (elModuleDetails !== null) {
                        elModuleDetails.parentNode.removeChild(elModuleDetails);
                    }
                 // Display description and load button.
                    elModuleDetails = document.createElement("div");
                    elModuleDetails.id = "module-details";
                    elDescription = document.createElement("span");
                    description = moduleListEvent.target[moduleListEvent.target.selectedIndex].dataset.description;
                    elDescription.appendChild(document.createTextNode(description));
                    elModuleDetails.appendChild(elDescription);
                    elButton = document.createElement("button");
                    elButton.classList.add("btn");
                    elButton.appendChild(document.createTextNode("Load module"));
                    elButton.addEventListener("click", function (buttonEvent) {
                        buttonEvent.preventDefault();
                        TCGA.loadScript(moduleListEvent.target.value, function (err) {
                            if (err) {
                                alert("Script loading failed.");
                            }
                        });
                    });
                    elModuleDetails.appendChild(elButton);
                    el.appendChild(elModuleDetails);
                });
                if (Object.toType(manifest) === "array") {
                    manifest.forEach(function (module) {
                        elModuleListElement = document.createElement("option");
                        elModuleListElement.value = module.url;
                        elModuleListElement.text = module.name;
                        elModuleListElement.dataset.description = module.description;
                        elModuleList.appendChild(elModuleListElement);
                    });
                } else {
                    Object.keys(manifest).forEach(function (module) {
                        elModuleListElement = document.createElement("option");
                        elModuleListElement.value = manifest[module].url;
                        elModuleListElement.text = manifest[module].name;
                        elModuleListElement.dataset.description = manifest[module].description;
                        elModuleList.appendChild(elModuleListElement);
                    });
                }
                el.appendChild(elModuleList);
            };
         // Download manifest.
            TCGA.loadScript(this.value, function (err, res) {
                if (err) {
                    alert("Loading selected manifest failed.");
                }
            });
        });
    }(document.getElementById("list-module-loader")));

 // The omnibox module loader.
    (function (search) {
        var modules, pairs;
        modules = [];
        search = search.substring(1, search.length);
        pairs = search.split("&");
     // Extract modules.
        pairs.forEach(function (pair) {
            pair = pair.split("=");
            if (pair[0] === "module") {
                modules.push(pair[1]);
            }
        });
     // Load modules.
        TCGA.loadScript(modules);
    }(global.location.search));

}(this));
