(function (global) {
    "use strict";

 // The URL module loader.
    (function (el) {
        var input, button;
        input = el.querySelector("input");
        button = el.querySelector("button");
        button.addEventListener("click", function (ev) {
            var url;
            ev.preventDefault();
            url = input.value;
            $(button).button("loading");
            TCGA.loadScript(input.value, function (err) {
                $(button).button("reset");
                if (err) {
                    TCGA.toast.error("An error occurred when loading module \"" + input.value + "\".");
                } else {
                    url = input.value;
                    TCGA.toast.success("Module " + url + " was successfully loaded.");
                    input.value = "";
                }
            });
        });
    }(document.getElementById("url-module-loader")));

 // The manifest module loader.
    (function (el) {
        var query;
        query = ["prefix mf:<https://tcga.github.com/manifest#>",
                 "select ?author ?url",
                 "where {",
                 "  ?manifest mf:author ?author .",
                 "  ?manifest mf:url ?url .",
                 "}",
                 "order by ?author"].join("\n");
        TCGA.hub.query({
            query: query,
            repository: "manifest"
        }, function (err, sparqlResult, opts) {
            var authors;
            authors = el.querySelector("#authors");
         // Change label of disabled option in list of authors.
            $(":disabled", authors).text("Select author ...");
         // Add manifests to list.
            sparqlResult.results.bindings.map(function (manifest) {
                $(authors).append(
                    $("<option></option>").attr("value", manifest.url.value).text(manifest.author.value)
                );
            });
            authors.addEventListener("change", function (manifestListEvent) {
                var elModulesByAuthor, elLoadButton;
                manifestListEvent.preventDefault();
             // Delete already populated module list.
                elModulesByAuthor = el.querySelector("#modules");
                if (elModulesByAuthor !== null) {
                    elModulesByAuthor.parentNode.removeChild(elModulesByAuthor);
                }
             // Delete already populated module details.
                elLoadButton = el.querySelector("button");
                if (elLoadButton !== null) {
                    elLoadButton.parentNode.removeChild(elLoadButton);
                }
             // Prepare callback for manifest loading.
                global.manifest = function (manifest) {
                    var elModuleList, elModuleListElement;
                 // Populate module list based on manifest.
                    elModuleList = document.createElement("select");
                    elModuleList.id = "modules";
                    elModuleListElement = document.createElement("option");
                    elModuleListElement.selected = true;
                    elModuleListElement.disabled = true;
                    elModuleListElement.appendChild(document.createTextNode("Select module ..."));
                    elModuleList.appendChild(elModuleListElement);
                    elModuleList.addEventListener("change", function (moduleListEvent) {
                        var elButton, description;
                     // Display description and load button.
                        elButton = document.createElement("button");
                        elButton.classList.add("btn");
                        elButton.appendChild(document.createTextNode("Load module"));
                        elButton.addEventListener("click", function (buttonEvent) {
                            var url;
                            buttonEvent.preventDefault();
                            url = moduleListEvent.target.value;
                            TCGA.loadScript(url, function (err) {
                                if (err) {
                                    TCGA.toast.error("An error occurred when loading module \"" + moduleListEvent.target.value + "\".");
                                } else {
                                    TCGA.toast.success("Module " + url + " was successfully loaded.");
                                }
                            });
                        });
                        el.appendChild(elButton);
                    });
                    if (Object.toType(manifest) === "array") {
                        manifest.forEach(function (module) {
                            elModuleListElement = document.createElement("option");
                            elModuleListElement.value = module.url;
                            elModuleListElement.text = module.name + ": " + module.description;
                            elModuleList.appendChild(elModuleListElement);
                        });
                    } else {
                        Object.keys(manifest).forEach(function (module) {
                            elModuleListElement = document.createElement("option");
                            elModuleListElement.value = manifest[module].url;
                            elModuleListElement.text = manifest[module].name + ": " + manifest[module].description;
                            elModuleList.appendChild(elModuleListElement);
                        });
                    }
                    el.appendChild(elModuleList);
                };
             // Download manifest.
                TCGA.loadScript({
                    scripts: [this.value],
                    registerModule: false
                }, function (err) {
                    if (err) {
                        TCGA.toast.error("Loading selected manifest failed.");
                    }
                });
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
        TCGA.loadScript({
            scripts: modules,
            registerModule: false
        }, function (err, loadedScripts) {
            if (err !== null) {
                TCGA.toast.error("An error occurred when loading the registered modules.");
            }
        });
    }());

 // Promoted modules.
    (function (el) {
        el.addEventListener("click", function (ev) {
            var url;
            ev.preventDefault();
            url = ev.target.href;
            TCGA.loadScript(url, function (err) {
                if (err) {
                    TCGA.toast.error("Oops, something went wrong! Please try some other module.");
                }
            });
        });
    }(document.getElementById("promoted-module")));

}(this));
