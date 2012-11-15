/**
 * TCGA Toolbox
 * Depends on: jquery.js, ganglion.js, gzip.js
 */
/*jshint jquery:true browser:true */
/*global TCGA:false, ganglion:false, TarGZ:false, chrome:false */
(function (exports) {
    "use strict";

    var modules, loadScript, get, find, data, ui, version;

 // Returns a list of registered modules.
 // @param {(err, modules)} callback
 // @param {[string]} callback.modules
    exports.modules = modules = function (callback) {
        ganglion.registry.list(callback);
    };

 // Loads one or more scripts in order using HTML script elements.
 // If one script fails, the callback will be executed immediately.
 // @param {string} options
 // @param {[string]} options
 // @param {options} options
 // @param {(err, [loaded_script, loaded_script, ...])} callback
    exports.loadScript = loadScript = function (options, callback) {
        ganglion.loadModule(options, callback);
    };

 // Performs a GET request.
 // @param {string} uri
 // @param {(err, body)} callback
 // @param {string} callback.body
    exports.get = get = function (uri, callback) {
        if (typeof uri !== "string") {
            throw new Error("Please provide a uri parameter (string).");
        }
        if (typeof callback !== "function") {
            throw new Error("Please provide a callback parameter (function).");
        }
        $.ajax({
            url: uri,
            dataType: "text"
        }).success(function (data) {
            callback(null, data);
        }).error(function (jqXHR, textStatus, errorThrown) {
            if (errorThrown === "") {
                callback(new Error("Getting the URI failed. The browser log might have more details."), null);
            } else {
                callback(errorThrown, null);
            }
        });
    };

 // Performs a GET request that treats the body of the response as JSON regardless of its Content-Type (some
 // VCS like GitHub can be used to serve raw content, but they typically don't respect the Content-Type of a file).
 // @param {string} uri
 // @param {(err, json)} callback
 // @param {object} callback.json
    get.json = function (uri, callback) {
        if (typeof uri !== "string") {
            throw new Error("Please provide a uri parameter (string).");
        }
        if (typeof callback !== "function") {
            throw new Error("Please provide a callback parameter (function).");
        }
        $.ajax({
            url: uri,
            dataType: "json"
        }).success(function (data) {
            callback(null, data);
        }).error(function (jqXHR, textStatus, errorThrown) {
            if (errorThrown === "") {
                callback(new Error("Getting the URI failed. The browser log might have more details."), null);
            } else {
                callback(errorThrown, null);
            }
        });
    };

 // @param {string} uri
 // @param {(err, xml)} callback
 // @param {object} callback.xml
    get.xml = function (uri, callback) {
        if (typeof uri !== "string") {
            throw new Error("Please provide a uri parameter (string).");
        }
        if (typeof callback !== "function") {
            throw new Error("Please provide a callback parameter (function).");
        }
        $.ajax({
            url: uri,
            dataType: "xml"
        }).success(function (data) {
            callback(null, data);
        }).error(function (jqXHR, textStatus, errorThrown) {
            if (errorThrown === "") {
                callback(new Error("Getting the URI failed. The browser log might have more details."), null);
            } else {
                callback(errorThrown, null);
            }
        });
    };

 // @param {string} uri
 // @param {(err, res)} callback
 // @param {object} callback.res SPARQL query results in the SPARQL 1.1 Query Results JSON Format.
    get.sparql = function (uri, callback) {
        if (typeof uri !== "string") {
            throw new Error("Please provide a uri parameter (string).");
        }
        if (typeof callback !== "function") {
            throw new Error("Please provide a callback parameter (function).");
        }
        $.ajax({
            url: uri,
            dataType: "json",
            headers: {
                "Accept": "application/sparql-results+json"
            }
        }).success(function (data) {
            callback(null, data);
        }).error(function (jqXHR, textStatus, errorThrown) {
            if (errorThrown === "") {
                callback(new Error("Getting the URI failed. The browser log might have more details."), null);
            } else {
                callback(errorThrown, null);
            }
        });
    };

 // Performs a ranged GET request.
 // @param {string} uri
 // @param {number} startByte
 // @param {number} endByte
 // @param {(err, body)} callback
 // @param {string} callback.body
    get.range = function (uri, startByte, endByte, callback) {
        if (typeof uri !== "string") {
            throw new Error("Please provide a uri parameter (string).");
        }
        if (typeof callback !== "function") {
            throw new Error("Please provide a callback parameter (function).");
        }
        startByte = startByte || 0;
        endByte = endByte || 100;
        $.ajax({
            url: uri,
            dataType: "text",
            headers: {
                "Range": "bytes=" + startByte + "-" + endByte
            }
        }).success(function (data) {
            callback(null, data);
        }).error(function (jqXHR, textStatus, errorThrown) {
            if (errorThrown === "") {
                callback(new Error("Getting the URI failed. The browser log might have more details."), null);
            } else {
                callback(errorThrown, null);
            }
        });
    };

    get.archive = function (uri, callback) {
        if (typeof uri !== "string") {
            throw new Error("Please provide a uri parameter (string).");
        }
        if (typeof callback !== "function") {
            throw new Error("Please provide a callback parameter (function).");
        }
        TarGZ.load(uri, function (files) {
         // onload
            callback(null, files);
        }, function () {
         // onstream
        }, function () {
         // onerror
            callback(new Error("Getting the URI failed. The browser log might have more details."), null);
        });
    };

 // A persistent key/value store based on IndexedDB.
    exports.data = (function () {

        var db, dbName, dbVersion, storeName, open, set, get, del, exists, keys, clear;

        db = null;
        dbName = "tcga";
        dbVersion = 1;

        storeName = "data";

        open = function (callback) {
            if (db !== null) {
                callback(null, db);
            } else {
                var request;
                request = indexedDB.open(dbName, dbVersion);
                request.onerror = function (evt) {
                    callback(new Error(evt.target.errorMessage || evt.target.webkitErrorMessage), null);
                };
                request.onupgradeneeded = function (evt) {
                    var db;
                    db = evt.target.result;
                 // Neither key paths nor key generators are used yet.
                    db.createObjectStore(storeName);
                };
                request.onsuccess = function (evt) {
                    db = evt.target.result;
                    callback(null, db);
                };
            }
        };

     // @param {string} key
     // @param {any} value
     // @param {string} key
     // @param {(err)} callback
        set = function (key, value, callback) {
            if (typeof key !== "string") {
                callback(new TypeError("key has to be of type string."));
            } else {
                open(function (err, db) {
                    var tx, store;
                    tx = db.transaction([storeName], "readwrite");
                    tx.onerror = function (evt) {
                        callback(new Error(evt.target.errorMessage || evt.target.webkitErrorMessage));
                    };
                    tx.oncomplete = function (evt) {
                        callback(null);
                    };
                    store = tx.objectStore(storeName);
                    store.put(value, key);
                });
            }
        };

     // @param {string} key
     // @param {(err, value)} callback
        get = function (key, callback) {
            open(function (err, db) {
                var tx, store, request;
                tx = db.transaction([storeName], "readonly");
                store = tx.objectStore(storeName);
                request = store.get(key);
                request.onerror = function (evt) {
                    callback(new Error(evt.target.errorMessage || evt.target.webkitErrorMessage));
                };
                request.onsuccess = function (evt) {
                    var result;
                    result = evt.target.result;
                    if (result === undefined) {
                        callback(new Error("Not Found"), null);
                    } else {
                        callback(null, result);
                    }
                };
            });
        };

     // @param {string} key
     // @param {(err)} callback
        del = function (key, callback) {
            open(function (err, db) {
                exists(key, function (err, exists) {
                    if (exists === false) {
                        callback(new Error("Not Found"));
                    } else {
                        var tx, store;
                        tx = db.transaction([storeName], "readwrite");
                        tx.onerror = function (evt) {
                            callback(evt.target.errorMessage || evt.target.webkitErrorMessage);
                        };
                        tx.oncomplete = function (evt) {
                            callback(null);
                        };
                        store = tx.objectStore(storeName);
                        store.delete(key);
                    }
                });
            });
        };

     // @param {string} key
     // @param {(err, flag)} callback
        exists = function (key, callback) {
            open(function (err, db) {
                var tx, store, request;
                tx = db.transaction([storeName], "readonly");
                store = tx.objectStore(storeName);
                request = store.get(key);
                request.onerror = function (evt) {
                    callback(new Error(evt.target.errorMessage || evt.target.webkitErrorMessage), null);
                };
                request.onsuccess = function (evt) {
                    if (evt.target.result !== undefined) {
                        callback(null, true);
                    } else {
                        callback(null, false);
                    }
                };
            });
        };

     // @param {(err, value)} callback
        keys = function (callback) {
            open(function (err, db) {
                var keys, tx, store, request;
                keys = [];
                tx = db.transaction([storeName], "readonly");
                store = tx.objectStore(storeName);
                request = store.openCursor();
                request.onsuccess = function (evt) {
                    var cursor;
                    cursor = evt.target.result;
                    if (cursor !== null) {
                        keys.push(cursor.key);
                        cursor.continue();
                    } else {
                        callback(null, keys);
                    }
                };
            });
        };

     // @param {(err)} callback
        clear = function (callback) {
            open(function (err, db) {
                var tx, store;
                tx = db.transaction([storeName], "readwrite");
                tx.onerror = function (evt) {
                    callback(evt.target.errorMessage || evt.target.webkitErrorMessage);
                };
                tx.oncomplete = function (evt) {
                    callback(null);
                };
                store = tx.objectStore(storeName);
                store.clear();
            });
        };

        return {
            set: set,
            get: get,
            del: del,
            exists: exists,
            keys: keys,
            clear: clear
        };

    }());

 // Communicate with the TCGA file index.
 // @param {string} query
 // @param {(err, res)} callback
 // @param {object} callback.res SPARQL query results in the SPARQL 1.1 Query Results JSON Format.
    exports.find = find = function (query, callback) {
        var endpoint;
        if (typeof query !== "string") {
            throw new Error("Please provide a query parameter (string).");
        }
        if (typeof callback !== "function") {
            throw new Error("Please provide a callback parameter (function).");
        }
        endpoint = "http://agalpha.mathbiol.org/repositories/tcga?infer=true&query=";
        TCGA.get.sparql(endpoint + encodeURIComponent(query), callback);
    };

    exports.ui = ui = {
     // @param {string} uri
     // @param {[string]} uri
        loadStylesheet: function (uri) {
            if (typeof uri !== "string" && Array.isArray(uri) === false) {
                throw new Error("Please provide a uri parameter (string, or [string]).");
            }
            if (typeof uri === "string") {
                uri = [uri];
            }
            uri.forEach(function (href) {
                $("<link />", {
                    rel: "stylesheet",
                    href: href
                }).appendTo(document.head);
            });
        },
     // @param {string} message Message to be displayed.
     // @param {number} duration Visible time in ms.
        toast: (function () {
            var toaster;
            toaster = function (type, message, duration) {
                var alert;
                duration = duration || 2000;
                alert = $("<div></div>").addClass("alert").addClass(type).hide();
                alert.append(
                    $("<div></div>").addClass("container").text(message)
                );
                $(".navbar").append(alert);
                alert.fadeIn("slow");
                setTimeout(function () {
                    alert.fadeOut("slow", function () {
                        $(this).remove();
                    });
                }, duration);
            };
            return {
                info: function (message, duration) {
                    toaster("alert-info", message, duration);
                },
                success: function (message, duration) {
                    toaster("alert-success", message, duration);
                },
                error: function (message, duration) {
                    toaster("alert-error", message, duration);
                }
            };
        }()),
     // @param {object} options
     // @param {string} options.id The element ID of the tab pane.
     // @param {string} options.title The title of the tab.
     // @param {string} options.content The content of the tab pane.
     // @param {boolean} options.switchTab If true, immediately switch to newly created tab.
     // @param {(err, el)} [callback]
     // @param {DOMElement} callback.el The pane.
        registerTab: function (options, callback) {
            var pane, tab;
         // callback is optional.
            callback = (typeof callback === "function") ? callback : function () {};
         // Add pane.
            pane = $("<div>").attr("id", options.id).addClass("tab-pane").html(options.content);
            $("#end-of-content").before(pane);
         // Add tab.
            tab = $("<a>").attr("href", "#" + options.id).attr("data-toggle", "tab").html(options.title);
            $(".nav").append($("<li>").append(tab));
            if (options.hasOwnProperty("switchTab") && options.switchTab === true) {
                tab.tab("show");
            }
            callback(null, pane[0]);
        }
    };

    exports.version = chrome.app.getDetails().version;

}(this.TCGA = {}));
