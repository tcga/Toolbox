document.querySelector("#module-loader button").addEventListener("click", function (event) {
    var inputBox;
    event.preventDefault();
    inputBox = document.querySelector("#module-loader input");
    TCGA.loadScript(inputBox.value, function (err) {
        if (err) {
            alert("Script loading failed.");
        } else {
            inputBox.value = "";
        }
    });
});
