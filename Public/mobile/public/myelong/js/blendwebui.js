(function () {/**
 * @license almond 0.2.9 Copyright (c) 2011-2014, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice,
        jsSuffixRegExp = /\.js$/;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap, lastIndex,
            foundI, foundStarMap, starI, i, j, part,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that "directory" and not name of the baseName's
                //module. For instance, baseName of "one/two/three", maps to
                //"one/two/three.js", but we want the directory, "one/two" for
                //this normalization.
                baseParts = baseParts.slice(0, baseParts.length - 1);
                name = name.split('/');
                lastIndex = name.length - 1;

                // Node .js allowance:
                if (config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex])) {
                    name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, '');
                }

                name = baseParts.concat(name);

                //start trimDots
                for (i = 0; i < name.length; i += 1) {
                    part = name[i];
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            } else if (name.indexOf('./') === 0) {
                // No baseName, so this is ID is resolved relative
                // to baseUrl, pull off the leading dot.
                name = name.substring(2);
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            return req.apply(undef, aps.call(arguments, 0).concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relName) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i,
            args = [],
            callbackType = typeof callback,
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (callbackType === 'undefined' || callbackType === 'function') {
            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback ? callback.apply(defined[name], args) : undefined;

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (config.deps) {
                req(config.deps, config.callback);
            }
            if (!callback) {
                return;
            }

            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use require('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        return req(cfg);
    };

    /**
     * Expose module registry for debugging and tooling
     */
    requirejs._defined = defined;

    define = function (name, deps, callback) {

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());

define("src/almond", function(){});

define(
    'src/common/lib/lang',['require'],function(require) {

        var lang = {};
        lang.inherits = function(subClass, superClass) {

            var Empty = function() {};
            Empty.prototype = superClass.prototype;
            var selfPrototype = subClass.prototype;
            var proto = subClass.prototype = new Empty();

            for (var key in selfPrototype) {
                proto[key] = selfPrototype[key];//可能出现引用传递的问题
            }
            subClass.prototype.constructor = subClass;
            subClass.superClass = superClass.prototype;

            return subClass;
        };

        lang.clone = function(source) {
            if (!source || typeof source !== 'object') {
                return source;
            }

            var result = source;
            if (u.isArray(source)) {
                result = u.clone(source);
            }
            else if (({}).toString.call(source) === '[object Object]' && ('isPrototypeOf' in source)) {
                result = {};
                for (var key in source) {
                    if (source.hasOwnProperty(key)) {
                        result[key] = lib.deepClone(source[key]);
                    }
                }
            }

            return result;
        };

        lang.extend = function(target, source) {
            for (var pro in source) {
                if (source.hasOwnProperty(pro) && typeof source[pro] != 'undefined') {
                    target[pro] = source[pro];
                }
            }
            return target;
        };
        return lang;
    }
);

define(
    'src/common/lib/string',['require'],function(require) {


        /**
         * @class blend.lib.string
         * @singleton
         * @private
         */

        var string = {};

        /**
         * 以「-」作为分隔符，将单词转换成首字母大写形式
         *
         * @param {string} str
         * @return {string}
         */
        string.toPascal = function(str) {
            if (!str) {
                return '';
            }
            return str.charAt(0).toUpperCase() + string.toCamel(str.slice(1));
        };

        /**
         * 以「-」作为分隔符，将单词转换成驼峰表示
         *
         * @param {string} str
         * @return {string}
         */
        string.toCamel = function(str) {
            if (!str) {
                return '';
            }

            return str.replace(
                /-([a-z])/g,
                function(s) {
                    return s.toUpperCase();
                }
            );
        };
        return string;
    }
);

define(
    'src/common/lib',['require','./lib/lang','./lib/string'],function(require) {


        /**
         * @class blend.lib
         * @singleton
         * @private
         */
        var lib = {};

        var lang = require('./lib/lang');
        var string = require('./lib/string');

        var count = 22;

        /**
         * 获得全局唯一的ID
         *
         * @param {string} prefix 前缀
         */
        lib.getUniqueID = function(prefix) {
            prefix = prefix || 'uniq';
            return prefix + count++;
        };

        lib.noop = function() {};

        /**
         * 变同步为异步，0 delay
         *
         * @param {Object} fn function
         */
        lib.offloadFn = function(fn) {
            setTimeout(fn || lib.noop, 0);
        };

        Array.prototype.contains = function (search){
            for(var i in this){
                if(this[i]==search){
                    return true;
                }
            }
            return false;
        };

        /**
         * string相关的lib方法
         *
         * @class {Object} string
         */
        /**
         * lang相关的lib方法
         *
         * @class {Object} lang
         */
        lang.extend(lib, lang);
        lang.extend(lib, string);

        return lib;

    }
);

define(
    'src/web/configs',['require'],function(require) {

        /**
         * @class configs
         * @private
         * @static
         */

        var configs = {
            cache: true,
            dialogTitle: 'BlendUI',
            dialogBtnOK: '确认',
            dialogBtnCancel: '取消',
            layerClass: 'layer',
            layerMainClass: 'layer-main',
            layersClass: 'layers'
        };

        return configs;

    }

);

define(
    'src/web/events',['require'],function(require) {

        var events = {};
        
        // var white_list = [""];

        var _type = [//原生事件
            'layerCreateSuccess', //layer创建成功
            'layerLoadFinish', //layer 页面载入成功
            'layerPullDown', //下拉刷新loading
            'layerPoped',//layer返回事件
            'tap', //slider点击
            'slide',//slider 滑动切换
            'menuPressed',//菜单建事件
            'layerGoBack',//layer中返回键goBack回调
            'backPressedBeforeExit'//返回键退出事件回调
        ];


        events.on = function(type, callback, id, context) {
            if (typeof context === 'undefined') {
                if (id || this.id) {
                    context = Blend.ui.get(id || this.id).main;
                }else{
                    if (_type.contains(type)) {
                        context = Blend.ui.activeLayer[0];//只选active layer 的dom
                    }else{
                        context = document;
                    }
                    
                }
                
            }

            //继承父类的on事件 FIXME 父类此方法会引起多重绑定的bug
            //细化 web端 事件的处理
            //事件on

            if (typeof callback === 'function') {
                context.addEventListener(type, callback);
            }
      
        };
        //监听一次
        events.once = function(type, callback, id, context) {
            if (typeof context === 'undefined') {
                // context = this.main;
                // context = Blend.ui.get(id || this.id).main;
                if (id || this.id) {
                    context = Blend.ui.get(id || this.id).main;
                }else{
                    context = document;
                }
            }

            //继承父类的on事件 FIXME 父类此方法会引起多重绑定的bug
            // Control.prototype.on(type, callback,(id||this.id) , context);

            //细化 web端 事件的处理
            //事件on

            if (typeof callback === 'function') {

                if (type === "onrender" && this && this.isRender && this.isRender()){
                    callback.apply(context, arguments);
                }else{
                    var cb = function() {
                        callback.apply(context, arguments);
                        context.removeEventListener(type, cb);
                    };
                    context.addEventListener(type, cb);
                }
            }

        };
        //@params id for runtime use,useless for web
        events.off = function(type, callback, id, context) {
            if (typeof context === 'undefined') {
                // context = this.main;
                context = Blend.ui.get(id || this.id).main;
            }
            //继承父类的on事件
            // Control.prototype.off(type, callback,(id||this.id) , context);

            //细化 web端 事件的处理
            //事件off

            if (typeof callback === 'function') {
                context.removeEventListener(type, callback);
            }
        };

        events.fire = function(type, argAry, message, callback,context) {
            //继承父类的fire 事件
            // Control.prototype.fire(type, argAry, context);

            //细化 web端 事件的处理
            //事件 fire,事件可以冒泡
            try {
                var e;
                if (!argAry)argAry = this.id;

                if (typeof argAry === 'undefined') {
                    // console.warn("cant find fire object. ");
                    // argAry = 0;
                    // return ;
                    context = document;
                }

                if (typeof context === 'undefined' && typeof argAry !== 'undefined') {
                    // context = this.main;
                    context = Blend.ui.get(argAry).main;
                }
                var opt = {
                    bubbles: true,
                    cancelable: true,
                    detail: argAry
                };
                if (typeof CustomEvent === 'function') {
                    e = new CustomEvent(type, opt);
                } else {
                    e = document.createEvent('Events');
                    e.initEvent(type, opt.bubbles, opt.cancelable, opt.detail);
                    e.detail = opt.detail;//兼容uc浏览器
                }
                
                if (typeof message !== 'undefined') {
                    e.data = message;
                }

                if (typeof callback === 'function') {
                    callback(e);
                }
                //!!注意 这里的fire 可能在webcontrol里面，也可能在blend.fire 直接触发，所以，不一定有this 方法，
                //仅在webcontrol中调用fire时，有这个方法

                // 触发直接挂在对象上的方法，除了需要冒泡的方法需要注册on事件以外，其他事件一律不需要绑定on 方法
                if (typeof argAry !== 'undefined') {
                    var handler = Blend.ui.get(argAry)[ type];
                    if (typeof handler === 'function') {
                        handler.call(this, e);
                    }
                }
                

                if (context) {
                    context.dispatchEvent(e);
                }

            } catch (ex) {
                console.warn('Events fire errors.please check the runtime environment.', ex.stack);
            }

        };
        return events;
    }
);
/* Zepto v1.1.6 - zepto event ajax form ie - zeptojs.com/license */

var Zepto = (function() {
  var undefined, key, $, classList, emptyArray = [], slice = emptyArray.slice, filter = emptyArray.filter,
    document = window.document,
    elementDisplay = {}, classCache = {},
    cssNumber = { 'column-count': 1, 'columns': 1, 'font-weight': 1, 'line-height': 1,'opacity': 1, 'z-index': 1, 'zoom': 1 },
    fragmentRE = /^\s*<(\w+|!)[^>]*>/,
    singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
    tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
    rootNodeRE = /^(?:body|html)$/i,
    capitalRE = /([A-Z])/g,

    // special attributes that should be get/set via method calls
    methodAttributes = ['val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset'],

    adjacencyOperators = [ 'after', 'prepend', 'before', 'append' ],
    table = document.createElement('table'),
    tableRow = document.createElement('tr'),
    containers = {
      'tr': document.createElement('tbody'),
      'tbody': table, 'thead': table, 'tfoot': table,
      'td': tableRow, 'th': tableRow,
      '*': document.createElement('div')
    },
    readyRE = /complete|loaded|interactive/,
    simpleSelectorRE = /^[\w-]*$/,
    class2type = {},
    toString = class2type.toString,
    zepto = {},
    camelize, uniq,
    tempParent = document.createElement('div'),
    propMap = {
      'tabindex': 'tabIndex',
      'readonly': 'readOnly',
      'for': 'htmlFor',
      'class': 'className',
      'maxlength': 'maxLength',
      'cellspacing': 'cellSpacing',
      'cellpadding': 'cellPadding',
      'rowspan': 'rowSpan',
      'colspan': 'colSpan',
      'usemap': 'useMap',
      'frameborder': 'frameBorder',
      'contenteditable': 'contentEditable'
    },
    isArray = Array.isArray ||
      function(object){ return object instanceof Array }

  zepto.matches = function(element, selector) {
    if (!selector || !element || element.nodeType !== 1) return false
    var matchesSelector = element.webkitMatchesSelector || element.mozMatchesSelector ||
                          element.oMatchesSelector || element.matchesSelector
    if (matchesSelector) return matchesSelector.call(element, selector)
    // fall back to performing a selector:
    var match, parent = element.parentNode, temp = !parent
    if (temp) (parent = tempParent).appendChild(element)
    match = ~zepto.qsa(parent, selector).indexOf(element)
    temp && tempParent.removeChild(element)
    return match
  }

  function type(obj) {
    return obj == null ? String(obj) :
      class2type[toString.call(obj)] || "object"
  }

  function isFunction(value) { return type(value) == "function" }
  function isWindow(obj)     { return obj != null && obj == obj.window }
  function isDocument(obj)   { return obj != null && obj.nodeType == obj.DOCUMENT_NODE }
  function isObject(obj)     { return type(obj) == "object" }
  function isPlainObject(obj) {
    return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype
  }
  function likeArray(obj) { return typeof obj.length == 'number' }

  function compact(array) { return filter.call(array, function(item){ return item != null }) }
  function flatten(array) { return array.length > 0 ? $.fn.concat.apply([], array) : array }
  camelize = function(str){ return str.replace(/-+(.)?/g, function(match, chr){ return chr ? chr.toUpperCase() : '' }) }
  function dasherize(str) {
    return str.replace(/::/g, '/')
           .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
           .replace(/([a-z\d])([A-Z])/g, '$1_$2')
           .replace(/_/g, '-')
           .toLowerCase()
  }
  uniq = function(array){ return filter.call(array, function(item, idx){ return array.indexOf(item) == idx }) }

  function classRE(name) {
    return name in classCache ?
      classCache[name] : (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'))
  }

  function maybeAddPx(name, value) {
    return (typeof value == "number" && !cssNumber[dasherize(name)]) ? value + "px" : value
  }

  function defaultDisplay(nodeName) {
    var element, display
    if (!elementDisplay[nodeName]) {
      element = document.createElement(nodeName)
      document.body.appendChild(element)
      display = getComputedStyle(element, '').getPropertyValue("display")
      element.parentNode.removeChild(element)
      display == "none" && (display = "block")
      elementDisplay[nodeName] = display
    }
    return elementDisplay[nodeName]
  }

  function children(element) {
    return 'children' in element ?
      slice.call(element.children) :
      $.map(element.childNodes, function(node){ if (node.nodeType == 1) return node })
  }

  // `$.zepto.fragment` takes a html string and an optional tag name
  // to generate DOM nodes nodes from the given html string.
  // The generated DOM nodes are returned as an array.
  // This function can be overriden in plugins for example to make
  // it compatible with browsers that don't support the DOM fully.
  zepto.fragment = function(html, name, properties) {
    var dom, nodes, container

    // A special case optimization for a single tag
    if (singleTagRE.test(html)) dom = $(document.createElement(RegExp.$1))

    if (!dom) {
      if (html.replace) html = html.replace(tagExpanderRE, "<$1></$2>")
      if (name === undefined) name = fragmentRE.test(html) && RegExp.$1
      if (!(name in containers)) name = '*'

      container = containers[name]
      container.innerHTML = '' + html
      dom = $.each(slice.call(container.childNodes), function(){
        container.removeChild(this)
      })
    }

    if (isPlainObject(properties)) {
      nodes = $(dom)
      $.each(properties, function(key, value) {
        if (methodAttributes.indexOf(key) > -1) nodes[key](value)
        else nodes.attr(key, value)
      })
    }

    return dom
  }

  // `$.zepto.Z` swaps out the prototype of the given `dom` array
  // of nodes with `$.fn` and thus supplying all the Zepto functions
  // to the array. Note that `__proto__` is not supported on Internet
  // Explorer. This method can be overriden in plugins.
  zepto.Z = function(dom, selector) {
    dom = dom || []
    dom.__proto__ = $.fn
    dom.selector = selector || ''
    return dom
  }

  // `$.zepto.isZ` should return `true` if the given object is a Zepto
  // collection. This method can be overriden in plugins.
  zepto.isZ = function(object) {
    return object instanceof zepto.Z
  }

  // `$.zepto.init` is Zepto's counterpart to jQuery's `$.fn.init` and
  // takes a CSS selector and an optional context (and handles various
  // special cases).
  // This method can be overriden in plugins.
  zepto.init = function(selector, context) {
    var dom
    // If nothing given, return an empty Zepto collection
    if (!selector) return zepto.Z()
    // Optimize for string selectors
    else if (typeof selector == 'string') {
      selector = selector.trim()
      // If it's a html fragment, create nodes from it
      // Note: In both Chrome 21 and Firefox 15, DOM error 12
      // is thrown if the fragment doesn't begin with <
      if (selector[0] == '<' && fragmentRE.test(selector))
        dom = zepto.fragment(selector, RegExp.$1, context), selector = null
      // If there's a context, create a collection on that context first, and select
      // nodes from there
      else if (context !== undefined) return $(context).find(selector)
      // If it's a CSS selector, use it to select nodes.
      else dom = zepto.qsa(document, selector)
    }
    // If a function is given, call it when the DOM is ready
    else if (isFunction(selector)) return $(document).ready(selector)
    // If a Zepto collection is given, just return it
    else if (zepto.isZ(selector)) return selector
    else {
      // normalize array if an array of nodes is given
      if (isArray(selector)) dom = compact(selector)
      // Wrap DOM nodes.
      else if (isObject(selector))
        dom = [selector], selector = null
      // If it's a html fragment, create nodes from it
      else if (fragmentRE.test(selector))
        dom = zepto.fragment(selector.trim(), RegExp.$1, context), selector = null
      // If there's a context, create a collection on that context first, and select
      // nodes from there
      else if (context !== undefined) return $(context).find(selector)
      // And last but no least, if it's a CSS selector, use it to select nodes.
      else dom = zepto.qsa(document, selector)
    }
    // create a new Zepto collection from the nodes found
    return zepto.Z(dom, selector)
  }

  // `$` will be the base `Zepto` object. When calling this
  // function just call `$.zepto.init, which makes the implementation
  // details of selecting nodes and creating Zepto collections
  // patchable in plugins.
  $ = function(selector, context){
    return zepto.init(selector, context)
  }

  function extend(target, source, deep) {
    for (key in source)
      if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
        if (isPlainObject(source[key]) && !isPlainObject(target[key]))
          target[key] = {}
        if (isArray(source[key]) && !isArray(target[key]))
          target[key] = []
        extend(target[key], source[key], deep)
      }
      else if (source[key] !== undefined) target[key] = source[key]
  }

  // Copy all but undefined properties from one or more
  // objects to the `target` object.
  $.extend = function(target){
    var deep, args = slice.call(arguments, 1)
    if (typeof target == 'boolean') {
      deep = target
      target = args.shift()
    }
    args.forEach(function(arg){ extend(target, arg, deep) })
    return target
  }

  // `$.zepto.qsa` is Zepto's CSS selector implementation which
  // uses `document.querySelectorAll` and optimizes for some special cases, like `#id`.
  // This method can be overriden in plugins.
  zepto.qsa = function(element, selector){
    var found,
        maybeID = selector[0] == '#',
        maybeClass = !maybeID && selector[0] == '.',
        nameOnly = maybeID || maybeClass ? selector.slice(1) : selector, // Ensure that a 1 char tag name still gets checked
        isSimple = simpleSelectorRE.test(nameOnly)
    return (isDocument(element) && isSimple && maybeID) ?
      ( (found = element.getElementById(nameOnly)) ? [found] : [] ) :
      (element.nodeType !== 1 && element.nodeType !== 9) ? [] :
      slice.call(
        isSimple && !maybeID ?
          maybeClass ? element.getElementsByClassName(nameOnly) : // If it's simple, it could be a class
          element.getElementsByTagName(selector) : // Or a tag
          element.querySelectorAll(selector) // Or it's not simple, and we need to query all
      )
  }

  function filtered(nodes, selector) {
    return selector == null ? $(nodes) : $(nodes).filter(selector)
  }

  $.contains = document.documentElement.contains ?
    function(parent, node) {
      return parent !== node && parent.contains(node)
    } :
    function(parent, node) {
      while (node && (node = node.parentNode))
        if (node === parent) return true
      return false
    }

  function funcArg(context, arg, idx, payload) {
    return isFunction(arg) ? arg.call(context, idx, payload) : arg
  }

  function setAttribute(node, name, value) {
    value == null ? node.removeAttribute(name) : node.setAttribute(name, value)
  }

  // access className property while respecting SVGAnimatedString
  function className(node, value){
    var klass = node.className || '',
        svg   = klass && klass.baseVal !== undefined

    if (value === undefined) return svg ? klass.baseVal : klass
    svg ? (klass.baseVal = value) : (node.className = value)
  }

  // "true"  => true
  // "false" => false
  // "null"  => null
  // "42"    => 42
  // "42.5"  => 42.5
  // "08"    => "08"
  // JSON    => parse if valid
  // String  => self
  function deserializeValue(value) {
    try {
      return value ?
        value == "true" ||
        ( value == "false" ? false :
          value == "null" ? null :
          +value + "" == value ? +value :
          /^[\[\{]/.test(value) ? $.parseJSON(value) :
          value )
        : value
    } catch(e) {
      return value
    }
  }

  $.type = type
  $.isFunction = isFunction
  $.isWindow = isWindow
  $.isArray = isArray
  $.isPlainObject = isPlainObject

  $.isEmptyObject = function(obj) {
    var name
    for (name in obj) return false
    return true
  }

  $.inArray = function(elem, array, i){
    return emptyArray.indexOf.call(array, elem, i)
  }

  $.camelCase = camelize
  $.trim = function(str) {
    return str == null ? "" : String.prototype.trim.call(str)
  }

  // plugin compatibility
  $.uuid = 0
  $.support = { }
  $.expr = { }

  $.map = function(elements, callback){
    var value, values = [], i, key
    if (likeArray(elements))
      for (i = 0; i < elements.length; i++) {
        value = callback(elements[i], i)
        if (value != null) values.push(value)
      }
    else
      for (key in elements) {
        value = callback(elements[key], key)
        if (value != null) values.push(value)
      }
    return flatten(values)
  }

  $.each = function(elements, callback){
    var i, key
    if (likeArray(elements)) {
      for (i = 0; i < elements.length; i++)
        if (callback.call(elements[i], i, elements[i]) === false) return elements
    } else {
      for (key in elements)
        if (callback.call(elements[key], key, elements[key]) === false) return elements
    }

    return elements
  }

  $.grep = function(elements, callback){
    return filter.call(elements, callback)
  }

  if (window.JSON) $.parseJSON = JSON.parse

  // Populate the class2type map
  $.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
    class2type[ "[object " + name + "]" ] = name.toLowerCase()
  })

  // Define methods that will be available on all
  // Zepto collections
  $.fn = {
    // Because a collection acts like an array
    // copy over these useful array functions.
    forEach: emptyArray.forEach,
    reduce: emptyArray.reduce,
    push: emptyArray.push,
    sort: emptyArray.sort,
    indexOf: emptyArray.indexOf,
    concat: emptyArray.concat,

    // `map` and `slice` in the jQuery API work differently
    // from their array counterparts
    map: function(fn){
      return $($.map(this, function(el, i){ return fn.call(el, i, el) }))
    },
    slice: function(){
      return $(slice.apply(this, arguments))
    },

    ready: function(callback){
      // need to check if document.body exists for IE as that browser reports
      // document ready when it hasn't yet created the body element
      if (readyRE.test(document.readyState) && document.body) callback($)
      else document.addEventListener('DOMContentLoaded', function(){ callback($) }, false)
      return this
    },
    get: function(idx){
      return idx === undefined ? slice.call(this) : this[idx >= 0 ? idx : idx + this.length]
    },
    toArray: function(){ return this.get() },
    size: function(){
      return this.length
    },
    remove: function(){
      return this.each(function(){
        if (this.parentNode != null)
          this.parentNode.removeChild(this)
      })
    },
    each: function(callback){
      emptyArray.every.call(this, function(el, idx){
        return callback.call(el, idx, el) !== false
      })
      return this
    },
    filter: function(selector){
      if (isFunction(selector)) return this.not(this.not(selector))
      return $(filter.call(this, function(element){
        return zepto.matches(element, selector)
      }))
    },
    add: function(selector,context){
      return $(uniq(this.concat($(selector,context))))
    },
    is: function(selector){
      return this.length > 0 && zepto.matches(this[0], selector)
    },
    not: function(selector){
      var nodes=[]
      if (isFunction(selector) && selector.call !== undefined)
        this.each(function(idx){
          if (!selector.call(this,idx)) nodes.push(this)
        })
      else {
        var excludes = typeof selector == 'string' ? this.filter(selector) :
          (likeArray(selector) && isFunction(selector.item)) ? slice.call(selector) : $(selector)
        this.forEach(function(el){
          if (excludes.indexOf(el) < 0) nodes.push(el)
        })
      }
      return $(nodes)
    },
    has: function(selector){
      return this.filter(function(){
        return isObject(selector) ?
          $.contains(this, selector) :
          $(this).find(selector).size()
      })
    },
    eq: function(idx){
      return idx === -1 ? this.slice(idx) : this.slice(idx, + idx + 1)
    },
    first: function(){
      var el = this[0]
      return el && !isObject(el) ? el : $(el)
    },
    last: function(){
      var el = this[this.length - 1]
      return el && !isObject(el) ? el : $(el)
    },
    find: function(selector){
      var result, $this = this
      if (!selector) result = $()
      else if (typeof selector == 'object')
        result = $(selector).filter(function(){
          var node = this
          return emptyArray.some.call($this, function(parent){
            return $.contains(parent, node)
          })
        })
      else if (this.length == 1) result = $(zepto.qsa(this[0], selector))
      else result = this.map(function(){ return zepto.qsa(this, selector) })
      return result
    },
    closest: function(selector, context){
      var node = this[0], collection = false
      if (typeof selector == 'object') collection = $(selector)
      while (node && !(collection ? collection.indexOf(node) >= 0 : zepto.matches(node, selector)))
        node = node !== context && !isDocument(node) && node.parentNode
      return $(node)
    },
    parents: function(selector){
      var ancestors = [], nodes = this
      while (nodes.length > 0)
        nodes = $.map(nodes, function(node){
          if ((node = node.parentNode) && !isDocument(node) && ancestors.indexOf(node) < 0) {
            ancestors.push(node)
            return node
          }
        })
      return filtered(ancestors, selector)
    },
    parent: function(selector){
      return filtered(uniq(this.pluck('parentNode')), selector)
    },
    children: function(selector){
      return filtered(this.map(function(){ return children(this) }), selector)
    },
    contents: function() {
      return this.map(function() { return slice.call(this.childNodes) })
    },
    siblings: function(selector){
      return filtered(this.map(function(i, el){
        return filter.call(children(el.parentNode), function(child){ return child!==el })
      }), selector)
    },
    empty: function(){
      return this.each(function(){ this.innerHTML = '' })
    },
    // `pluck` is borrowed from Prototype.js
    pluck: function(property){
      return $.map(this, function(el){ return el[property] })
    },
    show: function(){
      return this.each(function(){
        this.style.display == "none" && (this.style.display = '')
        if (getComputedStyle(this, '').getPropertyValue("display") == "none")
          this.style.display = defaultDisplay(this.nodeName)
      })
    },
    replaceWith: function(newContent){
      return this.before(newContent).remove()
    },
    wrap: function(structure){
      var func = isFunction(structure)
      if (this[0] && !func)
        var dom   = $(structure).get(0),
            clone = dom.parentNode || this.length > 1

      return this.each(function(index){
        $(this).wrapAll(
          func ? structure.call(this, index) :
            clone ? dom.cloneNode(true) : dom
        )
      })
    },
    wrapAll: function(structure){
      if (this[0]) {
        $(this[0]).before(structure = $(structure))
        var children
        // drill down to the inmost element
        while ((children = structure.children()).length) structure = children.first()
        $(structure).append(this)
      }
      return this
    },
    wrapInner: function(structure){
      var func = isFunction(structure)
      return this.each(function(index){
        var self = $(this), contents = self.contents(),
            dom  = func ? structure.call(this, index) : structure
        contents.length ? contents.wrapAll(dom) : self.append(dom)
      })
    },
    unwrap: function(){
      this.parent().each(function(){
        $(this).replaceWith($(this).children())
      })
      return this
    },
    clone: function(){
      return this.map(function(){ return this.cloneNode(true) })
    },
    hide: function(){
      return this.css("display", "none")
    },
    toggle: function(setting){
      return this.each(function(){
        var el = $(this)
        ;(setting === undefined ? el.css("display") == "none" : setting) ? el.show() : el.hide()
      })
    },
    prev: function(selector){ return $(this.pluck('previousElementSibling')).filter(selector || '*') },
    next: function(selector){ return $(this.pluck('nextElementSibling')).filter(selector || '*') },
    html: function(html){
      return 0 in arguments ?
        this.each(function(idx){
          var originHtml = this.innerHTML
          $(this).empty().append( funcArg(this, html, idx, originHtml) )
        }) :
        (0 in this ? this[0].innerHTML : null)
    },
    text: function(text){
      return 0 in arguments ?
        this.each(function(idx){
          var newText = funcArg(this, text, idx, this.textContent)
          this.textContent = newText == null ? '' : ''+newText
        }) :
        (0 in this ? this[0].textContent : null)
    },
    attr: function(name, value){
      var result
      return (typeof name == 'string' && !(1 in arguments)) ?
        (!this.length || this[0].nodeType !== 1 ? undefined :
          (!(result = this[0].getAttribute(name)) && name in this[0]) ? this[0][name] : result
        ) :
        this.each(function(idx){
          if (this.nodeType !== 1) return
          if (isObject(name)) for (key in name) setAttribute(this, key, name[key])
          else setAttribute(this, name, funcArg(this, value, idx, this.getAttribute(name)))
        })
    },
    removeAttr: function(name){
      return this.each(function(){ this.nodeType === 1 && name.split(' ').forEach(function(attribute){
        setAttribute(this, attribute)
      }, this)})
    },
    prop: function(name, value){
      name = propMap[name] || name
      return (1 in arguments) ?
        this.each(function(idx){
          this[name] = funcArg(this, value, idx, this[name])
        }) :
        (this[0] && this[0][name])
    },
    data: function(name, value){
      var attrName = 'data-' + name.replace(capitalRE, '-$1').toLowerCase()

      var data = (1 in arguments) ?
        this.attr(attrName, value) :
        this.attr(attrName)

      return data !== null ? deserializeValue(data) : undefined
    },
    val: function(value){
      return 0 in arguments ?
        this.each(function(idx){
          this.value = funcArg(this, value, idx, this.value)
        }) :
        (this[0] && (this[0].multiple ?
           $(this[0]).find('option').filter(function(){ return this.selected }).pluck('value') :
           this[0].value)
        )
    },
    offset: function(coordinates){
      if (coordinates) return this.each(function(index){
        var $this = $(this),
            coords = funcArg(this, coordinates, index, $this.offset()),
            parentOffset = $this.offsetParent().offset(),
            props = {
              top:  coords.top  - parentOffset.top,
              left: coords.left - parentOffset.left
            }

        if ($this.css('position') == 'static') props['position'] = 'relative'
        $this.css(props)
      })
      if (!this.length) return null
      var obj = this[0].getBoundingClientRect()
      return {
        left: obj.left + window.pageXOffset,
        top: obj.top + window.pageYOffset,
        width: Math.round(obj.width),
        height: Math.round(obj.height)
      }
    },
    css: function(property, value){
      if (arguments.length < 2) {
        var computedStyle, element = this[0]
        if(!element) return
        computedStyle = getComputedStyle(element, '')
        if (typeof property == 'string')
          return element.style[camelize(property)] || computedStyle.getPropertyValue(property)
        else if (isArray(property)) {
          var props = {}
          $.each(property, function(_, prop){
            props[prop] = (element.style[camelize(prop)] || computedStyle.getPropertyValue(prop))
          })
          return props
        }
      }

      var css = ''
      if (type(property) == 'string') {
        if (!value && value !== 0)
          this.each(function(){ this.style.removeProperty(dasherize(property)) })
        else
          css = dasherize(property) + ":" + maybeAddPx(property, value)
      } else {
        for (key in property)
          if (!property[key] && property[key] !== 0)
            this.each(function(){ this.style.removeProperty(dasherize(key)) })
          else
            css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';'
      }

      return this.each(function(){ this.style.cssText += ';' + css })
    },
    index: function(element){
      return element ? this.indexOf($(element)[0]) : this.parent().children().indexOf(this[0])
    },
    hasClass: function(name){
      if (!name) return false
      return emptyArray.some.call(this, function(el){
        return this.test(className(el))
      }, classRE(name))
    },
    addClass: function(name){
      if (!name) return this
      return this.each(function(idx){
        if (!('className' in this)) return
        classList = []
        var cls = className(this), newName = funcArg(this, name, idx, cls)
        newName.split(/\s+/g).forEach(function(klass){
          if (!$(this).hasClass(klass)) classList.push(klass)
        }, this)
        classList.length && className(this, cls + (cls ? " " : "") + classList.join(" "))
      })
    },
    removeClass: function(name){
      return this.each(function(idx){
        if (!('className' in this)) return
        if (name === undefined) return className(this, '')
        classList = className(this)
        funcArg(this, name, idx, classList).split(/\s+/g).forEach(function(klass){
          classList = classList.replace(classRE(klass), " ")
        })
        className(this, classList.trim())
      })
    },
    toggleClass: function(name, when){
      if (!name) return this
      return this.each(function(idx){
        var $this = $(this), names = funcArg(this, name, idx, className(this))
        names.split(/\s+/g).forEach(function(klass){
          (when === undefined ? !$this.hasClass(klass) : when) ?
            $this.addClass(klass) : $this.removeClass(klass)
        })
      })
    },
    scrollTop: function(value){
      if (!this.length) return
      var hasScrollTop = 'scrollTop' in this[0]
      if (value === undefined) return hasScrollTop ? this[0].scrollTop : this[0].pageYOffset
      return this.each(hasScrollTop ?
        function(){ this.scrollTop = value } :
        function(){ this.scrollTo(this.scrollX, value) })
    },
    scrollLeft: function(value){
      if (!this.length) return
      var hasScrollLeft = 'scrollLeft' in this[0]
      if (value === undefined) return hasScrollLeft ? this[0].scrollLeft : this[0].pageXOffset
      return this.each(hasScrollLeft ?
        function(){ this.scrollLeft = value } :
        function(){ this.scrollTo(value, this.scrollY) })
    },
    position: function() {
      if (!this.length) return

      var elem = this[0],
        // Get *real* offsetParent
        offsetParent = this.offsetParent(),
        // Get correct offsets
        offset       = this.offset(),
        parentOffset = rootNodeRE.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset()

      // Subtract element margins
      // note: when an element has margin: auto the offsetLeft and marginLeft
      // are the same in Safari causing offset.left to incorrectly be 0
      offset.top  -= parseFloat( $(elem).css('margin-top') ) || 0
      offset.left -= parseFloat( $(elem).css('margin-left') ) || 0

      // Add offsetParent borders
      parentOffset.top  += parseFloat( $(offsetParent[0]).css('border-top-width') ) || 0
      parentOffset.left += parseFloat( $(offsetParent[0]).css('border-left-width') ) || 0

      // Subtract the two offsets
      return {
        top:  offset.top  - parentOffset.top,
        left: offset.left - parentOffset.left
      }
    },
    offsetParent: function() {
      return this.map(function(){
        var parent = this.offsetParent || document.body
        while (parent && !rootNodeRE.test(parent.nodeName) && $(parent).css("position") == "static")
          parent = parent.offsetParent
        return parent
      })
    }
  }

  // for now
  $.fn.detach = $.fn.remove

  // Generate the `width` and `height` functions
  ;['width', 'height'].forEach(function(dimension){
    var dimensionProperty =
      dimension.replace(/./, function(m){ return m[0].toUpperCase() })

    $.fn[dimension] = function(value){
      var offset, el = this[0]
      if (value === undefined) return isWindow(el) ? el['inner' + dimensionProperty] :
        isDocument(el) ? el.documentElement['scroll' + dimensionProperty] :
        (offset = this.offset()) && offset[dimension]
      else return this.each(function(idx){
        el = $(this)
        el.css(dimension, funcArg(this, value, idx, el[dimension]()))
      })
    }
  })

  function traverseNode(node, fun) {
    fun(node)
    for (var i = 0, len = node.childNodes.length; i < len; i++)
      traverseNode(node.childNodes[i], fun)
  }

  // Generate the `after`, `prepend`, `before`, `append`,
  // `insertAfter`, `insertBefore`, `appendTo`, and `prependTo` methods.
  adjacencyOperators.forEach(function(operator, operatorIndex) {
    var inside = operatorIndex % 2 //=> prepend, append

    $.fn[operator] = function(){
      // arguments can be nodes, arrays of nodes, Zepto objects and HTML strings
      var argType, nodes = $.map(arguments, function(arg) {
            argType = type(arg)
            return argType == "object" || argType == "array" || arg == null ?
              arg : zepto.fragment(arg)
          }),
          parent, copyByClone = this.length > 1
      if (nodes.length < 1) return this

      return this.each(function(_, target){
        parent = inside ? target : target.parentNode

        // convert all methods to a "before" operation
        target = operatorIndex == 0 ? target.nextSibling :
                 operatorIndex == 1 ? target.firstChild :
                 operatorIndex == 2 ? target :
                 null

        var parentInDocument = $.contains(document.documentElement, parent)

        nodes.forEach(function(node){
          if (copyByClone) node = node.cloneNode(true)
          else if (!parent) return $(node).remove()

          parent.insertBefore(node, target)
          if (parentInDocument) traverseNode(node, function(el){
            if (el.nodeName != null && el.nodeName.toUpperCase() === 'SCRIPT' &&
               (!el.type || el.type === 'text/javascript') && !el.src)
              window['eval'].call(window, el.innerHTML)
          })
        })
      })
    }

    // after    => insertAfter
    // prepend  => prependTo
    // before   => insertBefore
    // append   => appendTo
    $.fn[inside ? operator+'To' : 'insert'+(operatorIndex ? 'Before' : 'After')] = function(html){
      $(html)[operator](this)
      return this
    }
  })

  zepto.Z.prototype = $.fn

  // Export internal API functions in the `$.zepto` namespace
  zepto.uniq = uniq
  zepto.deserializeValue = deserializeValue
  $.zepto = zepto

  return $
})()

window.Zepto = Zepto
window.$ === undefined && (window.$ = Zepto)

;(function($){
  var _zid = 1, undefined,
      slice = Array.prototype.slice,
      isFunction = $.isFunction,
      isString = function(obj){ return typeof obj == 'string' },
      handlers = {},
      specialEvents={},
      focusinSupported = 'onfocusin' in window,
      focus = { focus: 'focusin', blur: 'focusout' },
      hover = { mouseenter: 'mouseover', mouseleave: 'mouseout' }

  specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove = 'MouseEvents'

  function zid(element) {
    return element._zid || (element._zid = _zid++)
  }
  function findHandlers(element, event, fn, selector) {
    event = parse(event)
    if (event.ns) var matcher = matcherFor(event.ns)
    return (handlers[zid(element)] || []).filter(function(handler) {
      return handler
        && (!event.e  || handler.e == event.e)
        && (!event.ns || matcher.test(handler.ns))
        && (!fn       || zid(handler.fn) === zid(fn))
        && (!selector || handler.sel == selector)
    })
  }
  function parse(event) {
    var parts = ('' + event).split('.')
    return {e: parts[0], ns: parts.slice(1).sort().join(' ')}
  }
  function matcherFor(ns) {
    return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)')
  }

  function eventCapture(handler, captureSetting) {
    return handler.del &&
      (!focusinSupported && (handler.e in focus)) ||
      !!captureSetting
  }

  function realEvent(type) {
    return hover[type] || (focusinSupported && focus[type]) || type
  }

  function add(element, events, fn, data, selector, delegator, capture){
    var id = zid(element), set = (handlers[id] || (handlers[id] = []))
    events.split(/\s/).forEach(function(event){
      if (event == 'ready') return $(document).ready(fn)
      var handler   = parse(event)
      handler.fn    = fn
      handler.sel   = selector
      // emulate mouseenter, mouseleave
      if (handler.e in hover) fn = function(e){
        var related = e.relatedTarget
        if (!related || (related !== this && !$.contains(this, related)))
          return handler.fn.apply(this, arguments)
      }
      handler.del   = delegator
      var callback  = delegator || fn
      handler.proxy = function(e){
        e = compatible(e)
        if (e.isImmediatePropagationStopped()) return
        e.data = data
        var result = callback.apply(element, e._args == undefined ? [e] : [e].concat(e._args))
        if (result === false) e.preventDefault(), e.stopPropagation()
        return result
      }
      handler.i = set.length
      set.push(handler)
      if ('addEventListener' in element)
        element.addEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
    })
  }
  function remove(element, events, fn, selector, capture){
    var id = zid(element)
    ;(events || '').split(/\s/).forEach(function(event){
      findHandlers(element, event, fn, selector).forEach(function(handler){
        delete handlers[id][handler.i]
      if ('removeEventListener' in element)
        element.removeEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
      })
    })
  }

  $.event = { add: add, remove: remove }

  $.proxy = function(fn, context) {
    var args = (2 in arguments) && slice.call(arguments, 2)
    if (isFunction(fn)) {
      var proxyFn = function(){ return fn.apply(context, args ? args.concat(slice.call(arguments)) : arguments) }
      proxyFn._zid = zid(fn)
      return proxyFn
    } else if (isString(context)) {
      if (args) {
        args.unshift(fn[context], fn)
        return $.proxy.apply(null, args)
      } else {
        return $.proxy(fn[context], fn)
      }
    } else {
      throw new TypeError("expected function")
    }
  }

  $.fn.bind = function(event, data, callback){
    return this.on(event, data, callback)
  }
  $.fn.unbind = function(event, callback){
    return this.off(event, callback)
  }
  $.fn.one = function(event, selector, data, callback){
    return this.on(event, selector, data, callback, 1)
  }

  var returnTrue = function(){return true},
      returnFalse = function(){return false},
      ignoreProperties = /^([A-Z]|returnValue$|layer[XY]$)/,
      eventMethods = {
        preventDefault: 'isDefaultPrevented',
        stopImmediatePropagation: 'isImmediatePropagationStopped',
        stopPropagation: 'isPropagationStopped'
      }

  function compatible(event, source) {
    if (source || !event.isDefaultPrevented) {
      source || (source = event)

      $.each(eventMethods, function(name, predicate) {
        var sourceMethod = source[name]
        event[name] = function(){
          this[predicate] = returnTrue
          return sourceMethod && sourceMethod.apply(source, arguments)
        }
        event[predicate] = returnFalse
      })

      if (source.defaultPrevented !== undefined ? source.defaultPrevented :
          'returnValue' in source ? source.returnValue === false :
          source.getPreventDefault && source.getPreventDefault())
        event.isDefaultPrevented = returnTrue
    }
    return event
  }

  function createProxy(event) {
    var key, proxy = { originalEvent: event }
    for (key in event)
      if (!ignoreProperties.test(key) && event[key] !== undefined) proxy[key] = event[key]

    return compatible(proxy, event)
  }

  $.fn.delegate = function(selector, event, callback){
    return this.on(event, selector, callback)
  }
  $.fn.undelegate = function(selector, event, callback){
    return this.off(event, selector, callback)
  }

  $.fn.live = function(event, callback){
    $(document.body).delegate(this.selector, event, callback)
    return this
  }
  $.fn.die = function(event, callback){
    $(document.body).undelegate(this.selector, event, callback)
    return this
  }

  $.fn.on = function(event, selector, data, callback, one){
    var autoRemove, delegator, $this = this
    if (event && !isString(event)) {
      $.each(event, function(type, fn){
        $this.on(type, selector, data, fn, one)
      })
      return $this
    }

    if (!isString(selector) && !isFunction(callback) && callback !== false)
      callback = data, data = selector, selector = undefined
    if (isFunction(data) || data === false)
      callback = data, data = undefined

    if (callback === false) callback = returnFalse

    return $this.each(function(_, element){
      if (one) autoRemove = function(e){
        remove(element, e.type, callback)
        return callback.apply(this, arguments)
      }

      if (selector) delegator = function(e){
        var evt, match = $(e.target).closest(selector, element).get(0)
        if (match && match !== element) {
          evt = $.extend(createProxy(e), {currentTarget: match, liveFired: element})
          return (autoRemove || callback).apply(match, [evt].concat(slice.call(arguments, 1)))
        }
      }

      add(element, event, callback, data, selector, delegator || autoRemove)
    })
  }
  $.fn.off = function(event, selector, callback){
    var $this = this
    if (event && !isString(event)) {
      $.each(event, function(type, fn){
        $this.off(type, selector, fn)
      })
      return $this
    }

    if (!isString(selector) && !isFunction(callback) && callback !== false)
      callback = selector, selector = undefined

    if (callback === false) callback = returnFalse

    return $this.each(function(){
      remove(this, event, callback, selector)
    })
  }

  $.fn.trigger = function(event, args){
    event = (isString(event) || $.isPlainObject(event)) ? $.Event(event) : compatible(event)
    event._args = args
    return this.each(function(){
      // handle focus(), blur() by calling them directly
      if (event.type in focus && typeof this[event.type] == "function") this[event.type]()
      // items in the collection might not be DOM elements
      else if ('dispatchEvent' in this) this.dispatchEvent(event)
      else $(this).triggerHandler(event, args)
    })
  }

  // triggers event handlers on current element just as if an event occurred,
  // doesn't trigger an actual event, doesn't bubble
  $.fn.triggerHandler = function(event, args){
    var e, result
    this.each(function(i, element){
      e = createProxy(isString(event) ? $.Event(event) : event)
      e._args = args
      e.target = element
      $.each(findHandlers(element, event.type || event), function(i, handler){
        result = handler.proxy(e)
        if (e.isImmediatePropagationStopped()) return false
      })
    })
    return result
  }

  // shortcut methods for `.bind(event, fn)` for each event type
  ;('focusin focusout focus blur load resize scroll unload click dblclick '+
  'mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave '+
  'change select keydown keypress keyup error').split(' ').forEach(function(event) {
    $.fn[event] = function(callback) {
      return (0 in arguments) ?
        this.bind(event, callback) :
        this.trigger(event)
    }
  })

  $.Event = function(type, props) {
    if (!isString(type)) props = type, type = props.type
    var event = document.createEvent(specialEvents[type] || 'Events'), bubbles = true
    if (props) for (var name in props) (name == 'bubbles') ? (bubbles = !!props[name]) : (event[name] = props[name])
    event.initEvent(type, bubbles, true)
    return compatible(event)
  }

})(Zepto)

;(function($){
  var jsonpID = 0,
      document = window.document,
      key,
      name,
      rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      scriptTypeRE = /^(?:text|application)\/javascript/i,
      xmlTypeRE = /^(?:text|application)\/xml/i,
      jsonType = 'application/json',
      htmlType = 'text/html',
      blankRE = /^\s*$/,
      originAnchor = document.createElement('a')

  originAnchor.href = window.location.href

  // trigger a custom event and return false if it was cancelled
  function triggerAndReturn(context, eventName, data) {
    var event = $.Event(eventName)
    $(context).trigger(event, data)
    return !event.isDefaultPrevented()
  }

  // trigger an Ajax "global" event
  function triggerGlobal(settings, context, eventName, data) {
    if (settings.global) return triggerAndReturn(context || document, eventName, data)
  }

  // Number of active Ajax requests
  $.active = 0

  function ajaxStart(settings) {
    if (settings.global && $.active++ === 0) triggerGlobal(settings, null, 'ajaxStart')
  }
  function ajaxStop(settings) {
    if (settings.global && !(--$.active)) triggerGlobal(settings, null, 'ajaxStop')
  }

  // triggers an extra global event "ajaxBeforeSend" that's like "ajaxSend" but cancelable
  function ajaxBeforeSend(xhr, settings) {
    var context = settings.context
    if (settings.beforeSend.call(context, xhr, settings) === false ||
        triggerGlobal(settings, context, 'ajaxBeforeSend', [xhr, settings]) === false)
      return false

    triggerGlobal(settings, context, 'ajaxSend', [xhr, settings])
  }
  function ajaxSuccess(data, xhr, settings, deferred) {
    var context = settings.context, status = 'success'
    settings.success.call(context, data, status, xhr)
    if (deferred) deferred.resolveWith(context, [data, status, xhr])
    triggerGlobal(settings, context, 'ajaxSuccess', [xhr, settings, data])
    ajaxComplete(status, xhr, settings)
  }
  // type: "timeout", "error", "abort", "parsererror"
  function ajaxError(error, type, xhr, settings, deferred) {
    var context = settings.context
    settings.error.call(context, xhr, type, error)
    if (deferred) deferred.rejectWith(context, [xhr, type, error])
    triggerGlobal(settings, context, 'ajaxError', [xhr, settings, error || type])
    ajaxComplete(type, xhr, settings)
  }
  // status: "success", "notmodified", "error", "timeout", "abort", "parsererror"
  function ajaxComplete(status, xhr, settings) {
    var context = settings.context
    settings.complete.call(context, xhr, status)
    triggerGlobal(settings, context, 'ajaxComplete', [xhr, settings])
    ajaxStop(settings)
  }

  // Empty function, used as default callback
  function empty() {}

  $.ajaxJSONP = function(options, deferred){
    if (!('type' in options)) return $.ajax(options)

    var _callbackName = options.jsonpCallback,
      callbackName = ($.isFunction(_callbackName) ?
        _callbackName() : _callbackName) || ('jsonp' + (++jsonpID)),
      script = document.createElement('script'),
      originalCallback = window[callbackName],
      responseData,
      abort = function(errorType) {
        $(script).triggerHandler('error', errorType || 'abort')
      },
      xhr = { abort: abort }, abortTimeout

    if (deferred) deferred.promise(xhr)

    $(script).on('load error', function(e, errorType){
      clearTimeout(abortTimeout)
      $(script).off().remove()

      if (e.type == 'error' || !responseData) {
        ajaxError(null, errorType || 'error', xhr, options, deferred)
      } else {
        ajaxSuccess(responseData[0], xhr, options, deferred)
      }

      window[callbackName] = originalCallback
      if (responseData && $.isFunction(originalCallback))
        originalCallback(responseData[0])

      originalCallback = responseData = undefined
    })

    if (ajaxBeforeSend(xhr, options) === false) {
      abort('abort')
      return xhr
    }

    window[callbackName] = function(){
      responseData = arguments
    }

    script.src = options.url.replace(/\?(.+)=\?/, '?$1=' + callbackName)
    document.head.appendChild(script)

    if (options.timeout > 0) abortTimeout = setTimeout(function(){
      abort('timeout')
    }, options.timeout)

    return xhr
  }

  $.ajaxSettings = {
    // Default type of request
    type: 'GET',
    // Callback that is executed before request
    beforeSend: empty,
    // Callback that is executed if the request succeeds
    success: empty,
    // Callback that is executed the the server drops error
    error: empty,
    // Callback that is executed on request complete (both: error and success)
    complete: empty,
    // The context for the callbacks
    context: null,
    // Whether to trigger "global" Ajax events
    global: true,
    // Transport
    xhr: function () {
      return new window.XMLHttpRequest()
    },
    // MIME types mapping
    // IIS returns Javascript as "application/x-javascript"
    accepts: {
      script: 'text/javascript, application/javascript, application/x-javascript',
      json:   jsonType,
      xml:    'application/xml, text/xml',
      html:   htmlType,
      text:   'text/plain'
    },
    // Whether the request is to another domain
    crossDomain: false,
    // Default timeout
    timeout: 0,
    // Whether data should be serialized to string
    processData: true,
    // Whether the browser should be allowed to cache GET responses
    cache: true
  }

  function mimeToDataType(mime) {
    if (mime) mime = mime.split(';', 2)[0]
    return mime && ( mime == htmlType ? 'html' :
      mime == jsonType ? 'json' :
      scriptTypeRE.test(mime) ? 'script' :
      xmlTypeRE.test(mime) && 'xml' ) || 'text'
  }

  function appendQuery(url, query) {
    if (query == '') return url
    return (url + '&' + query).replace(/[&?]{1,2}/, '?')
  }

  // serialize payload and append it to the URL for GET requests
  function serializeData(options) {
    if (options.processData && options.data && $.type(options.data) != "string")
      options.data = $.param(options.data, options.traditional)
    if (options.data && (!options.type || options.type.toUpperCase() == 'GET'))
      options.url = appendQuery(options.url, options.data), options.data = undefined
  }

  $.ajax = function(options){
    var settings = $.extend({}, options || {}),
        deferred = $.Deferred && $.Deferred(),
        urlAnchor
    for (key in $.ajaxSettings) if (settings[key] === undefined) settings[key] = $.ajaxSettings[key]

    ajaxStart(settings)

    if (!settings.crossDomain) {
      urlAnchor = document.createElement('a')
      urlAnchor.href = settings.url
      urlAnchor.href = urlAnchor.href
      settings.crossDomain = (originAnchor.protocol + '//' + originAnchor.host) !== (urlAnchor.protocol + '//' + urlAnchor.host)
    }

    if (!settings.url) settings.url = window.location.toString()
    serializeData(settings)

    var dataType = settings.dataType, hasPlaceholder = /\?.+=\?/.test(settings.url)
    if (hasPlaceholder) dataType = 'jsonp'

    if (settings.cache === false || (
         (!options || options.cache !== true) &&
         ('script' == dataType || 'jsonp' == dataType)
        ))
      settings.url = appendQuery(settings.url, '_=' + Date.now())

    if ('jsonp' == dataType) {
      if (!hasPlaceholder)
        settings.url = appendQuery(settings.url,
          settings.jsonp ? (settings.jsonp + '=?') : settings.jsonp === false ? '' : 'callback=?')
      return $.ajaxJSONP(settings, deferred)
    }

    var mime = settings.accepts[dataType],
        headers = { },
        setHeader = function(name, value) { headers[name.toLowerCase()] = [name, value] },
        protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
        xhr = settings.xhr(),
        nativeSetHeader = xhr.setRequestHeader,
        abortTimeout

    if (deferred) deferred.promise(xhr)

    if (!settings.crossDomain) setHeader('X-Requested-With', 'XMLHttpRequest')
    setHeader('Accept', mime || '*/*')
    if (mime = settings.mimeType || mime) {
      if (mime.indexOf(',') > -1) mime = mime.split(',', 2)[0]
      xhr.overrideMimeType && xhr.overrideMimeType(mime)
    }
    if (settings.contentType || (settings.contentType !== false && settings.data && settings.type.toUpperCase() != 'GET'))
      setHeader('Content-Type', settings.contentType || 'application/x-www-form-urlencoded')

    if (settings.headers) for (name in settings.headers) setHeader(name, settings.headers[name])
    xhr.setRequestHeader = setHeader

    xhr.onreadystatechange = function(){
      if (xhr.readyState == 4) {
        xhr.onreadystatechange = empty
        clearTimeout(abortTimeout)
        var result, error = false
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
          dataType = dataType || mimeToDataType(settings.mimeType || xhr.getResponseHeader('content-type'))
          result = xhr.responseText

          try {
            // http://perfectionkills.com/global-eval-what-are-the-options/
            if (dataType == 'script')    (1,eval)(result)
            else if (dataType == 'xml')  result = xhr.responseXML
            else if (dataType == 'json') result = blankRE.test(result) ? null : $.parseJSON(result)
          } catch (e) { error = e }

          if (error) ajaxError(error, 'parsererror', xhr, settings, deferred)
          else ajaxSuccess(result, xhr, settings, deferred)
        } else {
          ajaxError(xhr.statusText || null, xhr.status ? 'error' : 'abort', xhr, settings, deferred)
        }
      }
    }

    if (ajaxBeforeSend(xhr, settings) === false) {
      xhr.abort()
      ajaxError(null, 'abort', xhr, settings, deferred)
      return xhr
    }

    if (settings.xhrFields) for (name in settings.xhrFields) xhr[name] = settings.xhrFields[name]

    var async = 'async' in settings ? settings.async : true
    xhr.open(settings.type, settings.url, async, settings.username, settings.password)

    for (name in headers) nativeSetHeader.apply(xhr, headers[name])

    if (settings.timeout > 0) abortTimeout = setTimeout(function(){
        xhr.onreadystatechange = empty
        xhr.abort()
        ajaxError(null, 'timeout', xhr, settings, deferred)
      }, settings.timeout)

    // avoid sending empty string (#319)
    xhr.send(settings.data ? settings.data : null)
    return xhr
  }

  // handle optional data/success arguments
  function parseArguments(url, data, success, dataType) {
    if ($.isFunction(data)) dataType = success, success = data, data = undefined
    if (!$.isFunction(success)) dataType = success, success = undefined
    return {
      url: url
    , data: data
    , success: success
    , dataType: dataType
    }
  }

  $.get = function(/* url, data, success, dataType */){
    return $.ajax(parseArguments.apply(null, arguments))
  }

  $.post = function(/* url, data, success, dataType */){
    var options = parseArguments.apply(null, arguments)
    options.type = 'POST'
    return $.ajax(options)
  }

  $.getJSON = function(/* url, data, success */){
    var options = parseArguments.apply(null, arguments)
    options.dataType = 'json'
    return $.ajax(options)
  }

  $.fn.load = function(url, data, success){
    if (!this.length) return this
    var self = this, parts = url.split(/\s/), selector,
        options = parseArguments(url, data, success),
        callback = options.success
    if (parts.length > 1) options.url = parts[0], selector = parts[1]
    options.success = function(response){
      self.html(selector ?
        $('<div>').html(response.replace(rscript, "")).find(selector)
        : response)
      callback && callback.apply(self, arguments)
    }
    $.ajax(options)
    return this
  }

  var escape = encodeURIComponent

  function serialize(params, obj, traditional, scope){
    var type, array = $.isArray(obj), hash = $.isPlainObject(obj)
    $.each(obj, function(key, value) {
      type = $.type(value)
      if (scope) key = traditional ? scope :
        scope + '[' + (hash || type == 'object' || type == 'array' ? key : '') + ']'
      // handle data in serializeArray() format
      if (!scope && array) params.add(value.name, value.value)
      // recurse into nested objects
      else if (type == "array" || (!traditional && type == "object"))
        serialize(params, value, traditional, key)
      else params.add(key, value)
    })
  }

  $.param = function(obj, traditional){
    var params = []
    params.add = function(key, value) {
      if ($.isFunction(value)) value = value()
      if (value == null) value = ""
      this.push(escape(key) + '=' + escape(value))
    }
    serialize(params, obj, traditional)
    return params.join('&').replace(/%20/g, '+')
  }
})(Zepto)

