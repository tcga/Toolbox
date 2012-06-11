(function (global) {
    "use strict";

 // Open tab that is mentioned in the fragment part of the URL.
    if (global.location.hash !== "") {
        $(".nav a[data-toggle='tab'][href='" + global.location.hash + "']").tab("show");
    }

 // Write tab changes into the fragment part of the URL.
    $(".nav a[data-toggle='tab']").on("show", function (e) {
        global.location.hash = e.target.href.split("#")[1];
    });

}(this));
