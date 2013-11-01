var tsa = require('typescript.api');
var path = require('path');
var fs = require('fs');

module.exports = function(builder) {
  builder.hook('before scripts', function(pkg, next) {

    // No scripts field in the component.json file
    if (pkg.config.scripts === undefined) return next();

    // Get all the coffee files from the scripts list
    var ts = pkg.config.scripts.filter(function(file){
      return path.extname(file) === '.ts';
    });

    // No scripts
    if( ts.length === 0 ) return next();
    ts.forEach(function(file, i){
      var realpath = pkg.path(file);
      var str = fs.readFileSync(realpath, 'utf8');
      var sourceUnit = tsa.create("temp.ts", str);
      tsa.compile([sourceUnit],function(compiled){
        compiled = compiled[0].content.replace(/\r\n/g,"\n");
        console.log(compiled)
        var filename = file.replace('.ts', '.js');
        pkg.removeFile('scripts', file);
        pkg.addFile('scripts', filename, compiled);
      });
    });
    next();
  });
};
module.exports.ext = {scripts:['.ts']}
