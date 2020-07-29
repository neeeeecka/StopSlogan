var JavaScriptObfuscator = require("javascript-obfuscator");
var fs = require("fs");

var codes = ["background.js", "content.js"];

codes.forEach(codePath => {
  fs.readFile(codePath, "utf8", function(err, data) {
    var obfuscationResult = JavaScriptObfuscator.obfuscate(data, {
      compact: true,
      simplify: true
    });
    fs.writeFile(
      "build/" + codePath,
      obfuscationResult.getObfuscatedCode(),
      () => {
        console.log("Writing " + codePath);
      }
    );
  });
});
var files = fs.readdirSync("./");
files.forEach(file => {
  if (
    !codes.includes(file) &&
    file != ".git" &&
    file != "build" &&
    file != "node_modules"
  ) {
    fs.copyFile(file, "build/" + file, err => {
      if (err) throw err;
      console.log("Copied " + file);
    });
  }
});
