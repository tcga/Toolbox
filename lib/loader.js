(function (global) {
    "use strict";

    var setLocation;

    setLocation = function (module) {
        var previousSearch;
     // Prepend question mark or ampersand.
        previousSearch = global.location.search === "" ? "?" : global.location.search + "&";
     // Change the URL without redirect.
        global.history.replaceState(null, "Load module", previousSearch + "module=" + module);
    };

 // The URL module loader.
    (function (el) {
        var input, button;
        input = el.querySelector("input");
        button = el.querySelector("button");
        button.addEventListener("click", function (ev) {
            ev.preventDefault();
            $(button).button("loading");
            TCGA.loadScript(input.value, function (err) {
                $(button).button("reset");
                if (err) {
                    TCGA.toast.error("An error occurred when loading module \"" + input.value + "\".");
                } else {
                    TCGA.toast.success("Module " + input.value + " was successfully loaded.");
                    setLocation(input.value);
                    input.value = "";
                }
            });
        });
    }(document.getElementById("url-module-loader")));

 // The manifest module loader.
    (function (el) {
        var authors;
        authors = el.querySelector(".authors");
        authors.addEventListener("change", function (manifestListEvent) {
            var elModulesByAuthor, elModuleDetails;
            manifestListEvent.preventDefault();
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
            global.manifest = function (manifest) {
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
                                TCGA.toast.error("An error occurred when loading module \"" + moduleListEvent.target.value + "\".");
                            } else {
                                TCGA.toast.success("Module " + moduleListEvent.target.value + " was successfully loaded.");
                                setLocation(moduleListEvent.target.value);
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
                    TCGA.toast.error("Loading selected manifest failed.");
                }
            });
        });
    }(document.getElementById("list-module-loader")));

 // The omnibox module loader.
    (function () {
        var search, modules, pairs;
        search = global.location.search;
        search = search.substring(1, search.length);
        modules = [];
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
    }());

 // Promoted modules.
    (function (el) {
        el.addEventListener("click", function (ev) {
            ev.preventDefault();
            TCGA.loadScript(ev.target.href, function (err) {
                if (err) {
                    TCGA.toast.error("Oops, something went wrong! Please try some other module.");
                } else {
                    setLocation(ev.target.href);
                }
            });
        });
    }(document.getElementById("promoted-module")));

}(this));
