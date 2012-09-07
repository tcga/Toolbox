/**
 * Ganglion
 * Depends on: analytics.js
 */
(function (exports) {
    "use strict";

    var registry, loadModule;

 // The default module registry registers modules into the URL.
    exports.registry = registry = (function () {
        var subscribers, subscribe, publish, add, list;
        subscribers = [];
        subscribe = function (callback) {
            subscribers.push(callback);
        };
        publish = function (evt) {
            subscribers.map(function (callback) {
                callback(evt);
            });
        };
        add = function (modules, callback) {
            var search;
            if (typeof modules !== "string" && Array.isArray(modules) === false) {
                throw new Error("Please provide a modules parameter (string or [string]).");
            }
            if (typeof modules === "string") {
             // Convert string to array.
                modules = [modules];
            }
            callback = (typeof callback === "function") ? callback : function () {};
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
            publish([modules]);
            callback(null);
        };
        list = function (callback) {
            var modules, search, pairs;
            if (typeof callback !== "function") {
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
        };
        return {
            add: add,
            list: list,
            subscribe: subscribe
        };
    }());

 // Loads one or more scripts in order using HTML script elements.
 // If one script fails, the callback will be executed immediately.
 // @param {string} options
 // @param {[string]} options
 // @param {options} options
 // @param {(err, [loaded_script, loaded_script, ...])} callback
    exports.loadModule = loadModule = function (options, callback) {
        var loadedScripts;
        if (typeof options !== "string" && Array.isArray(options) === false && (typeof options !== "object" || options === null)) {
            throw new Error("Please provide a uri parameter (string, [string], or object).");
        }
        if (typeof options === "string") {
            options = {
                scripts: [options]
            };
        } else if (Array.isArray(options) === true) {
            options = {
                scripts: options
            };
        } else {
            if (options.hasOwnProperty("scripts") === false || Array.isArray(options.scripts) === false) {
                throw new Error("Please provide an options.scripts parameter ([string]).");
            }
        }
        if (options.hasOwnProperty("registerModules") === false || typeof options.registerModules !== "boolean") {
            options.registerModules = true;
        }
     // Set default callback handler.
        callback = (typeof callback === "function") ? callback : function () {};
     // Keep a list of loaded scripts.
        loadedScripts = [];
     // Use inline recursion to load all scripts.
        (function loadScriptRec() {
            var target, trackEvent, head, script;
            if (loadedScripts.length === options.scripts.length) {
                if (options.registerModules === true) {
                    loadedScripts.forEach(function (script) {
                     // Register module.
                        registry.add(script);
                    });
                }
                callback(null, loadedScripts);
                return;
            }
            target = options.scripts[loadedScripts.length];
            if (options.hasOwnProperty("trackEvent") === true && options.trackEvent !== false) {
                trackEvent = {};
                trackEvent.category = options.trackEvent.category || "Module";
                trackEvent.action = options.trackEvent.action || "API";
                _gaq.push(["_trackEvent", trackEvent.category, trackEvent.action, target]);
            }
            head = document.head;
            script = document.createElement("script");
            script.src = target;
            script.onload = function () {
                loadedScripts.push(target);
                head.removeChild(script);
                loadScriptRec();
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

}(this.ganglion = {}));
