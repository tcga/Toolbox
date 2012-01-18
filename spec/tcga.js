describe("TCGA", function () {
    describe("loadScript", function () {
        it("throws if uri is undefined", function () {
            expect(function () {
                TCGA.loadScript();
            }).toThrow(new Error("Please provide a uri parameter [string]."));
        });
        it("throws if uri is not a string", function () {
            expect(function () {
                TCGA.loadScript(4711);
            }).toThrow(new Error("Please provide a uri parameter [string]."));
        });
        it("throws if callback is not a function", function () {
            expect(function () {
                TCGA.loadScript("http://tcga.github.com", 4711);
            }).toThrow(new Error("Please provide a callback parameter [function]."));
        });
        it("fails if the URI is invalid", function () {
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
        it("throws if uri is undefined", function () {
            expect(function () {
                TCGA.get();
            }).toThrow(new Error("Please provide a uri parameter [string]."));
        });
        it("throws if uri is not a string", function () {
            expect(function () {
                TCGA.get(4711);
            }).toThrow(new Error("Please provide a uri parameter [string]."));
        });
        it("throws if callback is undefined", function () {
            expect(function () {
                TCGA.get("http://tcga.github.com");
            }).toThrow(new Error("Please provide a callback parameter [function]."));
        });
        it("throws if callback is not a function", function () {
            expect(function () {
                TCGA.get("http://tcga.github.com", 4711);
            }).toThrow(new Error("Please provide a callback parameter [function]."));
        });
        it("fails if the URI does not point to TCGA", function () {
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
        it("passes if the URI points to TCGA", function () {
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
        it("fails if the URI points to TCGA, but cannot be found", function () {
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
