/**
 * Ganglion
 * Depends on: toType.js, jquery.js, jquery.tinypubsub.js
 */
(function (exports) {
    "use strict";

    var registry, modules, loadModule;

 // The module registry registers modules into the URL.
    registry = {
        add: function (modules, callback) {
            var modulesType, search;
            modulesType = Object.toType(modules);
            if (["string", "array"].indexOf(modulesType) === -1) {
                throw new Error("Please provide a modules parameter (string or [string]).");
            }
            if (modulesType === "string") {
             // Convert string to array.
                modules = [modules];
            }
            callback = Object.toType(callback) === "function" ? callback : function () {};
            search = window.location.search;
         // Append modules to search.
            modules.forEach(function (module) {
                if (search === "") {
                    search = "?";
                } else {
                    search += "&";
                }
                search += "module=" + module;
            });
         // replaceState overwrites the fragment part of the URI.
            search += window.location.hash;
         // Change the URL without redirect.
            window.history.replaceState(null, "Load module", search);
         // Emit event.
            $.publish("/ganglion/registry/add", [modules]);
            callback(null);
        },
        list: function (callback) {
            var modules, search, pairs;
            if (Object.toType(callback) !== "function") {
                throw new Error("Please provide a callback parameter (function).");
            }
            modules = [];
            search = window.location.search;
            search = search.substring(1, search.length);
            pairs = search.split("&");
            pairs.forEach(function (pair) {
                pair = pair.split("=");
                if (pair[0] === "module") {
                    modules.push(pair[1]);
                }
            });
            callback(null, modules);
        }
    };

    exports.modules = registry.list;

 // Loads one or more scripts in order using HTML script elements.
 // If one script fails, the callback will be executed immediately.
 // @param {string} options
 // @param {[string]} options
 // @param {options} options
 // @param {(err, [loaded_script, loaded_script, ...])} callback
    exports.loadModule = loadModule = function (options, callback) {
        var optionsType, loadedScripts;
        optionsType = Object.toType(options);
        if (["string", "array", "object"].indexOf(optionsType) === -1) {
            throw new Error("Please provide a uri parameter (string, [string], or object).");
        }
        if (callback !== undefined && Object.toType(callback) !== "function") {
            throw new Error("Please provide a callback parameter (function).");
        }
        if (optionsType === "string") {
            options = {
                scripts: [options]
            };
        } else if (optionsType === "array") {
            options = {
                scripts: options
            };
        } else {
            if (options.hasOwnProperty("scripts") === false || Object.toType(options.scripts) !== "array") {
                throw new Error("Please provide an options.scripts parameter ([string]).");
            }
        }
        if (options.hasOwnProperty("registerModules") === false || Object.toType(options.registerModules) !== "boolean") {
            options.registerModules = true;
        }
     // Set default callback handler.
        callback = callback || function () {};
     // Keep a list of loaded scripts.
        loadedScripts = [];
     // Use inline recursion to load all scripts.
        (function loadModuleRec() {
            var target, head, script;
            if (loadedScripts.length === options.scripts.length) {
                if (options.registerModules === true) {
                 // Add module to registry.
                    registry.add(loadedScripts);
                }
                callback(null, loadedScripts);
                return;
            }
            target = options.scripts[loadedScripts.length];
            head = document.head;
            script = document.createElement("script");
            script.src = target;
            script.onload = function () {
                loadedScripts.push(target);
                head.removeChild(script);
                loadModuleRec();
            };
            script.onerror = function () {
                head.removeChild(script);
                callback({
                    name: "Error",
                    message: "Loading the script failed. The browser log might have more details."
                }, loadedScripts);
            };
            head.appendChild(script);
        }());
    };

}(this.Ganglion = {}));
