/**
 * TCGA Toolbox GUI
 * Depends on: tcga.js
 */
/*jshint jquery:true browser:true */
/*global TCGA:false, ganglion:false */
$(document).ready(function () {
    "use strict";

    var moduleList, shareUrl;

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
            TCGA.loadScript({
                scripts: [input.value],
                trackEvent: {
                    category: "Module",
                    action: "URL"
                }
            }, function (err) {
                $(button).button("reset");
                if (err) {
                    TCGA.ui.toast.error("An error occurred when loading module \"" + input.value + "\".");
                } else {
                    url = input.value;
                    TCGA.ui.toast.success("Module " + url + " was successfully loaded.");
                    input.value = "";
                }
            });
        });
    }(document.getElementById("url-module-loader")));

 // The manifest module loader.
    (function (el) {
        TCGA.get.json("https://tcga.github.io/authors.json", function (err, manifests) {
            var authors;
            authors = el.querySelector("#authors");
         // Change label of disabled option in list of authors.
            $(":disabled", authors).text("Select author ...");
         // Add manifests to list.
            manifests.forEach(function (manifest) {
                $(authors).append(
                    $("<option></option>").attr("value", manifest.url).text(manifest.author)
                );
            });
            authors.addEventListener("change", function (manifestListEvent) {
                var elModulesByAuthor, elButton;
                manifestListEvent.preventDefault();
             // Delete already populated module list.
                elModulesByAuthor = el.querySelector("#modules");
                if (elModulesByAuthor !== null) {
                    elModulesByAuthor.parentNode.removeChild(elModulesByAuthor);
                }
             // Delete load button.
                elButton = el.querySelector("button");
                if (elButton !== null) {
                    elButton.parentNode.removeChild(elButton);
                }
             // Prepare callback for manifest loading.
                window.manifest = function (manifest) {
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
                     // Don't create a button if there already is one.
                        elButton = el.querySelector("button");
                        if (elButton === null) {
                            elButton = document.createElement("button");
                            elButton.classList.add("btn");
                            elButton.appendChild(document.createTextNode("Load module"));
                            elButton.addEventListener("click", function (buttonEvent) {
                                var url;
                                buttonEvent.preventDefault();
                                url = moduleListEvent.target.value;
                                TCGA.loadScript({
                                    scripts: [url],
                                    trackEvent: {
                                        category: "Module",
                                        action: "Manifest"
                                    }
                                }, function (err) {
                                    if (err) {
                                        TCGA.ui.toast.error("An error occurred when loading module \"" + moduleListEvent.target.value + "\".");
                                    } else {
                                        TCGA.ui.toast.success("Module " + url + " was successfully loaded.");
                                    }
                                });
                            });
                        }
                        el.appendChild(elButton);
                    });
                    if (Array.isArray(manifest) === true) {
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
                    trackEvent: false,
                    registerModules: false
                }, function (err) {
                    if (err) {
                        TCGA.ui.toast.error("Loading selected manifest failed.");
                    }
                });
            });
        });
    }(document.getElementById("list-module-loader")));

 // Promoted modules.
    (function (el) {
        el.addEventListener("click", function (ev) {
            var url;
            ev.preventDefault();
            url = ev.target.href;
            TCGA.loadScript({
                scripts: [url],
                trackEvent: {
                    category: "Module",
                    action: "Promotion"
                }
            }, function (err) {
                if (err) {
                    TCGA.ui.toast.error("Oops, something went wrong! Please try some other module.");
                }
            });
        });
    }(document.getElementById("promoted-module")));

 // List of registered modules.
    moduleList = (function (el) {
        var empty;
        empty = true;
        return {
            add: function (modules) {
                var list;
                if (typeof modules !== "string" && Array.isArray(modules) === false) {
                    throw new Error("Please provide a modules parameter (string or [string]).");
                }
                if (typeof modules === "string") {
                    modules = [modules];
                }
                list = $("ul", el);
                modules.forEach(function (module) {
                    list.append(
                        $("<li></li>").append(
                            $("<a></a>").attr("href", module).attr("target", "_blank").text(module)
                        )
                    );
                });
                if (empty === true) {
                 // I don't know why I cannot chain fadeOut with fadeIn here.
                    $("p", el).hide();
                    list.fadeIn(100);
                    empty = false;
                }
            }
        };
    }(document.getElementById("registered-modules")));

    shareUrl = (function (el) {
        var input, button;
        input = $("input[name='url']", el);
        button = $("input[type='submit']", el);
        $(el).submit(function (ev) {
            ev.preventDefault();
         // Select content of textbox.
            input.select();
         // Write current selection into clipboard.
            document.execCommand("copy");
        });
        $(button).click(function (ev) {
            $(this).submit();
        });
        return {
            update: function () {
                input.val("https://tcga.github.io/Toolbox/" + window.location.search);
            }
        };
    }(document.getElementById("share-modules")));

    ganglion.registry.subscribe(function (modules) {
     // Keep the module list up-to-date.
        moduleList.add(modules);
     // Keep the URL in the share box up-to-date.
        shareUrl.update();
    });

 // The omnibox module loader.
    (function () {
        ganglion.registry.list(function (err, modules) {
            var trackEvent;
            if (modules.length > 0) {
             // Determine whether to track event or not.
                if (window.location.search.indexOf("trackEvent=false") !== -1) {
                    trackEvent = false;
                } else {
                    trackEvent = {
                        category: "Module",
                        action: "Omnibox"
                    };
                }
             // Load modules.
                TCGA.loadScript({
                    scripts: modules,
                    trackEvent: trackEvent,
                    registerModules: false
                }, function (err, loadedScripts) {
                    if (err !== null) {
                        TCGA.ui.toast.error("An error occurred when loading the registered modules.");
                    }
                });
             // Add modules to the list of registered modules.
                moduleList.add(modules);
            }
         // Add modules to the URL in the share box.
            shareUrl.update();
        });
    }());

 // Open tab that is mentioned in the fragment part of the URL.
    if (window.location.hash !== "") {
        $(".nav a[data-toggle='tab'][href='" + window.location.hash + "']").tab("show");
    }

 // Write tab changes into the fragment part of the URL.
    $(".nav a[data-toggle='tab']").on("show", function (e) {
        window.location.hash = e.target.href.split("#")[1];
    });

});