;(function($){
  $.fn.serializeArray = function() {
    var name, type, result = [],
      add = function(value) {
        if (value.forEach) return value.forEach(add)
        result.push({ name: name, value: value })
      }
    if (this[0]) $.each(this[0].elements, function(_, field){
      type = field.type, name = field.name
      if (name && field.nodeName.toLowerCase() != 'fieldset' &&
        !field.disabled && type != 'submit' && type != 'reset' && type != 'button' && type != 'file' &&
        ((type != 'radio' && type != 'checkbox') || field.checked))
          add($(field).val())
    })
    return result
  }

  $.fn.serialize = function(){
    var result = []
    this.serializeArray().forEach(function(elm){
      result.push(encodeURIComponent(elm.name) + '=' + encodeURIComponent(elm.value))
    })
    return result.join('&')
  }

  $.fn.submit = function(callback) {
    if (0 in arguments) this.bind('submit', callback)
    else if (this.length) {
      var event = $.Event('submit')
      this.eq(0).trigger(event)
      if (!event.isDefaultPrevented()) this.get(0).submit()
    }
    return this
  }

})(Zepto)

;(function($){
  // __proto__ doesn't exist on IE<11, so redefine
  // the Z function to use object extension instead
  if (!('__proto__' in {})) {
    $.extend($.zepto, {
      Z: function(dom, selector){
        dom = dom || []
        $.extend(dom, $.fn)
        dom.selector = selector || ''
        dom.__Z = true
        return dom
      },
      // this is a kludge but works
      isZ: function(object){
        return $.type(object) === 'array' && '__Z' in object
      }
    })
  }

  // getComputedStyle shouldn't freak out when called
  // without a valid element as argument
  try {
    getComputedStyle(undefined)
  } catch(e) {
    var nativeGetComputedStyle = getComputedStyle;
    window.getComputedStyle = function(element){
      try {
        return nativeGetComputedStyle(element)
      } catch(e) {
        return null
      }
    }
  }
})(Zepto)
;
define("usecase/js/lib/zepto.js", function(){});

