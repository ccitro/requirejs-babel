// https://github.com/ccitro/requirejs-babel/blob/master/es6.js
// originally: https://github.com/mikach/requirejs-babel/blob/master/es6.js
// cannot be minified before r.js runs - the exclude pragmas are important

var fetchText, _buildMap = {};

//>>excludeStart('excludeBabel', pragmas.excludeBabel)
if (typeof window !== "undefined" && window.navigator && window.document) {
    fetchText = function (url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onreadystatechange = function (evt) {
            //Do not explicitly handle errors, those should be
            //visible via console output in the browser.
            if (xhr.readyState === 4 && xhr.status < 400) {
                callback(xhr.responseText);
            }
        };
        xhr.send(null);
    };
} else if (typeof process !== "undefined" &&
           process.versions &&
           !!process.versions.node) {
    //Using special require.nodeRequire, something added by r.js.
    fs = require.nodeRequire('fs');
    fetchText = function (path, callback) {
        callback(fs.readFileSync(path, 'utf8'));
    };
}
//>>excludeEnd('excludeBabel')

define([
    //>>excludeStart('excludeBabel', pragmas.excludeBabel)
    'babel',
    //>>excludeEnd('excludeBabel')
    'module'
], function(
    //>>excludeStart('excludeBabel', pragmas.excludeBabel)
    babel,
    //>>excludeEnd('excludeBabel')
    _module
    ) {
    return {
        load: function (name, req, onload, config) {
            //>>excludeStart('excludeBabel', pragmas.excludeBabel)
            function applyOptions(options) {
                var defaults = {
                    appendSuffix: true,
                    modules: 'amd',
                    sourceMap: config.isBuild ? false :'inline',
                    sourceFileName: name
                };
                for(var key in options) {
                    if(options.hasOwnProperty(key)) {
                        defaults[key] = options[key];
                    }
                }
                return defaults;
            }
            var options = applyOptions(_module.config());
            var fileName = options.appendSuffix ? name + '.js' : name;
            delete options['appendSuffix'];
            var url = req.toUrl(fileName);

            fetchText(url, function (text) {
                var code = babel.transform(text, options).code;

                if (config.isBuild) {
                    _buildMap[name] = code;
                }

                onload.fromText(code); 
            });
            //>>excludeEnd('excludeBabel')
        },

        write: function (pluginName, moduleName, write) {
            if (moduleName in _buildMap) {
                write.asModule(pluginName + '!' + moduleName, _buildMap[moduleName]);
            }
        }
    }
});
