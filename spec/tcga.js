describe("TCGA", function () {
    describe("loadScript", function () {
        it("should throw if 'uri' is undefined", function () {
            expect(function () {
                TCGA.loadScript();
            }).toThrow(new Error("Please provide a uri parameter [string]."));
        });
        it("should throw if 'uri' is not a string", function () {
            expect(function () {
                TCGA.loadScript(4711);
            }).toThrow(new Error("Please provide a uri parameter [string]."));
        });
        it("should throw if 'callback' is not a function", function () {
            expect(function () {
                TCGA.loadScript("http://tcga.github.com", 4711);
            }).toThrow(new Error("Please provide a callback parameter [function]."));
        });
        it("should fail if the given URI is invalid", function () {
            var callback;
            callback = jasmine.createSpy();
            TCGA.loadScript("ptth://asdf", callback);
            waitsFor(function () {
                return callback.callCount > 0;
            });
            runs(function () {
                expect(callback).toHaveBeenCalledWith({
                    name: "Error",
                    message: "Loading the script failed. The browser log might have more details."
                });
            });
        });
    });
    describe("get", function () {
        it("should throw if 'uri' is undefined", function () {
            expect(function () {
                TCGA.get();
            }).toThrow(new Error("Please provide a uri parameter [string]."));
        });
        it("should throw if 'uri' is not a string", function () {
            expect(function () {
                TCGA.get(4711);
            }).toThrow(new Error("Please provide a uri parameter [string]."));
        });
        it("should throw if 'callback' is undefined", function () {
            expect(function () {
                TCGA.get("http://tcga.github.com");
            }).toThrow(new Error("Please provide a callback parameter [function]."));
        });
        it("should throw if 'callback' is not a function", function () {
            expect(function () {
                TCGA.get("http://tcga.github.com", 4711);
            }).toThrow(new Error("Please provide a callback parameter [function]."));
        });
        it("should fail if the given URI does not point to TCGA", function () {
            var callback;
            callback = jasmine.createSpy();
            TCGA.get("http://tcga.github.com", callback);
            waitsFor(function () {
                return callback.callCount > 0;
            });
            runs(function () {
                expect(callback).toHaveBeenCalledWith({
                    name: "Error",
                    message: "Getting the URI failed. The browser log might have more details."
                }, null);
            });
        });
        it("should pass if the given URI points to TCGA", function () {
            var callback;
            callback = jasmine.createSpy();
            TCGA.get("https://tcga-data.nci.nih.gov/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/", callback);
            waitsFor(function () {
                return callback.callCount > 0;
            });
            runs(function () {
                expect(callback).not.toHaveBeenCalledWith({
                    name: "Error",
                    message: "Getting the URI failed. The browser log might have more details."
                }, null);
            });
        });
        it("should fail if the given URI points to TCGA, but cannot be found", function () {
            var callback;
            callback = jasmine.createSpy();
            TCGA.get("https://tcga-data.nci.nih.gov/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/mostCertainlyA404!", callback);
            waitsFor(function () {
                return callback.callCount > 0;
            });
            runs(function () {
                expect(callback).toHaveBeenCalledWith({
                    name: "Error",
                    message: "Status Code: 404"
                }, null);
            });
        });
    });
});