define(
    'src/web/api',['require'],function(require) {

        var api = {};
        var noop = function(){};

        // var events = require('./events');
        // var layerapi = require('./layer/layerapi');
        // var blend = require('./blend');

        // api.core={};
        // api.core.removeSplashScreen = noop;

        // api.layer = {};
        // api.layer.on = events.on;
        // api.layer.off = events.off;
        // api.layer.fire = events.fire;
        // api.layer.once = events.once;

        api.layerStopRefresh = function(id){
            if (!id) {//默认使用active layer的id
                id = Blend.ui.activeLayer.attr("data-blend-id") || '0';
            }
            Blend.ui.get(id).endPullRefresh();
            // layerapi.endPullRefresh(Blend.ui.get(id));
        };

        api.layerBack = function(id){
            if (!id) {//默认使用active layer的id
                id = Blend.ui.activeLayer.attr("data-blend-id") || '0';
            }
            // layerapi.endPullRefresh(Blend.ui.get(id));

            Blend.ui.get(id).out();
        };

        api.removeSplashScreen = noop;

        return api;

    }
);
define('src/web/blend',["require",'./../common/lib',"./configs","./events",'../../usecase/js/lib/zepto.js','./api'],
    function(require) {
        var lib = require('./../common/lib');
        var configs = require('./configs');
        var events = require('./events');

        // require('../../third_party/jquery-2.1.1.js');

        /**
         * @class blend
         * @singleton
         */
        var blend = {};
        var controls = {};
        var cbs={};//临时存储，blend.layerInit 的 layerId对应的执行函数


        /**
         * 版本信息
         *
         * @property {String} version info
         */
        blend.version = 'alpha';

        /**
         * 开放的Api接口entend到blend中
         *
         * @property {Object} Api接口
         */

        // blend.api = require('./api');
        lib.extend(blend,require('./api'));


        // {};
        // //main.api.core.removeSplashScreen
        // var noop = function(){};
        // blend.api.core={};
        // blend.api.core.removeSplashScreen = noop;

        // blend.api.layer = {};
        // blend.api.layer.on = events.on;
        // blend.api.layer.off = events.off;
        // blend.api.layer.fire = events.fire;
        // blend.api.layer.once = events.once;

        // blend.api.layerStopRefresh = function(id){
        //     Layer.prototype.endPullRefresh(blend.get(id));
        // };

        
        
        /**
         * 开放的Api接口entend到blend中
         *
         * @property {Object} Api接口
         */
        blend.layerInit = function(layerId,callback){
            
            cbs[layerId] = callback;

            if (blend.get(layerId) && blend.get(layerId).isRender() ){
                callback && callback.call(blend.get(layerId),blend.get(layerId).main);
            }
        };
        $(document).on("onrender",function(eve){
            if (eve.detail && cbs[eve.detail]) {
                //native 无法传递 layer 对象，所以无法使用 this
                cbs[eve.detail].call(blend.get(eve.detail),blend.get(eve.detail).main);
                
            }
            if (blend.get(eve.detail)) {
                blend.get(eve.detail).isRender(true);
            }
            
        });

        blend.ready = function(cb){
            if (/complete|loaded|interactive/.test(document.readyState) && document.body) 
                cb();
            else 
                $(document).on('DOMContentLoaded', function(){ cb(); }, false);
        };
        blend.ready(function(){
            events.fire("blendready");
            /**
             * 当前的active apge 记录到blend中
             *
             * @property {Object} activeLayer
             */
            blend.activeLayer = $('.page');
        });


        /**
         * 是否处于Runtime环境中
         *
         * @property {boolean} inRuntime
         */
        blend.inRuntime = function() {
            return false;
        };//runtime.inRuntime();


        var config = {
            DOMPrefix: 'data-ui',
            classPrefix: {
                'ui' : 'ui',
                'skin' : 'skin',
                'state' : 'state'
            }
        };


        /**
         * 设置config
         *
         * @property {Object} info
         */
        blend.config = function(info) {
            lib.extend(config, info);
        };

        /**
         * 获取config
         *
         * @property {String} name
         */
        blend.getConfig = function(name) {
            return config[name];
        };

        /**
         * 获取currentLayerid
         *
         * @property {String} name
         */
        
        blend.getLayerId = function(){
            return Blend.ui.activeLayer.attr("data-blend-id");
        };

        /**
         * 从ID获取Control
         *
         * @param {String} element
         *
         * @return {Control} control
         */
        blend.getUI = function(element) {
            element = $(element)[0];
            do {
                //如果元素是document
                if (!element || element.nodeType == 9) {
                    return null;
                }
                if (element.getAttribute('data-blend')) {
                    return controls[element.getAttribute('data-blend-id')];
                }
            }while ((element = element.parentNode) != document.body);
        };

        /**
         * 注册控件到系统中
         *
         * @param {Control} control 控件实例
         * @return null
         */
        blend.register = function(control) {
            console.log('reg: ' + control.id);
            controls[control.id] = control;
        };

        /**
         * 注销控件
         *
         * @param {Control} control 控件实例
         * @return null
         */
        blend.cancel = function(control) {
            //console.log("reg: " + control.id);
            delete controls[control.id];
        };

        blend.create = function(type, options) {

        };
        blend.canGoBack = function(){
            return blend.layerStack.length;
        };

        /**
         * 根据id获取实例
         *
         * @param {string} id 控件id
         * @return {Control}
         */
        blend.get = function(id) {
            if (id === "0") {
                if (!controls[id]) {
                    controls[id] = new blend.Layer({id:"0"});
                    if ($(".page").length){
                        controls[id].main = $(".page")[0];
                    }else{
                        console.warn(" '0' page need to have classes .pages>.page>.page-content ");
                    }
                    
                }
            }
            return controls[id];
        };

        blend.on = events.on;
        blend.once = events.once;
        blend.off = events.off;
        blend.fire = events.fire;

        /**
        * 添加运行版本判断
        *
        */
        (function(){
            var ua = navigator.userAgent;

            var android = ua.match(/(Android);?[\s\/]+([\d.]+)?/);
            var ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
            var ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/);
            var iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/);

            // Android
            if (android) {
                $("html").addClass('android');
            }
            // iOS
            if (ipad || iphone || ipod) {
                $("html").addClass('ios');
            }
            if (iphone || ipod) {
                $("html").addClass('iphone');
            }
            if (ipad) {
                $("html").addClass('ipad');
            }

            
        })();

        blend.layerStack = [];
        

        blend.configs = configs;

        return blend;
    }
);

define(

    /**
     * @class Control
     * @inheritable
     */

    'src/web/Control',['require','./../common/lib','./blend'],function(require) {
        var lib = require('./../common/lib');
        var blend = require('./blend');
        var isRuntimeEnv = false;//main.inRuntime();//runtime.isRuntimeEnv&&runtime.isRuntimeEnv();

        function Control(options) {
            options = options || {};
            var me = this;

            if (!this.id) {
                this.id = options.id || lib.getUniqueID();
            }
            this.url = options.url||"";
            
            this.main = options.main ? this.setMainAttr(options.main) : this.initMain(options);

            this.initOptions(options);

            blend.register(this);

            this.currentStates = {};
            this._listener = {};


            //this.fire('init');
        }

        Control.prototype = {
            constructor: Control,
            // nativeObj: {},
            currentStates: null,//防止引用传递
            //已知state
            //slidein 

            
            /**
             * 事件存储数组
             * @private
             * @property {Object} _listener
             */
            _listener: null,


            /**
             * 组件的类型
             *
             * @cfg {String} type
             */
            //type : "layerGroup",

            /**
             * 组件的id
             *
             * @cfg {String} id
             */
            //id : "layerGroup",

            /**
             * 获取当前组件的类型
             */
            getType: function() {
                //layout, layer, component, navbar
                return this.type || 'control';
            },

            /**
             * @protected
             * 初始化所有options
             */
            initOptions: function(options) {
                options = options || {};
                this.setProperties(options);
            },


            /**
             * 初始化Main元素并返回
             * @return {Object} DOM
             */
            initMain: function() {
                var main = document.createElement('div');

                this.setMainAttr(main);
                
                return main;
            },

            setMainAttr: function(main) {
                if (!main) {
                    return false;
                }
                // main = main;
                main.setAttribute('data-blend', this.getType());
                main.setAttribute('data-blend-id', this.id);

                if (this.url) {
                    main.setAttribute('data-url',this.url);
                }
                

                // 为控件主元素添加id
                // if (!main.id || ) {// 可能有clone node的出现，所以这里layer的id不会被复用，全部新生成
                    main.id = lib.getUniqueID();
                // }

                //for web set default css
                //layer 可以添加page
                // $(main).addClass("page");
                //Dialog 可以添加 modal

                return main;
            },

            /**
             * 渲染Control，可以是DOM也可以是Native，一般来说，子控件不继承此方法，而是实现paint方法
             */
            render: function() {
                //created, webviewready, pageonload, disposed
                // 判断是否render了,autoload的会自动render，否则不会
                if (this.hasState("got")|| this.hasState("get")) {// ['','get','got']
                    // this.render();//auto has get state
                    return ;
                }
                
                this.addState("get");//会在render后变成got
                
                this.fire('beforerender', this.id);

                var me = this;
                //子控件实现这个, render 成功与否在paint里面实现
                //异步调用
                me.fire('onload', this.id);
                
                me.paint();

                return this.main;
            },


            paint: function(cb, fail) {

            },

            appendTo: function(DOM) {
                this.main.appendChild(DOM);
            },

            insertBefore: function(DOMorControl) {
                this.main.parentNode.insertBefore(DOMorControl, this.main);
            },

            /**
             * 把自己从dom中移除，包括事件，但不销毁自身实例
             */
            dispose: function() {
                this.fire('beforedestroy');

                //FIXME! event should destroy too.
                // Control.prototype.off("type",this.id , this.main);

                if (isRuntimeEnv) {
                    // runtime[this.type].destroy( this.id );
                }else {
                    //TODO events should delete
                    // delete this.main;


                }
                this.fire('afterdestroy');
            },

            /**
             * 清除所有DOM Events
             */
            clearDOMEvents: function() {

            },

            /**
             * 销毁自身
             */
            destroy: function() {
                this.dispose();
                blend.cancel(this);

                //引入 $
                $(this.main).remove();
            },
            /**
             *
             * 获取属性
             * @param {string} name 属性名
             */
            get: function(name) {
                var method = this['get' + lib.toPascal(name)];

                if (typeof method == 'function') {
                    return method.call(this);
                }

                return this[name];
            },
            /**
             * 设置控件的属性值
             *
             * @param {string} name 属性名
             * @param {Mixed} value 属性值
             */
            set: function(name, value) {
                var method = this['set' + lib.toPascal(name)];

                if (typeof method == 'function') {
                    return method.call(this, value);
                }

                var property = {};
                property[name] = value;
                this.setProperties(property);
            },

            /**
             * 设置属性
             */
            setProperties: function(properties) {
                //todo: 可能某些属性发生变化，要重新渲染页面或者调起runtime
                lib.extend(this, properties);
            },

            /**
             * 禁用控件
             */
            disable: function() {
                this.addState('disabled');
            },

            /**
             * 启用控件
             */
            enable: function() {
                this.removeState('disabled');
            },

            /**
             * 判断控件是否不可用
             */
            isDisabled: function() {
                return this.hasState('disabled');
            },
            setUrl: function(url) {
                this.url = url;
                this.main.setAttribute("data-url",url);
            },
            /**
             * 显示控件
             */
            // in : function() {
            //     this.removeState('hidden');
            //     this.fire('show');
            // },

            // /**
            //  * 隐藏控件
            //  */
            // out: function() {
            //     this.addState('hidden');
            //     this.fire('hide');
            // },

            // *
            //  * 切换控件的显隐状态
             
            // toggle: function() {
            //     this[this.isHidden() ? 'in' : 'out']();
            // },
            // /**
            //  * 判断控件是否隐藏
            //  */
            // isHidden: function() {
            //     return this.hasState('hidden');
            // },

            /**
             * 为控件添加状态
             *
             * @param {string} state 状态名
             */
            addState: function(state) {
                if (!this.hasState(state)) {
                    this.currentStates[state] = true;
                }
            },
            /**
             * 移除控件的状态
             *
             * @param {String} state 状态名
             */
            removeState: function(state) {
                if (this.hasState(state)) {
                    delete this.currentStates[state];
                }
            },
            /**
             * 开关控件的状态
             * @param {String} state 状态名
             */
            toggleState: function(state) {
                var methodName = this.hasState(state) ? 'removeState' : 'addState';
                this[methodName](state);
            },

            /**
             * 判断当前控件是否处于某状态
             * @param {String} state 状态名
             * @return Boolean
             */
            hasState: function(state) {
                if (typeof state === 'string') {
                    return !!this.currentStates[state];
                }else{
                    var hasstate = false;
                    var _this = this;
                    var found = state.filter(function(key){
                        return _this.currentStates[key];
                    });
                    return found.length?found:false;
                }
                
            },

            /**
             * 注册事件
             * @param {string} type 事件名字
             * @param {Function} callback 绑定的回调函数
             */
            on: function(type, callback) {
                var t = this;
                if (!t._listener[type]) {
                    t._listener[type] = [];
                }
                t._listener[type].push(callback);
            },
            /**
             * 解绑事件
             * @param {string} type 事件名字
             * @param {Function} callback 绑定的回调函数
             */
            off: function(type, callback) {
                var events = this._listener[type];
                if (!events) {
                    return;
                }
                if (!callback) {
                    delete this._listener[type];
                    return;
                }
                events.splice(types.indexOf(callback), 1);
                if (!events.length) {
                    delete this._listener[type];
                }
            },
            /**
             * 触发事件
             * @param {string} type 事件名字
             * @param {Array} argAry 传给事件的参数
             * @param {Object} context 事件的this指针
             */
            fire: function(type, argAry, context) {
                if (!type) {
                    throw new Error('未指定事件名');
                }
                var events = this._listener[type];

                context = context || this;

                if (events) {
                    for (var i = 0, len = events.length; i < len; i++) {
                        events[i].apply(context, argAry);
                    }
                }
                // 触发直接挂在对象上的方法
                var handler = this['on' + type];
                if (typeof handler === 'function') {
                    handler.call(this, event);
                }

                return event;
            }
        };


        return Control;
    }
);

define(


        'src/web/WebControl',['require','./blend','./../common/lib','./Control','./events'],function(require) {
            var blend = require('./blend');
            var lib = require('./../common/lib');
            var Control = require('./Control');
            var events = require('./events');


        /**
         * todo:这个WebControl不能合并到Control中么？
         * @class blend.webControl
         * @extends Control
         * @static
         */

        function WebControl(options) {

            Control.apply(this, arguments);
        }


        //重新实现

        WebControl.prototype.type = 'layout';

        // var myevents = [];

        //覆盖control的方法
        //js事件
        //处理内部事宜,也可用来指定dom事件
        //@params id for runtime use,useless for web
        WebControl.prototype.on = events.on;
        
        //监听一次
        WebControl.prototype.once = events.once;
        
        //@params id for runtime use,useless for web
        WebControl.prototype.off = events.off;
        

        WebControl.prototype.fire = events.fire;
        
        WebControl.prototype.isRender = function(boolrender){
            if (typeof boolrender !== 'undefined') {
                this.isRendered = boolrender;
            }else{
                return this.isRendered?this.isRendered:false;
            }
        };

        WebControl.prototype.animationEnd = function(callback) {
            var events = ['webkitAnimationEnd', 'OAnimationEnd', 'MSAnimationEnd', 'animationend'],
                i, j, me = this;
            function fireCallBack(e) {
                callback(e);
                for (i = 0; i < events.length; i++) {
                    me.off(events[i], fireCallBack);
                }
            }
            if (callback) {
                for (i = 0; i < events.length; i++) {
                    me.on(events[i], fireCallBack);
                }
            }
            return this;
        };
        WebControl.prototype.transitionEnd = function(callback) {
            var events = ['webkitTransitionEnd'],
                i, j, me = this;
            function fireCallBack(e) {
                callback(e);
                for (i = 0; i < events.length; i++) {
                    me.off(events[i], fireCallBack);
                }
            }
            if (callback) {
                for (i = 0; i < events.length; i++) {
                    me.on(events[i], fireCallBack);
                }
            }
            return this;
        };

        lib.inherits(WebControl, Control);

        return WebControl;
    }
);
define(

    /**
     * layerapi，封装一些管理基本事件。
     * 本api依赖于 crema css， index.html页面需要有 div.pages 容器。
     * refresh 需要设定refresh的容易：page-content
     * @static
     */

    'src/web/layer/layerapi',['require'],function(require) {
        var api = {};

        var pixelRatio = window.devicePixelRatio || 1;//定义点阵

        api.prepare = function(id, options, context, dom) {

            dom = dom || context.main;
            
            //1. set position
            if (dom !== context.main) {//dom is not absolute context.main, then append dom to context.main;
                context.main.appendChild(dom);
            }
            var contextjQ = $(context.main);
            contextjQ.css({top:options.top, left: options.left, right: options.right, bottom: options.bottom});
            if (options.top || options.bottom){
                contextjQ.css({"height":'calc(100% - '+(options.top + options.bottom) +'px)',"width":'calc(100% - '+(options.left + options.right) +'px)'});
                if ($contextjQ.css("height").indexOf("calc") === -1 ) {//设置失败
                    $contextjQ.css({"height":$("body").height()-(options.top + options.bottom) ,"width":$("body").width()+(options.left + options.right) });
                    $(window).resize(function(){
                        contextjQ.css({"height":$("body").height()-(options.top + options.bottom) ,"width":$("body").width()+(options.left + options.right) });
                    });
                }
            }
            // contextjQ.html('');//清空功能html,不需要清空，因为可能已经有了预加载的header
            context.startLoading();

            var renderData = function(data){
                if ( $(".page-content",dom).hasClass("pull-to-refresh-content") ) {//下拉刷新,保持动画
                    var showhtml = $("<div>").html(data).find(".page-content").html() || data;
                    $(".page-content",dom).html(showhtml);
                }else{
                    dom.innerHTML = data;
                }
                context.fire('onrender');
            };
            $.ajax({
                url: options.url,
                type: 'get',
                dataType:"html",
                success: function(data) {
                    // console.log("--------",data);
                    //hybird版本的web页面是带有页头和页尾的，所以，需要进行.page筛选。
                    //data html 预处理
                    if ( data.indexOf('<html') !== -1 ) {
                        if ( data.indexOf("<title") !== -1 ){
                            var title = data.substring(data.indexOf("<title"),data.indexOf("</title>"));
                            if (title){
                                // document.title = title.replace(/<title[^>]*>/,"");//更新title
                                contextjQ.attr("data-title",title.replace(/<title[^>]*>/,""));
                            }
                        }
                        

                        var data2 = $(".page",data);
                        //HACK 所有的group要去掉.bar 
                        if (context.myGroup) {
                            data2.find(".bar").remove();
                        }
                        data = data2.html();
                    }
                    
                    

                    //动画中渲染页面会有bug发生，所以需要等待页面动画完成后进行渲染操作
                    if (context.hasState("slidein") ) {
                        context.once("onshow",function(){
                            renderData(data);
                            
                        });
                    }else{
                        renderData(data);
                        
                    }
                    
                   
                },
                error: function(err) {
                    context.fire('renderfailed');

                }
            });

        };

        api.resume = function(context) {

            var container;
            if ( context.myGroup ) {//获取当前layer的
                console.log("in layer group..." + context.myGroup.index);
                container = context.myGroup.main;
            }else{
                container = document.body.firstElementChild;//.pages 
            }
            console.log("resume...."+context.id);
            if (!$('#'+ context.main.id).length) {
                    // console.log("resume. in..."+context.main.id);
                // $(context.main).appendTo(container);//这里居然有bug。。。 zepto！！！！
                container.appendChild(context.main);
            }

        };

        //for unbind
        var pullEvents = {};

        api.startPullRefresh = function(context) {
            //0.初始化dom,挂载在page-content上
            var container,tipLayer;
            var init = function(){
                container = $(context.main).find('.page-content');
                if (!container.length) {
                    console.log('pull to refresh should has .page-content');
                    return false;
                }
                container.addClass("pull-to-refresh-content");
                if (!$(".pull-to-refresh-layer",context.main).length){
                    $(".page-content",context.main).before('<div class="pull-to-refresh-layer"> <div class="preloader"></div><div class="pull-to-refresh-arrow"></div><div class="pull-to-refresh-label"></div> </div>');
                }
                tipLayer = $(".pull-to-refresh-layer",context.main).css("padding-top",container.css("padding-top"));//padding-top
                tipLayer.css("margin-top",container.position().top);
            };

            
            init();

            if ( !container.length ) return;
            
            var isTouched,
                isMoved,
                touchesStart = {},
                isScrolling,
                touchesDiff,
                touchStartTime,
                refresh = false,
                useTranslate = false,
                startTranslate = 0;

            //private function
            var afterRefresh = function(container) {
                // tipLayer.removeClass('refreshing');
                container.removeClass('refreshing').addClass('transitioning');
                $(".pull-to-refresh-label",tipLayer).text(context.loadingText);//todo: 让这个可自定义
                context.transitionEnd(function () {
                    container.removeClass('transitioning');
                    // tipLayer.removeClass('pull-up show-refresh-layer');
                    tipLayer.removeClass('pull-up refreshing');
                });
            };
            var afterNoRefresh = function(container){
                // tipLayer.removeClass('refreshing').addClass('transitioning');
                // $(".pull-to-refresh-label",tipLayer).text(context.loadingText);//todo: 让这个可自定义
                context.transitionEnd(function () {
                    container.removeClass('transitioning');
                    // tipLayer.removeClass('show-refresh-layer');
                });
            };

            pullEvents.handleTouchStart = function(e)  {
                if (isTouched) return false;
                if (container.parent().length === 0) {//container已经不在页面dom中了，而是命中了zepto的缓存
                    
                    init();
                }
                if (container.hasClass("refreshing")) {
                    return false;
                }else{
                    isMoved = false;
                }
                
                if (container[0].scrollTop > 0) {//解决原生滚定条问题的兼容
                    isTouched = false;
                }else{
                    isTouched = true;
                }
                
                isScrolling = undefined;
                touchesStart.x = e.type === 'touchstart' ? e.targetTouches[0].pageX : e.pageX;
                touchesStart.y = e.type === 'touchstart' ? e.targetTouches[0].pageY : e.pageY;
                touchStartTime = (new Date()).getTime();

                //更新container , 需要更新么？
                // container = $(context.main).find('.page-content');
            };
            

            pullEvents.handleTouchMove = function(e) {
                if (!isTouched) return false;
                var pageX = e.type === 'touchmove' ? e.targetTouches[0].pageX : e.pageX;
                var pageY = e.type === 'touchmove' ? e.targetTouches[0].pageY : e.pageY;
                if (typeof isScrolling === 'undefined') {
                    isScrolling = !!(isScrolling || Math.abs(pageY - touchesStart.y) > Math.abs(pageX - touchesStart.x));
                }
                // console.log("isScrolling",isScrolling);
                if (!isScrolling) {
                    // console.log("not scrolling...")
                    isTouched = false;
                    return false;
                }
                if (!isMoved) {
                    
                    container.removeClass('transitioning');
                    startTranslate = tipLayer.hasClass('refreshing') ? 44 : 0;
                    useTranslate = true;
                    
                }
                
                isMoved = true;
                touchesDiff = pageY - touchesStart.y;

                if (touchesDiff < 0 && !container[0].style.webkitTransform) {//解决原生滚定条问题的兼容
                    isTouched = false;
                    return false;
                }
                if (container.hasClass("refreshing")) {
                    //处理刷新中，上滑的操作
                    e.preventDefault();
                    if (touchesDiff > 0) {

                        container[0].style.webkitTransform = 'translate3d(0,' + (Math.pow(touchesDiff, 0.85) + startTranslate) + 'px,0)';
                    }else{
                        container[0].style.webkitTransform = 'translate3d(0, -' + (Math.pow(-touchesDiff, 0.85) - startTranslate) + 'px,0)';
                    }
                }else if (touchesDiff > 0 && container[0].scrollTop <= 0 || tipLayer.hasClass('pull-up')) {
                    // tipLayer.addClass("show-refresh-layer");
                    if (useTranslate) {
                        e.preventDefault();
                        container[0].style.webkitTransform = 'translate3d(0,' + (Math.pow(touchesDiff, 0.85) + startTranslate) + 'px,0)';
                    }
                    if ((useTranslate && Math.pow(touchesDiff, 0.85) > 44) || (!useTranslate && touchesDiff >= 88)) {
                        refresh = true;
                        tipLayer.addClass('pull-up');
                        $(".pull-to-refresh-label",tipLayer).text(context.releaseText);
                    }
                    else {
                        refresh = false;
                        tipLayer.removeClass('pull-up');
                        $(".pull-to-refresh-label",tipLayer).text(context.pullText);
                    }
                } else {
                    refresh = false;
                    return ;
                }
            };
            pullEvents.handleTouchEnd = function(e) {
                if (container.hasClass("refreshing")) {
                    return false;
                }
                if (!isTouched || !isMoved) {
                    isTouched = false;
                    isMoved = false;
                    return false;
                }
                if (container.scrollTop <= 5) {//原生滚动条回弹问题
                    container.scrollTop(0);
                }
                container.addClass('transitioning');
                // container.css("webkitTransform",'');
                container[0].style.webkitTransform = '';
                if (refresh) {
                    tipLayer.addClass('refreshing');
                    container.addClass('refreshing');

                    $(".pull-to-refresh-label",tipLayer).text(context.loadingText);
                    // isMoved = false;

                    context.fire('layerPullDown');//发送事件

                    context.once('layerPullEnd', function() {//监听本次结束

                        afterRefresh(container);
                    });
                }else{
                    afterNoRefresh(container);
                }
                isTouched = false;
                isMoved = false;
            };

            context.on('touchstart', pullEvents.handleTouchStart);
            context.on('touchmove', pullEvents.handleTouchMove);
            context.on('touchend', pullEvents.handleTouchEnd);


        };

        api.isRefreshing = function(context) {//关闭refresh提示
            var container = $(context.main).find('.page-content');
            return container.hasClass("refreshing");
        };

        api.endPullRefresh = function(context) {//关闭refresh提示
            context.fire('layerPullEnd');
        };
        api.stopPullRefresh = function(context) {

            $(context.main).removeClass('pull-to-refresh-content');
            context.off('touchstart', pullEvents.handleTouchStart);
            context.off('touchmove', pullEvents.handleTouchMove);
            context.off('touchend', pullEvents.handleTouchEnd);
        };

        //设置page 的 events 内部动画类
        var pageEvents = {};

        /*
         * 此api将赋予layer 左右swipe的能力
         * 如果有container，则说明，swipe在container内部进行swipe，比如
         * layergroup是一个container，则，swipe仅在此layergroup支持左右滑动，不支持其他layer
         * @returns false
        */
        api.startSwipe = function(context, container) {

            //内部变量
            var isTouched = false,
            isMoved = false,
            touchesStart = {},
            isScrolling,
            activePage,
            previousPage,
            previousContext,
            viewContainerWidth,
            touchesDiff,
            allowViewTouchMove = true,
            touchStartTime,
            activeNavbar,
            previousNavbar,
            activeNavElements,
            previousNavElements,
            activeNavBackIcon,
            previousNavBackIcon,
            el;

            //绑定events
            activePage = $(context.main);

            container = container || $('.pages');
            // console.log("container.... " + container[0].className);

            console.log('startSwipe init ... ' + context.id);

            var swipeBackPageActiveArea = 0;//30;//设定左侧可以触发滑动的区域 （其他区域不滑动）,0 为全部区域
            //boxShadow 整体决定是否显现


            pageEvents.handleTouchStart = function(e) {
                if (!allowViewTouchMove || isTouched) return false;
                isMoved = false;
                isTouched = true;
                isScrolling = undefined;
                touchesStart.x = e.type === 'touchstart' ? e.targetTouches[0].pageX : e.pageX;
                touchesStart.y = e.type === 'touchstart' ? e.targetTouches[0].pageY : e.pageY;
                touchStartTime = (new Date()).getTime();
            };

            pageEvents.handleTouchMove = function(e) {
                if (!isTouched) return false;
                var pageX = e.type === 'touchmove' ? e.targetTouches[0].pageX : e.pageX;
                var pageY = e.type === 'touchmove' ? e.targetTouches[0].pageY : e.pageY;

                touchesDiff = pageX - touchesStart.x;

                if (typeof isScrolling === 'undefined') {
                    isScrolling = !!(isScrolling || Math.abs(pageY - touchesStart.y) > Math.abs(touchesDiff));
                }
                if (isScrolling) {
                    isTouched = false;
                    return false;
                }

                //isMoved * touchesDiff < 0 表示swipe的方向变了，更换配合滑动的页面.

                if (!isMoved || isMoved * touchesDiff < 0) {//isMoved 0 代表没有动， 1 表示swiperight -1 代表 swipeleft，正负与touchdiff的正负相同


                    isMoved = false;//防止中途return，初始化isMoved = false


                    var cancel = false;

                    viewContainerWidth = container.width();

                    //两种情况，1.普通layer具备swipe后退功能（ TODO ），2. layergroup具备swipe功能
                    // previousPage = container.find('.page-on-left:not(.cached)');
                    // var mlen = context.myGroup.layers.length;
                    // var mindex = (context.index+ (touchesDiff>0)?1:-1);
                    // mindex = (mindex > mlen) ? (mindex - mlen):(mindex < 0 ? (mindex + mlen) : mindex);//TODO 复杂的计算，也许应该抽离出去
                    var mid = context.myGroup.getIdByStep(touchesDiff > 0 ? -1 : 1);
                    console.log('re init layer prvious...', mid);

                    // console.log("----------",mid);

                    if (previousPage) {
                        previousPage[0].style.webkitTransform = '';
                    }
                    previousContext = context.myGroup.__layers[mid];
                    previousPage = $(previousContext.main);




                    if (mid === context.id) {//自己转自己，会黑屏，不转场
                        cancel = true;
                    }else {
                        //校准class
                        if (touchesDiff > 0) {
                            previousPage.removeClass('page-on-right').addClass('page-on-left');
                        }else {
                            previousPage.removeClass('page-on-left').addClass('page-on-right');
                        }
                    }
                    // console.log('111111111',context.myGroup);

                    if (swipeBackPageActiveArea && Math.abs(touchesStart.x - container.offset().left) > swipeBackPageActiveArea) cancel = true;
                    if (previousPage.length === 0 || activePage.length === 0) cancel = true;
                    if (cancel) {
                        isTouched = false;
                        return false;
                    }

                }
                isMoved = (touchesDiff > 0) ? 1 : -1;

                e.preventDefault();
                // if (touchesDiff < 0) touchesDiff = 0;//小于0 代表向右
                var percentage = Math.abs(touchesDiff / viewContainerWidth);

                // Transform pages
                activePage[0].style.webkitTransform = ('translate3d(' + touchesDiff + 'px,0,0)');
                // if (1 ) activePage[0].style.boxShadow = '0px 0px 12px rgba(0,0,0,' + (0.5 - 0.5 * percentage) + ')';

                var pageTranslate = touchesDiff - isMoved * viewContainerWidth;
                if ( pixelRatio === 1) pageTranslate = Math.round(pageTranslate);

                previousPage[0].style.webkitTransform = ('translate3d(' + pageTranslate + 'px,0,0)');
                previousPage[0].style.opacity = 0.9 + 0.1 * percentage;
            };

            pageEvents.handleTouchEnd = function(e) {
                if (!isTouched || !isMoved) {
                    isTouched = false;
                    isMoved = false;
                    return false;
                }
                isTouched = false;
                isMoved = false;
                if (touchesDiff === 0) {
                    $([activePage[0], previousPage[0]]).css({opacity: '', boxShadow: ''});
                    //.transform('')
                    activePage[0].style.webkitTransform = '';
                    previousPage[0].style.webkitTransform = '';

                    return false;
                }
                var absTouchesDiff = Math.abs(touchesDiff);

                var timeDiff = (new Date()).getTime() - touchStartTime;
                var pageChanged = false;
                // Swipe back to previous page
                if (
                        timeDiff < 300 && absTouchesDiff > 10 ||
                        timeDiff >= 300 && absTouchesDiff > viewContainerWidth / 2
                    ) {
                    // console.log(touchesDiff);
                    if (touchesDiff > 0) {
                        activePage.removeClass('page-on-center page-on-left').addClass('page-on-right');
                        previousPage.removeClass('page-on-right page-on-left').addClass('page-on-center');
                    } else {
                        activePage.removeClass('page-on-center page-on-right').addClass('page-on-left');
                        previousPage.removeClass('page-on-right page-on-left').addClass('page-on-center');
                    }


                    pageChanged = true;
                }
                // Reset custom styles
                // Add transitioning class for transition-duration
                $([activePage[0], previousPage[0]]).css({opacity: '', boxShadow: ''}).addClass('page-transitioning');

                activePage[0].style.webkitTransform = '';
                previousPage[0].style.webkitTransform = '';

                allowViewTouchMove = false;

                if (pageChanged) {
                    previousContext.fire('beforeshow');
                    context.fire("beforehide");
                }

                context.transitionEnd(function () {
                    $([activePage[0], previousPage[0]]).removeClass('page-transitioning');

                    allowViewTouchMove = true;
                    if (pageChanged) {
                        previousContext.fire('onshow');
                        context.fire("onhide");
                    }
                });
            };

            //绑定事件
            context.on('touchstart', pageEvents.handleTouchStart);
            context.on('touchmove', pageEvents.handleTouchMove);
            context.on('touchend', pageEvents.handleTouchEnd);
        };
        api.endSwipe = function(context) {
            // $(context.main).removeClass("pull-to-refresh-content");
            context.off('touchstart', pageEvents.handleTouchStart);
            context.off('touchmove', pageEvents.handleTouchMove);
            context.off('touchend', pageEvents.handleTouchEnd);
        };


        //========  hybird api ==============
        api.backLayer = function(id) {
            blend.get(id).out();
        };
        //========  hybird end ==============

        return api;
    }
);

define(
    'src/common/loader',['require'],function(require) {

    /**
     * @class blend.loader
     * @singleton
     * @private
     */

    //baidu-async-module,
    //这里实现两个方法
    //A. 加载页面源js
    //B. 页面内嵌js
    
    var loader = {};

    var getScript = function(url,cb){
        var script = document.createElement('script');
        script.setAttribute('src', url);
        document.head.appendChild(script);
        script.onload = function(){
                if(cb){cb(script);}
        };
    };


    loader.getScript = function(layerid,jsarr,callback){
        var getscript = 0;
        for(var i = 0,len=jsarr.length;i<len;i++){
             getScript(jsarr[i],function(){
                getscript++;
                if (getscript === len){
                    callback();
                }
            });
        }
    };
    loader.runScript = function(dom){
        if ($("script",dom).length){
            $("script",dom).each(function(){
                window.eval($(this).html());
            });
        }

    };
    
    return loader;

});
define(

    /**
     * Layer类，内含一个web容器，可以放置在手机屏幕的任何位置，动画可自定义
     * @class Layer
     * @extends WebControl
     * @static
     * @inheritable
     */

    'src/web/Layer.js',['require','../common/lib','./WebControl','./blend','./layer/layerapi','../common/loader'],function (require) {


        var lib = require('../common/lib');
        var Control = require('./WebControl');
        var blend = require('./blend');
        
        var layerApi = require('./layer/layerapi');

        var lowerAnimate = false;//$("html").hasClass("android");

        var loader = require('../common/loader');

        /**
         * @constructor
         *
         * Layer 初始化参数;
         * @param {Object} options 有创建独立layer所需要的条件
         *
         * @param {String} options.url 页面url
         * @param {String} [options.id] layer实例id
         * @param {String} [options.top=0] layer距离屏幕top的坐标
         * @param {String} [options.left=0] layer距离屏幕left的坐标
         * @param {String} [options.width] layer像素宽度，默认全屏
         * @param {String} [options.height] layer像素高度，默认全屏
         * @param {boolean} [options.active] 是否立即激活
         * @param {boolean} [options.autoload] 是否预加载
         *
         * @param {boolean} [options.reverse] =true 动画是否反向
         * @param {String} [options.fx] ="none" 无动画
         * @param {String} [options.fx] ="slide" 默认从右往左，出场从左往右
         * @param {String} [options.fx] ="pop" 弹出
         * @param {String} [options.fx] ="fade" 透明度渐显
         * @param {number} [options.duration] 动画持续时间s
         * @param {String} [options.timingFn] 动画时间线函数@todo
         * @param {String} [options.cover] 是否覆盖效果，默认是推拉效果@todo

         *
         * @param {Function} [options.onrender] webview容器render成功的回调
         * @param {Function} [options.onload] webview页面onload的回调
         * @param {Function} [options.changeUrl] webview url改变的回调
         *
         * @param {Function} [options.onshow] layer被唤起时会触发此事件
         * @param {Function} [options.onhide] layer被隐藏时会触发此事件
         *
         * @param {boolean} options.pullToRefresh 是否支持下拉刷新
         * @param {String} options.pullText 下拉刷新默认文字。
         * @param {String} options.loadingText 下拉刷新加载中的文案。
         * @param {String} options.releaseText 下拉刷新释放刷新文字。

         * @param {String} options.ptrColor 文字颜色@todo
         * @param {Function} options.ptrFn 下拉刷新回调

         * @param {number} lindex 判断layer是前进操作还是后退操作，默认是前进
         
         * @returns this
         */
        var Layer = function (options) {
            
            Control.call(this, options);
            
            this._init(options);
            return this;
        };
        
        //继承control类;
        lib.inherits(Layer,Control);

        //初始化空函数
        Layer.prototype.onload = Layer.prototype.beforeshow = Layer.prototype.beforehide = lib.noop;

        Layer.prototype.constructor = Layer;

        Layer.prototype.top = 0;
        Layer.prototype.bottom = 0;
        Layer.prototype.left = 0;
        Layer.prototype.right = 0;

        Layer.prototype.pullText = "下拉刷新...";
        Layer.prototype.loadingText = "加载中...";
        Layer.prototype.releaseText = "释放刷新...";
        
        // "pullText":"下拉可以刷新⊙０⊙",
        // "loadingText":"更新中，请等待...",
        // "releaseText":"释放更新吧`(*∩_∩*)′",

        /**
         * @private
         * 实例初始化,根据传参数自动化实例方法调用, 私有方法;
         * @param {Object} options 创建layer的初始化参数
         */
        Layer.prototype._init = function(options){
            //处理options值;
            
            //before that , append dom in
            //更新逻辑，首先 new过的layer都会append到container上，但是，渲染模板的时候，会根据是否当前有动画，
            //如果没有正在动画，则直接渲染，有，则等待动画完成后渲染，防止动画过程中渲染页面(涉及到ajax取模板和数据的流程)
            var me = this;

            $(this.main).addClass('page');

            if (!this.myGroup && this.main.innerHTML==='') {
                this.main.innerHTML = '<header class="bar bar-nav"><a class="icon icon-left-nav pull-left" data-rel="back" href=""></a>'+
                '<a class="icon pull-right"></a><h1 class="title"></h1></header>';
            }

            layerApi.resume(this);

            // if (!$('#'+ this.main.id).length) {
            //     if ( this.myGroup ) {//获取当前layer的
            //         console.log("layer group index..." + this.myGroup.index);
            //         container = $(this.myGroup.main) ;
            //     }else{
            //         container = $(".pages");
            //     }
            //     $(this.main).appendTo(container);
            // }

            if (options.main) {//本页已经render
                this.addState("got");
                options.main.setAttribute("data-title",document.title);
                blend.ready(function(){
                    me.fire('onrender');
                });
                
            }
            
            //监听事件
            this._initEvent();
            // var me = this;
            
            if (!this.url) {
                console.log("###No url for render###");
                // return false;
            }else{
                if ( this.autoload ) {
                    this.render();
                }
            }
            

            this.once("onrender",function(){
                //pull to refresh
                if (me.ptrFn) me.pullToRefresh = true;
                if ( me.pullToRefresh ) {
                    me.on('layerPullDown',function(event){
                        me.ptrFn && me.ptrFn(event);
                    });
                    layerApi.startPullRefresh(me);
                }
                
            });
            options.active && me["in"]();
            // console.log("options...",options.index)
            if (typeof options.index !== 'undefined'){
                this.main.setAttribute('data-blend-index', options.index);
            }
            //这里可以提示用户 doing render

            return this;
        };

        Layer.prototype._initEvent = function  () {
            var me = this;
            // var cancelTime = null;

            if ( this.layerAnimate === 'none') {
                lowerAnimate = true;
            }else if (this.layerAnimate){
                $(this.main).addClass(this.layerAnimate);
            }

            
            //native 下 layer 的载入和载出会触发in 和 out 事件 
            //web 下 layer的载入和 载出 均是 触发 自定义事件，自定义事件的this 是 Layer实例 （事件名相同： in out）
            // me.on('in',me.beforeshow);

            me.on('out',me.beforehide);

            //onload 与hybird 事件名保持一致
            // me.on('onload',me.onload);

            // me.on('beforeshow',me.beforeshow);
            // me.on('beforehide',me.beforehide);
            
            // me.on('onhide',function(event){
            //     me.onhide && me.onhide(event);
                
            // });
            me.on('onrender',function(event){
                var id = event['detail'];
                var dom = Blend.ui.get(id).main;
                loader.runScript(dom);

                me.stopLoading();
                me.removeState("get");
                me.addState("got");
            });

            me.on("renderfailed",function(event){
                me.stopLoading();
                me.removeState("get");
            });

            // me.onshow2 = me.onshow;
            me.on('onshow',function(event){

                //check if the layer is loaded
                me.render();
                

                //这里的逻辑可能比较难以理解
                //其实非常简单，当是layergroup的时候，layer.in，【不会】不会在layerStack中存储，而是替换，保持layergroup仅有一个layer在stack中
                // if (!me.myGroup || !me.myGroup.isActive()){//普通layer
                if ( !me.myGroup ){//普通layer
                }else{
                    blend.layerStack.pop();
                }
                
                if (me.myGroup) {
                    me.myGroup.activeId = event.detail;
                }else{
                    blend.layerStack.push(blend.activeLayer);
                }

            });

            //!FIXME SHOULD BE destroy
            me.on('beforedestroy',function(event){
                if (me.pullToRefresh ) {
                    layerApi.stopPullRefresh(me);
                    me.on('layerPullDown',me.ptrFn);
                }
                
            });
        };


        //默认属性
        Layer.prototype.type = "layer";
        // Layer.prototype.type = 'Pager';

        /**
         * loading状态出现的时间
         *
         * @cfg {Number} loadingTime 毫秒ms;
         */
        Layer.prototype.loadingTime = 500;
        

        /**
         * 创建渲染页面
         * @returns this 当前实例
         */
        Layer.prototype.paint = function(){
            var me = this;
            
            
            //1. load url
            layerApi.prepare(me.id,{
                url: me.url,
                top:me.top,
                left:me.left,
                bottom: me.bottom,
                right: me.right,
                // onsuccess:cb,//ADDED 
                // onfail:fail,
                pullToRefresh: me.pullToRefresh
            },me);
            
            //3. set pullToRefresh
            
            //4. set  position before animate.
            // $(this.main).addClass('page page-on-right');

            return this;
        };

        // var parentlayer = $(".page");

        /**
         * 激活页面

            options.reverse: me.reverse support
            options.fx: me.fx,
            options.duration: me.duration,
            options.timingFn: me.timingFn
            
         * @returns this 当前实例
         */
        Layer.prototype["in"] = function(options){
            

            //有一种情况不需要入场动画，比如：自己转自己
            if ( this.isActive() ) {
                console.log('layer is already activity ');
                return ;
            }

            if ( this.hasState("slidein") ) {
                console.log("this layer is sliding in.");
                this.removeState("slidein");
                return ;
            }

            if (options && options.url && decodeURI(options.url) !== decodeURI(this.url)) {
                console.log("layer url changed to..." + options.url);
                this.setUrl(options.url);// = options.url;
                this.removeState("got");
            }

            this.render();//auto has get state
            
            // this.fire("changeUrl",this.id);
            
            //判断是否页面中已经存在，如果不存在，则插入到container中,_init 时，已经插入过了
            // layerApi.resume(this);

            var me = this;
            
            this.addState("slidein");

            //动画的方向要判断
            var translationReverse = false;
            if (this.myGroup && this.myGroup.isActive() ) {//layer group 判断方向
                if ( this.myGroup.idtoindex(this.myGroup.activeId) > this.index ) {
                    translationReverse = true;
                }
            }



            var layerin;
            var layerinContext;
            var layerout;// = blend.activeLayer;
            var layeroutContext;// = blend.get(layerout.attr("data-blend-id"));

            layerin = $(this.main);
            layerinContext = this;


            if ( this.myGroup ) {
                var group = this.myGroup;
                if (!this.myGroup.isActive()){
                    layerin = $(group.main);
                    layerinContext = group;
                }
                //当 id layerout === layerin 的时侯，不转
                if ( group.activeId === layerinContext.id ) {
                    console.log('group.activeId is already activity,no need to slide out '+group.activeId);
                    // return;
                    layerout = $();
                }else{
                    layerout = $(group.__layers[group.activeId].main);
                    layeroutContext = group.__layers[group.activeId];
                }
                
            }else{
                layerout = blend.activeLayer;
                layeroutContext = blend.get(layerout.attr("data-blend-id"));
            }

            // var me = this;
            if (!this.myGroup || this.myGroup.isActive()){
                // layerin = $(this.main);
                // layerinContext = this;

                

            }else{//存在mygroup 并且 mygroup不是active的
                layerin = $(this.myGroup.main);
                layerinContext = this.myGroup;//SEE IT
                if (layerinContext.activeId !== this.id) {//layergoup的activeid 需要变化
                    //管理 activeid 放在了layer group里面
                    $(layerinContext.__layers[layerinContext.activeId].main).addClass("page-on-right").removeClass('page-on-center');
                    $(layerinContext.__layers[this.id].main).removeClass("page-on-right").addClass('page-on-center');
                   
                }
            }

            if ( options && options.reverse ) {
                translationReverse = !translationReverse;
            }else if (this.lindex) { //当前layer有lindex，则判断转出的是否具有，如果都具有进行lindex大小比较
                // 如果转出的lindex较大，则方向变换
                if (this.lindex && layeroutContext.lindex && layeroutContext.lindex > this.lindex) {
                    translationReverse = !translationReverse;
                }
            }

            
            if (!this.myGroup || !layerout.parent().hasClass("layerGroup")) {// 普通layer不需要转出操作
                // 特别的，添加是否子layer支持
                // 当子layer时，不需要转出，其他情况还是需要转出
                if ( this.isSubLayer() ) {
                    layerout = $();
                }
                
            }
            //优化逻辑
            var layerOutPosition,layerInPosition;
            if ( translationReverse ) {
                layerOutPosition = "right";
                layerInPosition = "left";
            }else{
                layerOutPosition = "left";
                layerInPosition = "right";
            }
            //标准的页面进入流程
            if ( lowerAnimate ) {
                
                layerin.removeClass('page-on-left page-on-right').addClass('page-on-center');
                layerout.removeClass("page-on-center").addClass("page-on-"+ layerOutPosition);
                
            }else{
                //1. 找到当前page，然后动画走掉
                layerout.removeClass("page-on-center").addClass("page-from-center-to-"+layerOutPosition);
                //2. 滑入新page
                // layerin.removeClass('page-on-'+layerOutPosition).addClass('page-on-'+layerInPosition).addClass('page-from-'+layerInPosition+'-to-center');
                layerin.removeClass('page-on-right').removeClass('page-on-left').addClass('page-from-'+layerInPosition+'-to-center');
            
            }
            
            me.fire("beforeshow");
            layeroutContext && layeroutContext.fire("beforehide");

            var afteranimate = function(){
                    me.removeState("slidein");
                    me.fire("onshow");
                    layeroutContext && layeroutContext.fire("onhide");
            };
            //入场动画结束
            if (!lowerAnimate){
                layerinContext.animationEnd(function(){

                    //执行靠边操作
                    layerout.removeClass(function(index,css){
                        return (css.match (/\bpage-from\S+/g) || []).join(' ');
                    });
                    //执行居中操作
                    layerin.removeClass(function(index,css){
                        return (css.match (/\bpage-from\S+/g) || []).join(' ');
                    });

                    var checkActive;
                    if ( me.myGroup ) {//重新获取一次，因为动画期间可能发生很多事情
                        checkActive = $(me.myGroup.__layers[me.myGroup.activeId].main);
                    }else{
                        checkActive = blend.activeLayer;
                    }
                    
                    if ( checkActive.attr("data-blend-id") !== layerout.attr("data-blend-id") ){
                        layerout.addClass("page-on-"+layerOutPosition);
                    }
                    
                    if ( checkActive.attr("data-blend-id") === layerin.attr("data-blend-id") ){
                        layerin.addClass('page-on-center');
                    }
                    
                    afteranimate();
                    
                });
            }else{
                afteranimate();//无动画
            }

            //更新active page , 在 swipe api中，同样需要更新
            if (!this.myGroup) {
                blend.activeLayer = $(me.main);
            }else{
                me.myGroup.activeId = this.id;
            }
            

            return this;
        };

        /**
         * 当前layer退场，返回上一个Layer
         * @returns this 当前实例
         */
        Layer.prototype.out = function( options ){
            //go back
            var me = this;

            if ( !this.isActive() ) {
                console.log('layer is already inactivity ');
                return ;
            }

            if (this.isRefreshing()){
                this.endPullRefresh();
            }

            
            var parentlayer = blend.layerStack.length>1?blend.layerStack[blend.layerStack.length-2]:$(".page-on-left");//FIXME should be better to select only one!

            // if (!this.myGroup ) {// 普通layer的转出 不需要其他layer配合。
            //     parentlayer = $();
            // }
            var layerout = $(me.main);
            var layerin = parentlayer;
            var layerinContext = blend.get(layerin.attr("data-blend-id"));

            var inobj = Blend.ui.get(layerin.attr("data-blend-id"));
            inobj && inobj.addState("slidein");

            if (!this.myGroup || !layerout.parent().hasClass("layerGroup")) {// 普通layer不需要转出操作
                // parentlayer = $();
                // layerin = $();
                if ( this.isSubLayer() ) {
                    layerin = $();
                }
            }

            if ( lowerAnimate ) {
                layerin.removeClass("page-on-left").addClass("page-on-center");
                layerout.removeClass("page-on-center").addClass('page-on-right');
            }else{
                layerin.removeClass("page-on-left").addClass("page-from-left-to-center");
                layerout.removeClass("page-on-center").addClass('page-from-center-to-right');
            }
            
            
            me.fire("beforehide");
            
            layerinContext && layerinContext.fire("beforeshow");
            
            var afteranimate = function(){
                
                me.fire("onhide");

                layerinContext && layerinContext.fire("onshow");
                
                blend.activeLayer = parentlayer;
                inobj && inobj.removeState("slidein");
                // me.dispose();
            };
            if ( !me.myGroup ) {
                blend.layerStack.pop();//pop立即更新，push 则要等待animate完成后更新， 原因是要确保in和out的次序不会错误
            }
            
            //出场动画结束
            if (lowerAnimate) {
                afteranimate();
            }else{
                this.animationEnd(function(){
                    afteranimate();
                    parentlayer.removeClass("page-from-left-to-center").addClass("page-on-center");
                    layerout.removeClass('page-from-center-to-right').addClass("page-on-right");
                });
            }
            

            return this;
        };

        /**
         * 重新刷新页面
         *
         * @param {String} url 刷新页面时所用的url
         * @returns this
         */
        Layer.prototype.reload = function(url,callback){
            //reload
            //1. destroy
            // this.destroy();
            //2. got items
            var obj = {
                url :url,
                onsuccess:this.onsuccess,
                onfail:this.onfail,
                top:this.top,
                left:this.left,
                right:this.right,
                bottom:this.bottom
            };
            //TODO IT 
            // this.fire("changeUrl");

            this.isRender(false);
                    
            layerApi.prepare(this.id , obj, this);

            if (typeof callback === 'function') {
                this.once("onrender",callback);
            }
            //贴上prepare的内容
            // layerApi.resume(this);

            return this;
        };

        Layer.prototype.isSubLayer = function(){
            return (this.sublayer || this.myGroup)?true:false;
        };

        /**
         * 检测 layer拉动刷新状态
         *
         * returns bool
         */
        Layer.prototype.isRefreshing = function(context){
             return layerApi.isRefreshing(context || this);
        };

        /**
         * 停止layer拉动刷新状态
         *
         * returns this
         */
        Layer.prototype.stopPullRefresh = function(context){
            //set pull to refresh
            layerApi.stopPullRefresh(context|| this);
            return this;
        };
        Layer.prototype.endPullRefresh = function(context){
            //end pull to refresh loading status
            layerApi.endPullRefresh(context|| this);
            return this;
        };

        /**
         * 销毁此layer
         * @returns this
         */
        Layer.prototype.destroy = function(){
            Control.prototype.destroy.apply(this, arguments);
        };

        

        /**
         * url 替换
         *
         * @param {String} url 刷新页面时所用的url
         * @returns this
         */
        Layer.prototype.replace = function(url){
            me.url = url;
            // layerApi.replaceUrl(this.id,url);
            return this;
        };

        /**
         * 开始loading状态
         * @returns this
         */
        Layer.prototype.startLoading = function(){
            if (!$('.preloader-indicator-overlay').length)
                $(this.main).append('<div class="preloader-indicator-overlay"></div><div class="preloader-indicator-modal"><span class="preloader preloader-white"></span></div>');
            return this;
        };
        /**
         * 停止loading状态
         * @returns this
         */
        Layer.prototype.stopLoading = function(){
            $('.preloader-indicator-overlay, .preloader-indicator-modal').remove();
            return this;
        };
        
        /**
         * 获取layer的当前url
         * @returns 
         */
        Layer.prototype.getUrl = function(){
            return this.url;
        };
        
        /**
         * 获取layer是否可以history go
         * @returns boolean
         */
        Layer.prototype.canGoBack = function(){

            return blend.canGoBack();
        };

        /**
         * 清除history堆栈,web 做不到
         * @returns boolean
         */
        Layer.prototype.clearHistory = function(){
            console.error("web cant clearHistory");
        };

        /**
         * layer是否是激活状态
         * @returns boolean
         */
        Layer.prototype.isActive = function(){
            return $(this.main).hasClass("page-on-center");//blend.activeLayer.attr("id") === this.main.id;
        };


        return Layer;
    }
);
define(

    /**
     * layerGroupApi，封装group api 事件。
     * 本api依赖于 crema css， index.html页面需要有 div.pages 容器。
     * refresh 需要设定refresh的容易：page-content
     *
     */

    'src/web/layer/layerGroupApi',['require','./layerapi'],function(require) {

        var api = {};

        var layerapi = require('./layerapi');
        /**
         * @class blend.Api.layer
         * @singleton
         * @private
         */
        var devPR = window.devicePixelRatio || 2;


        /**
         * 创建pagerGroup，成功回掉返回 runtime句柄winid
         *
         * @param {String} groupId id
         * @param {Array} layers 本地或网络url链接组成的Array
         * @param {Object} options pager数组
         * @return null
         * @private
         */

        api.create = function(groupId, layers, options, context) {
            var layerInfo = {
                id: groupId || uniqid(),
                infos: layers
            };
            if (options.active) {
                layerInfo.active = options.active;
            }
            var groupOptions = {};

            ['left', 'top', 'width', 'height'].forEach(function(n, i) {
                if (options[n] !== undefined) {
                    groupOptions[n] = options[n] * devPR;
                }
            });
            var dom;
            for (var i = 0, len = layers.length; i < len; i++) {
                //load these apis.
                dom = document.createElement('div');
                dom.className = 'page';

                layerapi.prepare(layers[i].id, options, dom);

                context.main.appendChild(dom);

            }

            // window.lc_bridge.addLayerGroup(JSON.stringify(layerInfo), JSON.stringify(groupOptions));


            return groupId;
        };

        /**
         * 激活GroupId下面的对应的layerId
         * @method {Function} showLayer
         * @return groupId
         * @private
         */
        api.showLayer = function(groupId, layerId, context) {//groupId no use

            if (context.__layers[layerId]) {
                context.__layers[layerId]["in"]();

                context.activeId = layerId;
            }else {
                console.warn('no layerid found...' + layerId);
            }
            // window.lc_bridge.showLayerInGroup(groupId, layerId);
            //@todo return
            return groupId;
        };

        /**
         * 在group中增加layer
         * @private
         * @return groupId
         */
        api.addLayer = function(groupId, layerGroup) {
            window.lc_bridge.addLayerInGroup(groupId, layerGroup, index);
            //@todo return
            return groupId;
        };

        /**
         * 在group中删除layer
         * @private
         * @return groupId
         */
        api.removeLayer = function(groupId, layerId) {
            window.lc_bridge.removeLayerInGroup(groupId, layerId);
            //@todo return
            return groupId;
        };

        /**
         * 在group中更新layer
         * @private
         * @return groupId
         */
        api.updateLayer = function(groupId, layerId, layerOptions) {
            window.lc_bridge.updateLayerInGroup(groupId, layerId, layerOptions);
            //@todo return
            return groupId;
        };



        return api;
    }
);

/**
 * LayerGruop类，内含多个Layer，可以放置在手机屏幕的任何位置，系统会自动管理多个Layer之间的滑动关系
 * @class Layer
 * @extends Control
 * @static
 * @inheritable
 */
define('src/web/LayerGroup.js',['require','./blend','../common/lib','./WebControl','./layer/layerGroupApi','./layer/layerapi','./Layer.js'],function(require) {

    var blend = require('./blend');
    var lib = require('../common/lib');
    // var Control = require('./Control');
    var Control = require('./WebControl');
    //是否是runtime运行环境
    var isRuntimeEnv = false;//main.inRuntime();//runtime.isRuntimeEnv&&runtime.isRuntimeEnv();
    // var groupApi = runtime.layerGroup;

    var groupApi = require('./layer/layerGroupApi');
    var layerApi = require('./layer/layerapi');

    var layer = require('./Layer.js');
    var lowerAnimate = false;//
    var isAndroid = $("html").hasClass("android");


    /**
     * @constructor;
     *
     * LayerGroup结构化函数;
     * @extends Control
     *
     * @param {Object} options 有创建独立layer所需要的条件
     * @param {Array} options.layers LayerGroup中的Layer参数options
     * @param {String} options.layers.url layer的link
     * @param {Boolean} [options.layers.active=false] layer默认展示
     * @param {Boolean} [options.layers.autoload=false] 是否自动加载
     * @param {String} [options.layers.id] layer的id
     * @param {Function} [options.layers.onrender] webview容器render成功的回调
     * @param {Function} [options.layers.renderfail] webview容器render失败的回调
     * @param {Function} [options.layers.onload] webview页面onload的回调
     * @param {Function} [options.layers.onshow] layer被唤起时会触发此事件
     * @param {Function} [options.layers.onhide] layer被隐藏时会触发此事件
     *
     * @param {boolean} [options.layers.pullToRefresh] 是否支持下拉刷新
     * @param {Array|String} [options.layers.ptrIcon] 下拉时显示的图标。可以传入Array，下标0、1、2分别表示下拉时显示的图标、提示释放的图标、加载中的图标
     * @param {Array|String} [options.layers.ptrText] 下拉时显示的文字。可以传入Array，下标0、1、2分别表示下拉时显示的文字、提示释放的文字、加载中的文字
     * @param {String} [options.layers.ptrColor] 文字颜色
     * @param {Function} [options.layers.ptrOnsuccess] 成功后的回调
     * @param {Function} [options.layers.ptrOnfail] 失败后的回调
     *
     * @param {string} [options.id] layerGroup实例id
     * @param {string} [options.top=0] layerGroup距离屏幕top的坐标
     * @param {string} [options.left=0] layerGroup距离屏幕left的坐标
     * @param {string} [options.width] layer像素宽度，默认全屏
     * @param {string} [options.height] layer像素高度，默认全屏
     *
     * @param {string} [options.layerAnimate] **web only** layer切换动画,emun['page-slide','page-fade','none'],默认slide
     * @param {string} [options.enableSwipe] **web only** swipe切换页面,默认true
     *
     * @param {Function} [options.beforerender] webview容器render开始前的回调
     * @param {Function} [options.onrender] webview容器render成功的回调
     * @param {Function} [options.renderfail] webview容器render失败的回调
     * @return this
     */
    var LayerGroup = function(options) {
        /*if(!(this instanceof LayerGroup)){
            return new LayerGroup(options);
        }*/
        Control.call(this, options);
        this._init(options);
    };

    //继承于control
    lib.inherits(LayerGroup, Control);

    LayerGroup.prototype.constructor = LayerGroup;

    /**
     * 组件的类型
     *
     * @cfg {String} type
     */

    LayerGroup.prototype.type = 'layerGroup';

    LayerGroup.prototype.top = 0;
    LayerGroup.prototype.bottom = 0;
    LayerGroup.prototype.left = 0;
    LayerGroup.prototype.right = 0;

    /**
     * 当前的active顺序
     *
     * @cfg {number} index
     */
    LayerGroup.prototype.index = 0;

    /**
     * @private
     * 对象初始化, 私有方法;
     * @param {Object} options 创建group的初始化参数,
     * @return this
     */
    LayerGroup.prototype._init = function(options) {
        var me = this;
        var layers = {};
        var activeId = null;
        //结构化layers为object
        if (!me.layers || !me.layers.length) {
            return;
        }
        if (this.routing === false) {
            this.main.setAttribute('data-routing','false');
        }else{
            this.main.setAttribute('data-routing','true');//by default
        }

        for (var i = 0, len = me.layers.length; i < len; i++) {
            if (!me.layers[i].id) {
                me.layers[i].id = lib.getUniqueID();
            }
            if (me.layers[i].active) {
                if (activeId) {
                    console.log("active id:"+activeId+" is already defined.. ignore the coming active ones:"+me.layers[i].id);
                    delete me.layers[i].active;
                }else{
                    activeId = me.layers[i].id;
                }
                
            }

            me.layers[i].index = i;//

            layers[me.layers[i].id] = me.layers[i];
        }

        me._layers = layers;

        me.__layers = {};//

        me.activeId = activeId || me.layers[0].id;

        me.layerArray = [];//for 


        /* alert(me.get('activeId')); */



        // me.render();

        me.render();

        me.once("onrender",function(){
            //监听事件
            me._initEvent();

            options.active && me["in"]();
        });
        me.once("renderfail",function(){
            //提示用户加载失败
            console.error("render fail");
        });

        //todo;
        return this;
    };

    /**
     * @private
     * 事件初始化
     * @return this
     */
    var eventsFunction = {};
    LayerGroup.prototype._initEvent = function() {
        
        if (this.enableSwipe !== false){
            this.initSwipe();
        }
        
        

        return null;

    };

    /**
     * 创建渲染页面
     * @return this
     */
    LayerGroup.prototype.paint = function() {
        var me = this;
        
        //使用layer类处理 layers
        
        //pages...
        if ( this.layerAnimate === 'none') {
            lowerAnimate = true;
        }else if (this.layerAnimate){
            $(this.main).addClass(this.layerAnimate);
        }
        $(this.main).addClass('layerGroup page page-on-center').appendTo(blend.activeLayer);
        //处理定位
        
        $(this.main).css({top:me.top, left: me.left, right: me.right, bottom: me.bottom});

        if (me.top || me.bottom){
            $(this.main).css({"height":'calc(100% - '+(me.top + me.bottom) +'px)',"width":'calc(100% - '+(me.left + me.right) +'px)'});
            if ($(this.main).css("height").indexOf("calc") === -1 ) {//设置失败
                $(this.main).css({"height":$("body").height()-(me.top + me.bottom) ,"width":$("body").width()+(me.left + me.right) });
                $(window).resize(function(){
                    $(me.main).css({"height":$("body").height()-(me.top + me.bottom) ,"width":$("body").width()+(me.left + me.right) });
                });
            }
        }
        
        //top的处理，由于渲染有bug，top的

        for (var id in this._layers) {
            this.add(this._layers[id]);
        }

        return this;
    };

    /**
     * 激活相应layer
     *
     * @param {String} layerId layer id
     * @return this
     */
    LayerGroup.prototype.active = function(layerId ) {

        groupApi.showLayer(this.id, layerId, this);
        return this;
    };

    //todo: 这个方法是private的吗，包括下面这个
    //todo: 命名不规范
    LayerGroup.prototype.idtoindex = function(id) {
        return this._layers[id].index || 0;
    };
    LayerGroup.prototype.indextoid = function(index) {//可以循环不？ 我认为是不可以循环的
        if (index >= this.layers.length) {
            // index = index - this.layers.length

            index = this.layers.length - 1;

        }else if (index < 0) {
            // index = index + this.layers.length;

            index = 0;
        }
        // index = index % this.layers.length;
        this.index = index;
        return this.layers[index].id;
    };

    LayerGroup.prototype.getIdByStep = function(step) {//startid
        this.index = this.idtoindex(this.activeId);
        
        return this.indextoid(this.index + step);
    };

    LayerGroup.prototype.next = function() {

        this.index = this.idtoindex(this.activeId);
        // console.log('next ' + this.index);

        var layerId = this.indextoid(++this.index);

        groupApi.showLayer(this.id, layerId, this);
        return this;
    };

    LayerGroup.prototype.prev = function() {
        this.index = this.idtoindex(this.activeId);

        var layerId = this.indextoid(--this.index);
        groupApi.showLayer(this.id, layerId, this);
        return this;
    };

    /**
     * 删除layer
     * @param {string} layerId group中layer id
     * @return this
     */
    LayerGroup.prototype.remove = function(layerId ) {
        groupApi.removeLayer(this.id, layerId);
        delete this._layers[layerId];
        return this;
    };

    /**
     * 增加layer
     * @param {Object} layerOptions layer Options
     * @param {Number} [index=last] 插入到第index个下标之后
     * @return {Layer}
     */
    LayerGroup.prototype.add = function(layerOptions, index ) {
        
        var me = this;

        if (!layerOptions.id){
            layerOptions.id = lib.getUniqueID();
        }

        //判断此layer的id是否存在
        if ( this._layers[layerOptions.id] && this.__layers[layerOptions.id] ) {

            console.log("layerid:"+layerOptions.id+" in group has already exist...");
            
            if (layerOptions.url && this._layers[layerOptions.id].url !== layerOptions.url) {
                //暂时不考虑刷新问题
                // this.__layers[layerOptions.id].reload(layerOptions.url);

            }

            this.__layers[layerOptions.id]["in"]();
            return ;
        }

        if (me.onshow) {
            layerOptions.onshow = me.onshow;
        }
        if (me.beforeshow) {
            layerOptions.beforeshow = me.beforeshow;
        }
        if (me.onrender) {
            layerOptions.onrender = me.onrender;
        }

        layerOptions.myGroup = this;

        console.log('paint LayerGroup > layer', layerOptions.id, layerOptions);

        var layerobj = new layer(layerOptions);

        this.__layers[layerOptions.id] = layerobj;
        // this.__layers[layerOptions.id] = layerobj;
        this._layers[layerOptions.id] = layerOptions;

        if (index===0) {
            this.layerArray.unshift(layerobj);
        }else{
             this.layerArray.push(layerobj);
        }

        //安装好容器
        this.main.appendChild(layerobj.main);
        
        return this;
    };

    /**
     * 更新layer url
     * @param {Object} layer Options
     * @param {Number} [index=last] 插入到第index个下标之后
     * @return {Layer}
     */
    LayerGroup.prototype.update = function(layerId, layerOptions) {

        groupApi.updateLayer(this.id, layerId, layerOptions);

        lib.extend(this._layers[layerOptions.id], layerOptions);
        return this;
    };

    /**
     * 激活页面组
     * @return this 当前实例
     */
    LayerGroup.prototype["in"] = function() {
        if ( this.isActive() ) {
            console.log("layergroup is already active.");
            return ;
        }
        this.__layers[this.activeId]["in"]();
    };

    /**
     * 转出
     * @return this 当前实例
     */
    LayerGroup.prototype.out = function() {
        var me = this;

        if ( !this.isActive() ) {
            console.log('layer group is already inactivity ');
            return ;
        }

        var parentlayer = blend.layerStack.length>1?blend.layerStack[blend.layerStack.length-2]:$(".page-on-left:first");//FIXME should be better to select only one!

        if (lowerAnimate){
            parentlayer.removeClass('page-on-left').addClass('page-on-center');
            $(me.main).removeClass('page-on-center').addClass('page-on-right');
        }else{
            parentlayer.removeClass('page-on-left').addClass('page-from-left-to-center');
            $(me.main).removeClass('page-on-center').addClass('page-from-center-to-right');
        }
        

        blend.layerStack.pop();

        var afteranimate = function(){
            // me.dispose();
            me.fire('onhide');
      
        };
        //出场动画结束
        if (lowerAnimate){ 
            afteranimate();
        }else{
            this.animationEnd(function() {
                afteranimate();
                parentlayer.removeClass('page-from-left-to-center').addClass('page-on-center');
                $(me.main).removeClass('page-from-center-to-right').addClass('page-on-right');
            });
        }

        return this;
    };

    /**
     * 销毁此layerGroup
     * @return this
     */
    LayerGroup.prototype.destroy = function(options ) {

        // this.off('groupSelected', eventsFunction.selectedFn);
        // this.off('groupScrolled', eventsFunction.scrollFn);

        Control.prototype.destroy.apply(this, arguments);

    };

    LayerGroup.prototype.initSwipe = function() {
        for (var index in this._layers) {

            layerApi.startSwipe(this.__layers[index], $(this.main));
            // break;
        }

    };

    //添加函数判断是否active

    LayerGroup.prototype.isActive = function() {
        return $(this.main).hasClass('page-on-center');
    };




    return LayerGroup;
});

require(['src/web/blend','src/web/Layer.js','src/web/LayerGroup.js'], function (blend, layer,layergroup) {
    

    blend = blend||{};
    
	//layer
    blend.Layer = layer;
    blend.LayerGroup = layergroup;
    
    // window.Blend = blend;
    window.Blend = window.Blend || {};//初始化window的blend 对象 ， 将 blend 作为模块 绑定到 Blend.ui 上
    window.Blend.ui = blend;

    
},null,true);
define("src/web/main", function(){});

}());