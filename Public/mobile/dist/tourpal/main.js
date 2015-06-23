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

define("lib/almond", function(){});

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
define("lib/zepto", function(){});

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
    'src/common/lib',['require','src/common/lib/lang','src/common/lib/string'],function(require) {


        /**
         * @class blend.lib
         * @singleton
         * @private
         */
        var lib = {};

        var lang = require('src/common/lib/lang');
        var string = require('src/common/lib/string');

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
define(
    'src/web/api',['require'],function(require) {

        var api = {};
        var noop = function(){};

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
define('src/web/blend',["require",'src/common/lib',"src/web/events",'src/web/api'],
    function(require,lib,events,api) {


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
        lib.extend(blend,api);


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


        // var config = {
        //     DOMPrefix: 'data-ui',
        //     classPrefix: {
        //         'ui' : 'ui',
        //         'skin' : 'skin',
        //         'state' : 'state'
        //     }
        // };


        // *
        //  * 设置config
        //  *
        //  * @property {Object} info
         
        // blend.config = function(info) {
        //     lib.extend(config, info);
        // };

        // /**
        //  * 获取config
        //  *
        //  * @property {String} name
        //  */
        // blend.getConfig = function(name) {
        //     return config[name];
        // };

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
        

        // blend.configs = configs;

        return blend;
    }
);

define(

    /**
     * @class Control
     * @inheritable
     */

    'src/web/Control',['require','src/common/lib','src/web/blend'],function(require) {
        var lib = require('src/common/lib');
        var blend = require('src/web/blend');
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


        'src/web/WebControl',['require','src/web/blend','src/common/lib','src/web/Control','src/web/events'],function(require) {
            var blend = require('src/web/blend');
            var lib = require('src/common/lib');
            var Control = require('src/web/Control');
            var events = require('src/web/events');


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
/*!
 * artTemplate - Template Engine
 * https://github.com/aui/artTemplate
 * Released under the MIT, BSD, and GPL Licenses
 */
 
!(function () {


/**
 * 模板引擎
 * @name    template
 * @param   {String}            模板名
 * @param   {Object, String}    数据。如果为字符串则编译并缓存编译结果
 * @return  {String, Function}  渲染好的HTML字符串或者渲染方法
 */
var template = function (filename, content) {
    return typeof content === 'string'
    ?   compile(content, {
            filename: filename
        })
    :   renderFile(filename, content);
};


template.version = '3.0.0';


/**
 * 设置全局配置
 * @name    template.config
 * @param   {String}    名称
 * @param   {Any}       值
 */
template.config = function (name, value) {
    defaults[name] = value;
};



var defaults = template.defaults = {
    openTag: '<%',    // 逻辑语法开始标签
    closeTag: '%>',   // 逻辑语法结束标签
    escape: true,     // 是否编码输出变量的 HTML 字符
    cache: true,      // 是否开启缓存（依赖 options 的 filename 字段）
    compress: false,  // 是否压缩输出
    parser: null      // 自定义语法格式器 @see: template-syntax.js
};


var cacheStore = template.cache = {};


/**
 * 渲染模板
 * @name    template.render
 * @param   {String}    模板
 * @param   {Object}    数据
 * @return  {String}    渲染好的字符串
 */
template.render = function (source, options) {
    return compile(source, options);
};


/**
 * 渲染模板(根据模板名)
 * @name    template.render
 * @param   {String}    模板名
 * @param   {Object}    数据
 * @return  {String}    渲染好的字符串
 */
var renderFile = template.renderFile = function (filename, data) {
    var fn = template.get(filename) || showDebugInfo({
        filename: filename,
        name: 'Render Error',
        message: 'Template not found'
    });
    return data ? fn(data) : fn;
};


/**
 * 获取编译缓存（可由外部重写此方法）
 * @param   {String}    模板名
 * @param   {Function}  编译好的函数
 */
template.get = function (filename) {

    var cache;
    
    if (cacheStore[filename]) {
        // 使用内存缓存
        cache = cacheStore[filename];
    } else if (typeof document === 'object') {
        // 加载模板并编译
        var elem = document.getElementById(filename);
        
        if (elem) {
            var source = (elem.value || elem.innerHTML)
            .replace(/^\s*|\s*$/g, '');
            cache = compile(source, {
                filename: filename
            });
        }
    }

    return cache;
};


var toString = function (value, type) {

    if (typeof value !== 'string') {

        type = typeof value;
        if (type === 'number') {
            value += '';
        } else if (type === 'function') {
            value = toString(value.call(value));
        } else {
            value = '';
        }
    }

    return value;

};


var escapeMap = {
    "<": "&#60;",
    ">": "&#62;",
    '"': "&#34;",
    "'": "&#39;",
    "&": "&#38;"
};


var escapeFn = function (s) {
    return escapeMap[s];
};

var escapeHTML = function (content) {
    return toString(content)
    .replace(/&(?![\w#]+;)|[<>"']/g, escapeFn);
};


var isArray = Array.isArray || function (obj) {
    return ({}).toString.call(obj) === '[object Array]';
};


var each = function (data, callback) {
    var i, len;        
    if (isArray(data)) {
        for (i = 0, len = data.length; i < len; i++) {
            callback.call(data, data[i], i, data);
        }
    } else {
        for (i in data) {
            callback.call(data, data[i], i);
        }
    }
};


var utils = template.utils = {

	$helpers: {},

    $include: renderFile,

    $string: toString,

    $escape: escapeHTML,

    $each: each
    
};/**
 * 添加模板辅助方法
 * @name    template.helper
 * @param   {String}    名称
 * @param   {Function}  方法
 */
template.helper = function (name, helper) {
    helpers[name] = helper;
};

var helpers = template.helpers = utils.$helpers;




/**
 * 模板错误事件（可由外部重写此方法）
 * @name    template.onerror
 * @event
 */
template.onerror = function (e) {
    var message = 'Template Error\n\n';
    for (var name in e) {
        message += '<' + name + '>\n' + e[name] + '\n\n';
    }
    
    if (typeof console === 'object') {
        console.error(message);
    }
};


// 模板调试器
var showDebugInfo = function (e) {

    template.onerror(e);
    
    return function () {
        return '{Template Error}';
    };
};


/**
 * 编译模板
 * 2012-6-6 @TooBug: define 方法名改为 compile，与 Node Express 保持一致
 * @name    template.compile
 * @param   {String}    模板字符串
 * @param   {Object}    编译选项
 *
 *      - openTag       {String}
 *      - closeTag      {String}
 *      - filename      {String}
 *      - escape        {Boolean}
 *      - compress      {Boolean}
 *      - debug         {Boolean}
 *      - cache         {Boolean}
 *      - parser        {Function}
 *
 * @return  {Function}  渲染方法
 */
var compile = template.compile = function (source, options) {
    
    // 合并默认配置
    options = options || {};
    for (var name in defaults) {
        if (options[name] === undefined) {
            options[name] = defaults[name];
        }
    }


    var filename = options.filename;


    try {
        
        var Render = compiler(source, options);
        
    } catch (e) {
    
        e.filename = filename || 'anonymous';
        e.name = 'Syntax Error';

        return showDebugInfo(e);
        
    }
    
    
    // 对编译结果进行一次包装

    function render (data) {
        
        try {
            
            return new Render(data, filename) + '';
            
        } catch (e) {
            
            // 运行时出错后自动开启调试模式重新编译
            if (!options.debug) {
                options.debug = true;
                return compile(source, options)(data);
            }
            
            return showDebugInfo(e)();
            
        }
        
    }
    

    render.prototype = Render.prototype;
    render.toString = function () {
        return Render.toString();
    };


    if (filename && options.cache) {
        cacheStore[filename] = render;
    }

    
    return render;

};




// 数组迭代
var forEach = utils.$each;


// 静态分析模板变量
var KEYWORDS =
    // 关键字
    'break,case,catch,continue,debugger,default,delete,do,else,false'
    + ',finally,for,function,if,in,instanceof,new,null,return,switch,this'
    + ',throw,true,try,typeof,var,void,while,with'

    // 保留字
    + ',abstract,boolean,byte,char,class,const,double,enum,export,extends'
    + ',final,float,goto,implements,import,int,interface,long,native'
    + ',package,private,protected,public,short,static,super,synchronized'
    + ',throws,transient,volatile'

    // ECMA 5 - use strict
    + ',arguments,let,yield'

    + ',undefined';

var REMOVE_RE = /\/\*[\w\W]*?\*\/|\/\/[^\n]*\n|\/\/[^\n]*$|"(?:[^"\\]|\\[\w\W])*"|'(?:[^'\\]|\\[\w\W])*'|\s*\.\s*[$\w\.]+/g;
var SPLIT_RE = /[^\w$]+/g;
var KEYWORDS_RE = new RegExp(["\\b" + KEYWORDS.replace(/,/g, '\\b|\\b') + "\\b"].join('|'), 'g');
var NUMBER_RE = /^\d[^,]*|,\d[^,]*/g;
var BOUNDARY_RE = /^,+|,+$/g;
var SPLIT2_RE = /^$|,+/;


// 获取变量
function getVariable (code) {
    return code
    .replace(REMOVE_RE, '')
    .replace(SPLIT_RE, ',')
    .replace(KEYWORDS_RE, '')
    .replace(NUMBER_RE, '')
    .replace(BOUNDARY_RE, '')
    .split(SPLIT2_RE);
};


// 字符串转义
function stringify (code) {
    return "'" + code
    // 单引号与反斜杠转义
    .replace(/('|\\)/g, '\\$1')
    // 换行符转义(windows + linux)
    .replace(/\r/g, '\\r')
    .replace(/\n/g, '\\n') + "'";
}


function compiler (source, options) {
    
    var debug = options.debug;
    var openTag = options.openTag;
    var closeTag = options.closeTag;
    var parser = options.parser;
    var compress = options.compress;
    var escape = options.escape;
    

    
    var line = 1;
    var uniq = {$data:1,$filename:1,$utils:1,$helpers:1,$out:1,$line:1};
    


    var isNewEngine = ''.trim;// '__proto__' in {}
    var replaces = isNewEngine
    ? ["$out='';", "$out+=", ";", "$out"]
    : ["$out=[];", "$out.push(", ");", "$out.join('')"];

    var concat = isNewEngine
        ? "$out+=text;return $out;"
        : "$out.push(text);";
          
    var print = "function(){"
    +      "var text=''.concat.apply('',arguments);"
    +       concat
    +  "}";

    var include = "function(filename,data){"
    +      "data=data||$data;"
    +      "var text=$utils.$include(filename,data,$filename);"
    +       concat
    +   "}";

    var headerCode = "'use strict';"
    + "var $utils=this,$helpers=$utils.$helpers,"
    + (debug ? "$line=0," : "");
    
    var mainCode = replaces[0];

    var footerCode = "return new String(" + replaces[3] + ");"
    
    // html与逻辑语法分离
    forEach(source.split(openTag), function (code) {
        code = code.split(closeTag);
        
        var $0 = code[0];
        var $1 = code[1];
        
        // code: [html]
        if (code.length === 1) {
            
            mainCode += html($0);
         
        // code: [logic, html]
        } else {
            
            mainCode += logic($0);
            
            if ($1) {
                mainCode += html($1);
            }
        }
        

    });
    
    var code = headerCode + mainCode + footerCode;
    
    // 调试语句
    if (debug) {
        code = "try{" + code + "}catch(e){"
        +       "throw {"
        +           "filename:$filename,"
        +           "name:'Render Error',"
        +           "message:e.message,"
        +           "line:$line,"
        +           "source:" + stringify(source)
        +           ".split(/\\n/)[$line-1].replace(/^\\s+/,'')"
        +       "};"
        + "}";
    }
    
    
    
    try {
        
        
        var Render = new Function("$data", "$filename", code);
        Render.prototype = utils;

        return Render;
        
    } catch (e) {
        e.temp = "function anonymous($data,$filename) {" + code + "}";
        throw e;
    }



    
    // 处理 HTML 语句
    function html (code) {
        
        // 记录行号
        line += code.split(/\n/).length - 1;

        // 压缩多余空白与注释
        if (compress) {
            code = code
            .replace(/\s+/g, ' ')
            .replace(/<!--[\w\W]*?-->/g, '');
        }
        
        if (code) {
            code = replaces[1] + stringify(code) + replaces[2] + "\n";
        }

        return code;
    }
    
    
    // 处理逻辑语句
    function logic (code) {

        var thisLine = line;
       
        if (parser) {
        
             // 语法转换插件钩子
            code = parser(code, options);
            
        } else if (debug) {
        
            // 记录行号
            code = code.replace(/\n/g, function () {
                line ++;
                return "$line=" + line +  ";";
            });
            
        }
        
        
        // 输出语句. 编码: <%=value%> 不编码:<%=#value%>
        // <%=#value%> 等同 v2.0.3 之前的 <%==value%>
        if (code.indexOf('=') === 0) {

            var escapeSyntax = escape && !/^=[=#]/.test(code);

            code = code.replace(/^=[=#]?|[\s;]*$/g, '');

            // 对内容编码
            if (escapeSyntax) {

                var name = code.replace(/\s*\([^\)]+\)/, '');

                // 排除 utils.* | include | print
                
                if (!utils[name] && !/^(include|print)$/.test(name)) {
                    code = "$escape(" + code + ")";
                }

            // 不编码
            } else {
                code = "$string(" + code + ")";
            }
            

            code = replaces[1] + code + replaces[2];

        }
        
        if (debug) {
            code = "$line=" + thisLine + ";" + code;
        }
        
        // 提取模板中的变量名
        forEach(getVariable(code), function (name) {
            
            // name 值可能为空，在安卓低版本浏览器下
            if (!name || uniq[name]) {
                return;
            }

            var value;

            // 声明模板变量
            // 赋值优先级:
            // [include, print] > utils > helpers > data
            if (name === 'print') {

                value = print;

            } else if (name === 'include') {
                
                value = include;
                
            } else if (utils[name]) {

                value = "$utils." + name;

            } else if (helpers[name]) {

                value = "$helpers." + name;

            } else {

                value = "$data." + name;
            }
            
            headerCode += name + "=" + value + ",";
            uniq[name] = true;
            
            
        });
        
        return code + "\n";
    }
    
    
};



// 定义模板引擎的语法


defaults.openTag = '{{';
defaults.closeTag = '}}';


var filtered = function (js, filter) {
    var parts = filter.split(':');
    var name = parts.shift();
    var args = parts.join(':') || '';

    if (args) {
        args = ', ' + args;
    }

    return '$helpers.' + name + '(' + js + args + ')';
}


defaults.parser = function (code, options) {

    // var match = code.match(/([\w\$]*)(\b.*)/);
    // var key = match[1];
    // var args = match[2];
    // var split = args.split(' ');
    // split.shift();

    code = code.replace(/^\s/, '');

    var split = code.split(' ');
    var key = split.shift();
    var args = split.join(' ');

    

    switch (key) {

        case 'if':

            code = 'if(' + args + '){';
            break;

        case 'else':
            
            if (split.shift() === 'if') {
                split = ' if(' + split.join(' ') + ')';
            } else {
                split = '';
            }

            code = '}else' + split + '{';
            break;

        case '/if':

            code = '}';
            break;

        case 'each':
            
            var object = split[0] || '$data';
            var as     = split[1] || 'as';
            var value  = split[2] || '$value';
            var index  = split[3] || '$index';
            
            var param   = value + ',' + index;
            
            if (as !== 'as') {
                object = '[]';
            }
            
            code =  '$each(' + object + ',function(' + param + '){';
            break;

        case '/each':

            code = '});';
            break;

        case 'echo':

            code = 'print(' + args + ');';
            break;

        case 'print':
        case 'include':

            code = key + '(' + split.join(',') + ');';
            break;

        default:

            // 过滤器（辅助方法）
            // {{value | filterA:'abcd' | filterB}}
            // >>> $helpers.filterB($helpers.filterA(value, 'abcd'))
            // TODO: {{ddd||aaa}} 不包含空格
            if (/^\s*\|\s*[\w\$]/.test(args)) {

                var escape = true;

                // {{#value | link}}
                if (code.indexOf('#') === 0) {
                    code = code.substr(1);
                    escape = false;
                }

                var i = 0;
                var array = code.split('|');
                var len = array.length;
                var val = array[i++];

                for (; i < len; i ++) {
                    val = filtered(val, array[i]);
                }

                code = (escape ? '=' : '=#') + val;

            // 即将弃用 {{helperName value}}
            } else if (template.helpers[key]) {
                
                code = '=#' + key + '(' + split.join(',') + ');';
            
            // 内容直接输出 {{value}}
            } else {

                code = '=' + code;
            }

            break;
    }
    
    
    return code;
};



// RequireJS && SeaJS
if (typeof define === 'function') {
    define('lib/artTemplate',[],function() {
        return template;
    });

// NodeJS
} else if (typeof exports !== 'undefined') {
    module.exports = template;
} else {
    this.template = template;
}

})();
define('src/web/layer/layerapi',['lib/artTemplate'],

    /**
     * layerapi，封装一些管理基本事件。
     * 本api依赖于 crema css， index.html页面需要有 div.pages 容器。
     * refresh 需要设定refresh的容易：page-content
     * @static
     */

    function(template) {
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


            var fetchData = {};

            fetchData.json = function(options, arthtml){
                var now = Date.now();
                $.ajax({
                   url: options.url,
                    type: 'get',
                    dataType: "json",
                    success: function(data){

                        if (typeof(data) === "object") {

                            var json = data.Data;
                            var art = template.compile(arthtml);
                            var artRenderHtml = art(json);
                            renderData(artRenderHtml);

                        } else if(typeof(data) === "string"){

                            if (data.indexOf('<article') !== -1) {
                                fetchData.html(options);
                            } else{
                                var json = window.JSON.parse(data);
                                var art = template.compile(arthtml);
                                var artRenderHtml = art(json);
                                renderData(artRenderHtml);
                            };

                        };

                    },
                    error: function(err,type) {
                        console.log(err);
                        if (type === 'abort' && Date.now() - now < 1000) {//1000ms以内的abort
                            location.href=options.url;//当发现跨域等情况出现abort，则直接跳转。
                            return;
                        }
                        
                    }
                })

            }

            fetchData.html = function(options){

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

            }

            if (options.tpl) {

                $.get(options.tpl, function(tplHtml){
                    fetchData.json(options, tplHtml);
                });

            }else {

                fetchData.html(options);
            }

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
        if ($('script[type="text/javascript"]',dom).length){
            $('script[type="text/javascript"]',dom).each(function(){
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

    'src/web/Layer',['require','src/common/lib','src/web/WebControl','src/web/blend','src/web/layer/layerapi','src/common/loader'],function (require) {


        var lib = require('src/common/lib');
        var Control = require('src/web/WebControl');
        var blend = require('src/web/blend');
        
        var layerApi = require('src/web/layer/layerapi');

        var lowerAnimate = false;//$("html").hasClass("android");

        var loader = require('src/common/loader');

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
                this.main.innerHTML = '';
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
                tpl: me.tpl,
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
                $(this.main).append('<div class="preloader-indicator-overlay"></div><div class="preloader-indicator-modal"><span class="preloader"></span></div>');
            return this;
        };
        /**
         * 停止loading状态
         * @returns this
         */
        Layer.prototype.stopLoading = function(){
            $('.preloader-indicator-overlay').remove();
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

    'src/web/layer/layerGroupApi',['require','src/web/layer/layerapi'],function(require) {

        var api = {};

        var layerapi = require('src/web/layer/layerapi');
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
define('src/web/LayerGroup',['require','src/web/blend','src/common/lib','src/web/WebControl','src/web/layer/layerGroupApi','src/web/layer/layerapi','src/web/Layer'],function(require) {

    var blend = require('src/web/blend');
    var lib = require('src/common/lib');
    // var Control = require('src/web/Control');
    var Control = require('src/web/WebControl');
    //是否是runtime运行环境
    var isRuntimeEnv = false;//main.inRuntime();//runtime.isRuntimeEnv&&runtime.isRuntimeEnv();
    // var groupApi = runtime.layerGroup;

    var groupApi = require('src/web/layer/layerGroupApi');
    var layerApi = require('src/web/layer/layerapi');

    var layer = require('src/web/Layer');
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

define('src/web/main',['src/web/blend','src/web/Layer','src/web/LayerGroup'], function (blend, layer,layergroup) {
    "use strict";

    blend = blend||{};
    
	//layer
    blend.Layer = layer;
    blend.LayerGroup = layergroup;
    
    // window.Blend = blend;
    window.Blend = window.Blend || {};//初始化window的blend 对象 ， 将 blend 作为模块 绑定到 Blend.ui 上
    window.Blend.ui = blend;

    return blend;
    
});
/**
 * History.js Zepto Adapter
 * @author Benjamin Arthur Lupton <contact@balupton.com>
 * @copyright 2010-2011 Benjamin Arthur Lupton <contact@balupton.com>
 * @license New BSD License <http://creativecommons.org/licenses/BSD/>
 */

// Closure
define('lib/zepto.history',['lib/zepto'],function(){
if ( typeof History !== 'undefined' && typeof History.Adapter !== 'undefined' ) {
	return;
}
// console.log("ininin");

(function(window,undefined){
	"use strict";

	// Localise Globals
	var
		History = window.History = window.History||{},
		Zepto = window.Zepto;

	// Check Existence
	if ( typeof History.Adapter !== 'undefined' ) {
		throw new Error('History.js Adapter has already been loaded...');
	}

	// Add the Adapter
	History.Adapter = {
		/**
		 * History.Adapter.bind(el,event,callback)
		 * @param {Element|string} el
		 * @param {string} event - custom and standard events
		 * @param {function} callback
		 * @return {void}
		 */
		bind: function(el,event,callback){
			new Zepto(el).bind(event,callback);
		},

		/**
		 * History.Adapter.trigger(el,event)
		 * @param {Element|string} el
		 * @param {string} event - custom and standard events
		 * @return {void}
		 */
		trigger: function(el,event){
			new Zepto(el).trigger(event);
		},

		/**
		 * History.Adapter.extractEventData(key,event,extra)
		 * @param {string} key - key for the event data to extract
		 * @param {string} event - custom and standard events
		 * @return {mixed}
		 */
		extractEventData: function(key,event){
			// Zepto Native
			var result = (event && event[key]) || undefined;

			// Return
			return result;
		},

		/**
		 * History.Adapter.onDomLoad(callback)
		 * @param {function} callback
		 * @return {void}
		 */
		onDomLoad: function(callback) {
			new Zepto(callback);
		}
	};

	// Try and Initialise History
	if ( typeof History.init !== 'undefined' ) {
		History.init();
	}

})(window);
/**
 * History.js Core
 * @author Benjamin Arthur Lupton <contact@balupton.com>
 * @copyright 2010-2011 Benjamin Arthur Lupton <contact@balupton.com>
 * @license New BSD License <http://creativecommons.org/licenses/BSD/>
 */

(function(window,undefined){
	"use strict";

	// ========================================================================
	// Initialise

	// Localise Globals
	var
		console = window.console||undefined, // Prevent a JSLint complain
		document = window.document, // Make sure we are using the correct document
		navigator = window.navigator, // Make sure we are using the correct navigator
		sessionStorage = false, // sessionStorage
		setTimeout = window.setTimeout,
		clearTimeout = window.clearTimeout,
		setInterval = window.setInterval,
		clearInterval = window.clearInterval,
		JSON = window.JSON,
		alert = window.alert,
		History = window.History = window.History||{}, // Public History Object
		history = window.history; // Old History Object

	try {
		sessionStorage = window.sessionStorage; // This will throw an exception in some browsers when cookies/localStorage are explicitly disabled (i.e. Chrome)
		sessionStorage.setItem('TEST', '1');
		sessionStorage.removeItem('TEST');
	} catch(e) {
		sessionStorage = false;
	}

	// MooTools Compatibility
	JSON.stringify = JSON.stringify||JSON.encode;
	JSON.parse = JSON.parse||JSON.decode;

	// Check Existence
	if ( typeof History.init !== 'undefined' ) {
		throw new Error('History.js Core has already been loaded...');
	}

	// Initialise History
	History.init = function(options){
		// Check Load Status of Adapter
		if ( typeof History.Adapter === 'undefined' ) {
			return false;
		}

		// Check Load Status of Core
		if ( typeof History.initCore !== 'undefined' ) {
			History.initCore();
		}

		// Check Load Status of HTML4 Support
		if ( typeof History.initHtml4 !== 'undefined' ) {
			History.initHtml4();
		}

		// Return true
		return true;
	};


	// ========================================================================
	// Initialise Core

	// Initialise Core
	History.initCore = function(options){
		// Initialise
		if ( typeof History.initCore.initialized !== 'undefined' ) {
			// Already Loaded
			return false;
		}
		else {
			History.initCore.initialized = true;
		}


		// ====================================================================
		// Options

		/**
		 * History.options
		 * Configurable options
		 */
		History.options = History.options||{};

		/**
		 * History.options.hashChangeInterval
		 * How long should the interval be before hashchange checks
		 */
		History.options.hashChangeInterval = History.options.hashChangeInterval || 100;

		/**
		 * History.options.safariPollInterval
		 * How long should the interval be before safari poll checks
		 */
		History.options.safariPollInterval = History.options.safariPollInterval || 500;

		/**
		 * History.options.doubleCheckInterval
		 * How long should the interval be before we perform a double check
		 */
		History.options.doubleCheckInterval = History.options.doubleCheckInterval || 500;

		/**
		 * History.options.disableSuid
		 * Force History not to append suid
		 */
		History.options.disableSuid = History.options.disableSuid || false;

		/**
		 * History.options.storeInterval
		 * How long should we wait between store calls
		 */
		History.options.storeInterval = History.options.storeInterval || 1000;

		/**
		 * History.options.busyDelay
		 * How long should we wait between busy events
		 */
		History.options.busyDelay = History.options.busyDelay || 250;

		/**
		 * History.options.debug
		 * If true will enable debug messages to be logged
		 */
		History.options.debug = History.options.debug || false;

		/**
		 * History.options.initialTitle
		 * What is the title of the initial state
		 */
		History.options.initialTitle = History.options.initialTitle || document.title;

		/**
		 * History.options.html4Mode
		 * If true, will force HTMl4 mode (hashtags)
		 */
		History.options.html4Mode = History.options.html4Mode || false;

		/**
		 * History.options.delayInit
		 * Want to override default options and call init manually.
		 */
		History.options.delayInit = History.options.delayInit || false;


		// ====================================================================
		// Interval record

		/**
		 * History.intervalList
		 * List of intervals set, to be cleared when document is unloaded.
		 */
		History.intervalList = [];

		/**
		 * History.clearAllIntervals
		 * Clears all setInterval instances.
		 */
		History.clearAllIntervals = function(){
			var i, il = History.intervalList;
			if (typeof il !== "undefined" && il !== null) {
				for (i = 0; i < il.length; i++) {
					clearInterval(il[i]);
				}
				History.intervalList = null;
			}
		};


		// ====================================================================
		// Debug

		/**
		 * History.debug(message,...)
		 * Logs the passed arguments if debug enabled
		 */
		History.debug = function(){
			if ( (History.options.debug||false) ) {
				History.log.apply(History,arguments);
			}
		};

		/**
		 * History.log(message,...)
		 * Logs the passed arguments
		 */
		History.log = function(){
			// Prepare
			var
				consoleExists = !(typeof console === 'undefined' || typeof console.log === 'undefined' || typeof console.log.apply === 'undefined'),
				textarea = document.getElementById('log'),
				message,
				i,n,
				args,arg
				;

			// Write to Console
			if ( consoleExists ) {
				args = Array.prototype.slice.call(arguments);
				message = args.shift();
				if ( typeof console.debug !== 'undefined' ) {
					console.debug.apply(console,[message,args]);
				}
				else {
					console.log.apply(console,[message,args]);
				}
			}
			else {
				message = ("\n"+arguments[0]+"\n");
			}

			// Write to log
			for ( i=1,n=arguments.length; i<n; ++i ) {
				arg = arguments[i];
				if ( typeof arg === 'object' && typeof JSON !== 'undefined' ) {
					try {
						arg = JSON.stringify(arg);
					}
					catch ( Exception ) {
						// Recursive Object
					}
				}
				message += "\n"+arg+"\n";
			}

			// Textarea
			if ( textarea ) {
				textarea.value += message+"\n-----\n";
				textarea.scrollTop = textarea.scrollHeight - textarea.clientHeight;
			}
			// No Textarea, No Console
			else if ( !consoleExists ) {
				alert(message);
			}

			// Return true
			return true;
		};


		// ====================================================================
		// Emulated Status

		/**
		 * History.getInternetExplorerMajorVersion()
		 * Get's the major version of Internet Explorer
		 * @return {integer}
		 * @license Public Domain
		 * @author Benjamin Arthur Lupton <contact@balupton.com>
		 * @author James Padolsey <https://gist.github.com/527683>
		 */
		History.getInternetExplorerMajorVersion = function(){
			var result = History.getInternetExplorerMajorVersion.cached =
					(typeof History.getInternetExplorerMajorVersion.cached !== 'undefined')
				?	History.getInternetExplorerMajorVersion.cached
				:	(function(){
						var v = 3,
								div = document.createElement('div'),
								all = div.getElementsByTagName('i');
						while ( (div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->') && all[0] ) {}
						return (v > 4) ? v : false;
					})()
				;
			return result;
		};

		/**
		 * History.isInternetExplorer()
		 * Are we using Internet Explorer?
		 * @return {boolean}
		 * @license Public Domain
		 * @author Benjamin Arthur Lupton <contact@balupton.com>
		 */
		History.isInternetExplorer = function(){
			var result =
				History.isInternetExplorer.cached =
				(typeof History.isInternetExplorer.cached !== 'undefined')
					?	History.isInternetExplorer.cached
					:	Boolean(History.getInternetExplorerMajorVersion())
				;
			return result;
		};

		/**
		 * History.emulated
		 * Which features require emulating?
		 */

		if (History.options.html4Mode) {
			History.emulated = {
				pushState : true,
				hashChange: true
			};
		}

		else {

			History.emulated = {
				pushState: !Boolean(
					window.history && window.history.pushState && window.history.replaceState
					
				),
				hashChange: Boolean(
					!(('onhashchange' in window) || ('onhashchange' in document))
					||
					(History.isInternetExplorer() && History.getInternetExplorerMajorVersion() < 8)
				)
			};
		}

		/**
		 * History.enabled
		 * Is History enabled?
		 */
		History.enabled = !History.emulated.pushState;

		/**
		 * History.bugs
		 * Which bugs are present
		 */
		History.bugs = {
			/**
			 * Safari 5 and Safari iOS 4 fail to return to the correct state once a hash is replaced by a `replaceState` call
			 * https://bugs.webkit.org/show_bug.cgi?id=56249
			 */
			setHash: Boolean(!History.emulated.pushState && navigator.vendor === 'Apple Computer, Inc.' && /AppleWebKit\/5([0-2]|3[0-3])/.test(navigator.userAgent)),

			/**
			 * Safari 5 and Safari iOS 4 sometimes fail to apply the state change under busy conditions
			 * https://bugs.webkit.org/show_bug.cgi?id=42940
			 */
			safariPoll: Boolean(!History.emulated.pushState && navigator.vendor === 'Apple Computer, Inc.' && /AppleWebKit\/5([0-2]|3[0-3])/.test(navigator.userAgent)),

			/**
			 * MSIE 6 and 7 sometimes do not apply a hash even it was told to (requiring a second call to the apply function)
			 */
			ieDoubleCheck: Boolean(History.isInternetExplorer() && History.getInternetExplorerMajorVersion() < 8),

			/**
			 * MSIE 6 requires the entire hash to be encoded for the hashes to trigger the onHashChange event
			 */
			hashEscape: Boolean(History.isInternetExplorer() && History.getInternetExplorerMajorVersion() < 7)
		};

		/**
		 * History.isEmptyObject(obj)
		 * Checks to see if the Object is Empty
		 * @param {Object} obj
		 * @return {boolean}
		 */
		History.isEmptyObject = function(obj) {
			for ( var name in obj ) {
				if ( obj.hasOwnProperty(name) ) {
					return false;
				}
			}
			return true;
		};

		/**
		 * History.cloneObject(obj)
		 * Clones a object and eliminate all references to the original contexts
		 * @param {Object} obj
		 * @return {Object}
		 */
		History.cloneObject = function(obj) {
			var hash,newObj;
			if ( obj ) {
				hash = JSON.stringify(obj);
				newObj = JSON.parse(hash);
			}
			else {
				newObj = {};
			}
			return newObj;
		};


		// ====================================================================
		// URL Helpers

		/**
		 * History.getRootUrl()
		 * Turns "http://mysite.com/dir/page.html?asd" into "http://mysite.com"
		 * @return {String} rootUrl
		 */
		History.getRootUrl = function(){
			// Create
			var rootUrl = document.location.protocol+'//'+(document.location.hostname||document.location.host);
			if ( document.location.port||false ) {
				rootUrl += ':'+document.location.port;
			}
			rootUrl += '/';

			// Return
			return rootUrl;
		};

		/**
		 * History.getBaseHref()
		 * Fetches the `href` attribute of the `<base href="...">` element if it exists
		 * @return {String} baseHref
		 */
		History.getBaseHref = function(){
			// Create
			var
				baseElements = document.getElementsByTagName('base'),
				baseElement = null,
				baseHref = '';

			// Test for Base Element
			if ( baseElements.length === 1 ) {
				// Prepare for Base Element
				baseElement = baseElements[0];
				baseHref = baseElement.href.replace(/[^\/]+$/,'');
			}

			// Adjust trailing slash
			baseHref = baseHref.replace(/\/+$/,'');
			if ( baseHref ) baseHref += '/';

			// Return
			return baseHref;
		};

		/**
		 * History.getBaseUrl()
		 * Fetches the baseHref or basePageUrl or rootUrl (whichever one exists first)
		 * @return {String} baseUrl
		 */
		History.getBaseUrl = function(){
			// Create
			var baseUrl = History.getBaseHref()||History.getBasePageUrl()||History.getRootUrl();

			// Return
			return baseUrl;
		};

		/**
		 * History.getPageUrl()
		 * Fetches the URL of the current page
		 * @return {String} pageUrl
		 */
		History.getPageUrl = function(){
			// Fetch
			var
				State = History.getState(false,false),
				stateUrl = (State||{}).url||History.getLocationHref(),
				pageUrl;

			// Create
			pageUrl = stateUrl.replace(/\/+$/,'').replace(/[^\/]+$/,function(part,index,string){
				return (/\./).test(part) ? part : part+'/';
			});

			// Return
			return pageUrl;
		};

		/**
		 * History.getBasePageUrl()
		 * Fetches the Url of the directory of the current page
		 * @return {String} basePageUrl
		 */
		History.getBasePageUrl = function(){
			// Create
			var basePageUrl = (History.getLocationHref()).replace(/[#\?].*/,'').replace(/[^\/]+$/,function(part,index,string){
				return (/[^\/]$/).test(part) ? '' : part;
			}).replace(/\/+$/,'')+'/';

			// Return
			return basePageUrl;
		};

		/**
		 * History.getFullUrl(url)
		 * Ensures that we have an absolute URL and not a relative URL
		 * @param {string} url
		 * @param {Boolean} allowBaseHref
		 * @return {string} fullUrl
		 */
		History.getFullUrl = function(url,allowBaseHref){
			// Prepare
			var fullUrl = url, firstChar = url.substring(0,1);
			allowBaseHref = (typeof allowBaseHref === 'undefined') ? true : allowBaseHref;

			// Check
			if ( /[a-z]+\:\/\//.test(url) ) {
				// Full URL
			}
			else if ( firstChar === '/' ) {
				// Root URL
				fullUrl = History.getRootUrl()+url.replace(/^\/+/,'');
			}
			else if ( firstChar === '#' ) {
				// Anchor URL
				fullUrl = History.getPageUrl().replace(/#.*/,'')+url;
			}
			else if ( firstChar === '?' ) {
				// Query URL
				fullUrl = History.getPageUrl().replace(/[\?#].*/,'')+url;
			}
			else {
				// Relative URL
				if ( allowBaseHref ) {
					fullUrl = History.getBaseUrl()+url.replace(/^(\.\/)+/,'');
				} else {
					fullUrl = History.getBasePageUrl()+url.replace(/^(\.\/)+/,'');
				}
				// We have an if condition above as we do not want hashes
				// which are relative to the baseHref in our URLs
				// as if the baseHref changes, then all our bookmarks
				// would now point to different locations
				// whereas the basePageUrl will always stay the same
			}

			// Return
			return fullUrl.replace(/\#$/,'');
		};

		/**
		 * History.getShortUrl(url)
		 * Ensures that we have a relative URL and not a absolute URL
		 * @param {string} url
		 * @return {string} url
		 */
		History.getShortUrl = function(url){
			// Prepare
			var shortUrl = url, baseUrl = History.getBaseUrl(), rootUrl = History.getRootUrl();

			// Trim baseUrl
			if ( History.emulated.pushState ) {
				// We are in a if statement as when pushState is not emulated
				// The actual url these short urls are relative to can change
				// So within the same session, we the url may end up somewhere different
				shortUrl = shortUrl.replace(baseUrl,'');
			}

			// Trim rootUrl
			shortUrl = shortUrl.replace(rootUrl,'/');

			// Ensure we can still detect it as a state
			if ( History.isTraditionalAnchor(shortUrl) ) {
				shortUrl = './'+shortUrl;
			}

			// Clean It
			shortUrl = shortUrl.replace(/^(\.\/)+/g,'./').replace(/\#$/,'');

			// Return
			return shortUrl;
		};

		/**
		 * History.getLocationHref(document)
		 * Returns a normalized version of document.location.href
		 * accounting for browser inconsistencies, etc.
		 *
		 * This URL will be URI-encoded and will include the hash
		 *
		 * @param {object} document
		 * @return {string} url
		 */
		History.getLocationHref = function(doc) {
			doc = doc || document;

			// most of the time, this will be true
			if (doc.URL === doc.location.href)
				return doc.location.href;

			// some versions of webkit URI-decode document.location.href
			// but they leave document.URL in an encoded state
			if (doc.location.href === decodeURIComponent(doc.URL))
				return doc.URL;

			// FF 3.6 only updates document.URL when a page is reloaded
			// document.location.href is updated correctly
			if (doc.location.hash && decodeURIComponent(doc.location.href.replace(/^[^#]+/, "")) === doc.location.hash)
				return doc.location.href;

			if (doc.URL.indexOf('#') == -1 && doc.location.href.indexOf('#') != -1)
				return doc.location.href;
			
			return doc.URL || doc.location.href;
		};


		// ====================================================================
		// State Storage

		/**
		 * History.store
		 * The store for all session specific data
		 */
		History.store = {};

		/**
		 * History.idToState
		 * 1-1: State ID to State Object
		 */
		History.idToState = History.idToState||{};

		/**
		 * History.stateToId
		 * 1-1: State String to State ID
		 */
		History.stateToId = History.stateToId||{};

		/**
		 * History.urlToId
		 * 1-1: State URL to State ID
		 */
		History.urlToId = History.urlToId||{};

		/**
		 * History.storedStates
		 * Store the states in an array
		 */
		History.storedStates = History.storedStates||[];

		/**
		 * History.savedStates
		 * Saved the states in an array
		 */
		History.savedStates = History.savedStates||[];

		/**
		 * History.noramlizeStore()
		 * Noramlize the store by adding necessary values
		 */
		History.normalizeStore = function(){
			History.store.idToState = History.store.idToState||{};
			History.store.urlToId = History.store.urlToId||{};
			History.store.stateToId = History.store.stateToId||{};
		};

		/**
		 * History.getState()
		 * Get an object containing the data, title and url of the current state
		 * @param {Boolean} friendly
		 * @param {Boolean} create
		 * @return {Object} State
		 */
		History.getState = function(friendly,create){
			// Prepare
			if ( typeof friendly === 'undefined' ) { friendly = true; }
			if ( typeof create === 'undefined' ) { create = true; }

			// Fetch
			var State = History.getLastSavedState();

			// Create
			if ( !State && create ) {
				State = History.createStateObject();
			}

			// Adjust
			if ( friendly ) {
				State = History.cloneObject(State);
				State.url = State.cleanUrl||State.url;
			}

			// Return
			return State;
		};

		/**
		 * History.getIdByState(State)
		 * Gets a ID for a State
		 * @param {State} newState
		 * @return {String} id
		 */
		History.getIdByState = function(newState){

			// Fetch ID
			var id = History.extractId(newState.url),
				str;

			if ( !id ) {
				// Find ID via State String
				str = History.getStateString(newState);
				if ( typeof History.stateToId[str] !== 'undefined' ) {
					id = History.stateToId[str];
				}
				else if ( typeof History.store.stateToId[str] !== 'undefined' ) {
					id = History.store.stateToId[str];
				}
				else {
					// Generate a new ID
					while ( true ) {
						id = (new Date()).getTime() + String(Math.random()).replace(/\D/g,'');
						if ( typeof History.idToState[id] === 'undefined' && typeof History.store.idToState[id] === 'undefined' ) {
							break;
						}
					}

					// Apply the new State to the ID
					History.stateToId[str] = id;
					History.idToState[id] = newState;
				}
			}

			// Return ID
			return id;
		};

		/**
		 * History.normalizeState(State)
		 * Expands a State Object
		 * @param {object} State
		 * @return {object}
		 */
		History.normalizeState = function(oldState){
			// Variables
			var newState, dataNotEmpty;

			// Prepare
			if ( !oldState || (typeof oldState !== 'object') ) {
				oldState = {};
			}

			// Check
			if ( typeof oldState.normalized !== 'undefined' ) {
				return oldState;
			}

			// Adjust
			if ( !oldState.data || (typeof oldState.data !== 'object') ) {
				oldState.data = {};
			}

			// ----------------------------------------------------------------

			// Create
			newState = {};
			newState.normalized = true;
			newState.title = oldState.title||'';
			newState.url = History.getFullUrl(oldState.url?oldState.url:(History.getLocationHref()));
			newState.hash = History.getShortUrl(newState.url);
			newState.data = History.cloneObject(oldState.data);

			// Fetch ID
			newState.id = History.getIdByState(newState);

			// ----------------------------------------------------------------

			// Clean the URL
			newState.cleanUrl = newState.url.replace(/\??\&_suid.*/,'');
			newState.url = newState.cleanUrl;

			// Check to see if we have more than just a url
			dataNotEmpty = !History.isEmptyObject(newState.data);

			// Apply
			if ( (newState.title || dataNotEmpty) && History.options.disableSuid !== true ) {
				// Add ID to Hash
				newState.hash = History.getShortUrl(newState.url).replace(/\??\&_suid.*/,'');
				if ( !/\?/.test(newState.hash) ) {
					newState.hash += '?';
				}
				newState.hash += '&_suid='+newState.id;
			}

			// Create the Hashed URL
			newState.hashedUrl = History.getFullUrl(newState.hash);

			// ----------------------------------------------------------------

			// Update the URL if we have a duplicate
			if ( (History.emulated.pushState || History.bugs.safariPoll) && History.hasUrlDuplicate(newState) ) {
				newState.url = newState.hashedUrl;
			}

			// ----------------------------------------------------------------

			// Return
			return newState;
		};

		/**
		 * History.createStateObject(data,title,url)
		 * Creates a object based on the data, title and url state params
		 * @param {object} data
		 * @param {string} title
		 * @param {string} url
		 * @return {object}
		 */
		History.createStateObject = function(data,title,url){
			// Hashify
			var State = {
				'data': data,
				'title': title,
				'url': url
			};

			// Expand the State
			State = History.normalizeState(State);

			// Return object
			return State;
		};

		/**
		 * History.getStateById(id)
		 * Get a state by it's UID
		 * @param {String} id
		 */
		History.getStateById = function(id){
			// Prepare
			id = String(id);

			// Retrieve
			var State = History.idToState[id] || History.store.idToState[id] || undefined;

			// Return State
			return State;
		};

		/**
		 * Get a State's String
		 * @param {State} passedState
		 */
		History.getStateString = function(passedState){
			// Prepare
			var State, cleanedState, str;

			// Fetch
			State = History.normalizeState(passedState);

			// Clean
			cleanedState = {
				data: State.data,
				title: passedState.title,
				url: passedState.url
			};

			// Fetch
			str = JSON.stringify(cleanedState);

			// Return
			return str;
		};

		/**
		 * Get a State's ID
		 * @param {State} passedState
		 * @return {String} id
		 */
		History.getStateId = function(passedState){
			// Prepare
			var State, id;

			// Fetch
			State = History.normalizeState(passedState);

			// Fetch
			id = State.id;

			// Return
			return id;
		};

		/**
		 * History.getHashByState(State)
		 * Creates a Hash for the State Object
		 * @param {State} passedState
		 * @return {String} hash
		 */
		History.getHashByState = function(passedState){
			// Prepare
			var State, hash;

			// Fetch
			State = History.normalizeState(passedState);

			// Hash
			hash = State.hash;

			// Return
			return hash;
		};

		/**
		 * History.extractId(url_or_hash)
		 * Get a State ID by it's URL or Hash
		 * @param {string} url_or_hash
		 * @return {string} id
		 */
		History.extractId = function ( url_or_hash ) {
			// Prepare
			var id,parts,url, tmp;

			// Extract
			
			// If the URL has a #, use the id from before the #
			if (url_or_hash.indexOf('#') != -1)
			{
				tmp = url_or_hash.split("#")[0];
			}
			else
			{
				tmp = url_or_hash;
			}
			
			parts = /(.*)\&_suid=([0-9]+)$/.exec(tmp);
			url = parts ? (parts[1]||url_or_hash) : url_or_hash;
			id = parts ? String(parts[2]||'') : '';

			// Return
			return id||false;
		};

		/**
		 * History.isTraditionalAnchor
		 * Checks to see if the url is a traditional anchor or not
		 * @param {String} url_or_hash
		 * @return {Boolean}
		 */
		History.isTraditionalAnchor = function(url_or_hash){
			// Check
			var isTraditional = !(/[\/\?\.]/.test(url_or_hash));

			// Return
			return isTraditional;
		};

		/**
		 * History.extractState
		 * Get a State by it's URL or Hash
		 * @param {String} url_or_hash
		 * @return {State|null}
		 */
		History.extractState = function(url_or_hash,create){
			// Prepare
			var State = null, id, url;
			create = create||false;

			// Fetch SUID
			id = History.extractId(url_or_hash);
			if ( id ) {
				State = History.getStateById(id);
			}

			// Fetch SUID returned no State
			if ( !State ) {
				// Fetch URL
				url = History.getFullUrl(url_or_hash);

				// Check URL
				id = History.getIdByUrl(url)||false;
				if ( id ) {
					State = History.getStateById(id);
				}

				// Create State
				if ( !State && create && !History.isTraditionalAnchor(url_or_hash) ) {
					State = History.createStateObject(null,null,url);
				}
			}

			// Return
			return State;
		};

		/**
		 * History.getIdByUrl()
		 * Get a State ID by a State URL
		 */
		History.getIdByUrl = function(url){
			// Fetch
			var id = History.urlToId[url] || History.store.urlToId[url] || undefined;

			// Return
			return id;
		};

		/**
		 * History.getLastSavedState()
		 * Get an object containing the data, title and url of the current state
		 * @return {Object} State
		 */
		History.getLastSavedState = function(){
			return History.savedStates[History.savedStates.length-1]||undefined;
		};

		/**
		 * History.getLastStoredState()
		 * Get an object containing the data, title and url of the current state
		 * @return {Object} State
		 */
		History.getLastStoredState = function(){
			return History.storedStates[History.storedStates.length-1]||undefined;
		};

		/**
		 * History.hasUrlDuplicate
		 * Checks if a Url will have a url conflict
		 * @param {Object} newState
		 * @return {Boolean} hasDuplicate
		 */
		History.hasUrlDuplicate = function(newState) {
			// Prepare
			var hasDuplicate = false,
				oldState;

			// Fetch
			oldState = History.extractState(newState.url);

			// Check
			hasDuplicate = oldState && oldState.id !== newState.id;

			// Return
			return hasDuplicate;
		};

		/**
		 * History.storeState
		 * Store a State
		 * @param {Object} newState
		 * @return {Object} newState
		 */
		History.storeState = function(newState){
			// Store the State
			History.urlToId[newState.url] = newState.id;

			// Push the State
			History.storedStates.push(History.cloneObject(newState));

			// Return newState
			return newState;
		};

		/**
		 * History.isLastSavedState(newState)
		 * Tests to see if the state is the last state
		 * @param {Object} newState
		 * @return {boolean} isLast
		 */
		History.isLastSavedState = function(newState){
			// Prepare
			var isLast = false,
				newId, oldState, oldId;

			// Check
			if ( History.savedStates.length ) {
				newId = newState.id;
				oldState = History.getLastSavedState();
				oldId = oldState.id;

				// Check
				isLast = (newId === oldId);
			}

			// Return
			return isLast;
		};

		/**
		 * History.saveState
		 * Push a State
		 * @param {Object} newState
		 * @return {boolean} changed
		 */
		History.saveState = function(newState){
			// Check Hash
			if ( History.isLastSavedState(newState) ) {
				return false;
			}

			// Push the State
			History.savedStates.push(History.cloneObject(newState));

			// Return true
			return true;
		};

		/**
		 * History.getStateByIndex()
		 * Gets a state by the index
		 * @param {integer} index
		 * @return {Object}
		 */
		History.getStateByIndex = function(index){
			// Prepare
			var State = null;

			// Handle
			if ( typeof index === 'undefined' ) {
				// Get the last inserted
				State = History.savedStates[History.savedStates.length-1];
			}
			else if ( index < 0 ) {
				// Get from the end
				State = History.savedStates[History.savedStates.length+index];
			}
			else {
				// Get from the beginning
				State = History.savedStates[index];
			}

			// Return State
			return State;
		};
		
		/**
		 * History.getCurrentIndex()
		 * Gets the current index
		 * @return (integer)
		*/
		History.getCurrentIndex = function(){
			// Prepare
			var index = null;
			
			// No states saved
			if(History.savedStates.length < 1) {
				index = 0;
			}
			else {
				index = History.savedStates.length-1;
			}
			return index;
		};

		// ====================================================================
		// Hash Helpers

		/**
		 * History.getHash()
		 * @param {Location=} location
		 * Gets the current document hash
		 * Note: unlike location.hash, this is guaranteed to return the escaped hash in all browsers
		 * @return {string}
		 */
		History.getHash = function(doc){
			var url = History.getLocationHref(doc),
				hash;
			hash = History.getHashByUrl(url);
			return hash;
		};

		/**
		 * History.unescapeHash()
		 * normalize and Unescape a Hash
		 * @param {String} hash
		 * @return {string}
		 */
		History.unescapeHash = function(hash){
			// Prepare
			var result = History.normalizeHash(hash);

			// Unescape hash
			result = decodeURIComponent(result);

			// Return result
			return result;
		};

		/**
		 * History.normalizeHash()
		 * normalize a hash across browsers
		 * @return {string}
		 */
		History.normalizeHash = function(hash){
			// Prepare
			var result = hash.replace(/[^#]*#/,'').replace(/#.*/, '');

			// Return result
			return result;
		};

		/**
		 * History.setHash(hash)
		 * Sets the document hash
		 * @param {string} hash
		 * @return {History}
		 */
		History.setHash = function(hash,queue){
			// Prepare
			var State, pageUrl;

			// Handle Queueing
			if ( queue !== false && History.busy() ) {
				// Wait + Push to Queue
				//History.debug('History.setHash: we must wait', arguments);
				History.pushQueue({
					scope: History,
					callback: History.setHash,
					args: arguments,
					queue: queue
				});
				return false;
			}

			// Log
			//History.debug('History.setHash: called',hash);

			// Make Busy + Continue
			History.busy(true);

			// Check if hash is a state
			State = History.extractState(hash,true);
			if ( State && !History.emulated.pushState ) {
				// Hash is a state so skip the setHash
				//History.debug('History.setHash: Hash is a state so skipping the hash set with a direct pushState call',arguments);

				// PushState
				History.pushState(State.data,State.title,State.url,false);
			}
			else if ( History.getHash() !== hash ) {
				// Hash is a proper hash, so apply it

				// Handle browser bugs
				if ( History.bugs.setHash ) {
					// Fix Safari Bug https://bugs.webkit.org/show_bug.cgi?id=56249

					// Fetch the base page
					pageUrl = History.getPageUrl();

					// Safari hash apply
					History.pushState(null,null,pageUrl+'#'+hash,false);
				}
				else {
					// Normal hash apply
					document.location.hash = hash;
				}
			}

			// Chain
			return History;
		};

		/**
		 * History.escape()
		 * normalize and Escape a Hash
		 * @return {string}
		 */
		History.escapeHash = function(hash){
			// Prepare
			var result = History.normalizeHash(hash);

			// Escape hash
			result = window.encodeURIComponent(result);

			// IE6 Escape Bug
			if ( !History.bugs.hashEscape ) {
				// Restore common parts
				result = result
					.replace(/\%21/g,'!')
					.replace(/\%26/g,'&')
					.replace(/\%3D/g,'=')
					.replace(/\%3F/g,'?');
			}

			// Return result
			return result;
		};

		/**
		 * History.getHashByUrl(url)
		 * Extracts the Hash from a URL
		 * @param {string} url
		 * @return {string} url
		 */
		History.getHashByUrl = function(url){
			// Extract the hash
			var hash = String(url)
				.replace(/([^#]*)#?([^#]*)#?(.*)/, '$2')
				;

			// Unescape hash
			hash = History.unescapeHash(hash);

			// Return hash
			return hash;
		};

		/**
		 * History.setTitle(title)
		 * Applies the title to the document
		 * @param {State} newState
		 * @return {Boolean}
		 */
		History.setTitle = function(newState){
			// Prepare
			var title = newState.title,
				firstState;

			// Initial
			if ( !title ) {
				firstState = History.getStateByIndex(0);
				if ( firstState && firstState.url === newState.url ) {
					title = firstState.title||History.options.initialTitle;
				}
			}

			// Apply
			try {
				document.getElementsByTagName('title')[0].innerHTML = title.replace('<','&lt;').replace('>','&gt;').replace(' & ',' &amp; ');
			}
			catch ( Exception ) { }
			document.title = title;

			// Chain
			return History;
		};


		// ====================================================================
		// Queueing

		/**
		 * History.queues
		 * The list of queues to use
		 * First In, First Out
		 */
		History.queues = [];

		/**
		 * History.busy(value)
		 * @param {boolean} value [optional]
		 * @return {boolean} busy
		 */
		History.busy = function(value){
			// Apply
			if ( typeof value !== 'undefined' ) {
				//History.debug('History.busy: changing ['+(History.busy.flag||false)+'] to ['+(value||false)+']', History.queues.length);
				History.busy.flag = value;
			}
			// Default
			else if ( typeof History.busy.flag === 'undefined' ) {
				History.busy.flag = false;
			}

			// Queue
			if ( !History.busy.flag ) {
				// Execute the next item in the queue
				clearTimeout(History.busy.timeout);
				var fireNext = function(){
					var i, queue, item;
					if ( History.busy.flag ) return;
					for ( i=History.queues.length-1; i >= 0; --i ) {
						queue = History.queues[i];
						if ( queue.length === 0 ) continue;
						item = queue.shift();
						History.fireQueueItem(item);
						History.busy.timeout = setTimeout(fireNext,History.options.busyDelay);
					}
				};
				History.busy.timeout = setTimeout(fireNext,History.options.busyDelay);
			}

			// Return
			return History.busy.flag;
		};

		/**
		 * History.busy.flag
		 */
		History.busy.flag = false;

		/**
		 * History.fireQueueItem(item)
		 * Fire a Queue Item
		 * @param {Object} item
		 * @return {Mixed} result
		 */
		History.fireQueueItem = function(item){
			return item.callback.apply(item.scope||History,item.args||[]);
		};

		/**
		 * History.pushQueue(callback,args)
		 * Add an item to the queue
		 * @param {Object} item [scope,callback,args,queue]
		 */
		History.pushQueue = function(item){
			// Prepare the queue
			History.queues[item.queue||0] = History.queues[item.queue||0]||[];

			// Add to the queue
			History.queues[item.queue||0].push(item);

			// Chain
			return History;
		};

		/**
		 * History.queue (item,queue), (func,queue), (func), (item)
		 * Either firs the item now if not busy, or adds it to the queue
		 */
		History.queue = function(item,queue){
			// Prepare
			if ( typeof item === 'function' ) {
				item = {
					callback: item
				};
			}
			if ( typeof queue !== 'undefined' ) {
				item.queue = queue;
			}

			// Handle
			if ( History.busy() ) {
				History.pushQueue(item);
			} else {
				History.fireQueueItem(item);
			}

			// Chain
			return History;
		};

		/**
		 * History.clearQueue()
		 * Clears the Queue
		 */
		History.clearQueue = function(){
			History.busy.flag = false;
			History.queues = [];
			return History;
		};


		// ====================================================================
		// IE Bug Fix

		/**
		 * History.stateChanged
		 * States whether or not the state has changed since the last double check was initialised
		 */
		History.stateChanged = false;

		/**
		 * History.doubleChecker
		 * Contains the timeout used for the double checks
		 */
		History.doubleChecker = false;

		/**
		 * History.doubleCheckComplete()
		 * Complete a double check
		 * @return {History}
		 */
		History.doubleCheckComplete = function(){
			// Update
			History.stateChanged = true;

			// Clear
			History.doubleCheckClear();

			// Chain
			return History;
		};

		/**
		 * History.doubleCheckClear()
		 * Clear a double check
		 * @return {History}
		 */
		History.doubleCheckClear = function(){
			// Clear
			if ( History.doubleChecker ) {
				clearTimeout(History.doubleChecker);
				History.doubleChecker = false;
			}

			// Chain
			return History;
		};

		/**
		 * History.doubleCheck()
		 * Create a double check
		 * @return {History}
		 */
		History.doubleCheck = function(tryAgain){
			// Reset
			History.stateChanged = false;
			History.doubleCheckClear();

			// Fix IE6,IE7 bug where calling history.back or history.forward does not actually change the hash (whereas doing it manually does)
			// Fix Safari 5 bug where sometimes the state does not change: https://bugs.webkit.org/show_bug.cgi?id=42940
			if ( History.bugs.ieDoubleCheck ) {
				// Apply Check
				History.doubleChecker = setTimeout(
					function(){
						History.doubleCheckClear();
						if ( !History.stateChanged ) {
							//History.debug('History.doubleCheck: State has not yet changed, trying again', arguments);
							// Re-Attempt
							tryAgain();
						}
						return true;
					},
					History.options.doubleCheckInterval
				);
			}

			// Chain
			return History;
		};


		// ====================================================================
		// Safari Bug Fix

		/**
		 * History.safariStatePoll()
		 * Poll the current state
		 * @return {History}
		 */
		History.safariStatePoll = function(){
			// Poll the URL

			// Get the Last State which has the new URL
			var
				urlState = History.extractState(History.getLocationHref()),
				newState;

			// Check for a difference
			if ( !History.isLastSavedState(urlState) ) {
				newState = urlState;
			}
			else {
				return;
			}

			// Check if we have a state with that url
			// If not create it
			if ( !newState ) {
				//History.debug('History.safariStatePoll: new');
				newState = History.createStateObject();
			}

			// Apply the New State
			//History.debug('History.safariStatePoll: trigger');
			History.Adapter.trigger(window,'popstate');

			// Chain
			return History;
		};


		// ====================================================================
		// State Aliases

		/**
		 * History.back(queue)
		 * Send the browser history back one item
		 * @param {Integer} queue [optional]
		 */
		History.back = function(queue){
			//History.debug('History.back: called', arguments);

			// Handle Queueing
			if ( queue !== false && History.busy() ) {
				// Wait + Push to Queue
				//History.debug('History.back: we must wait', arguments);
				History.pushQueue({
					scope: History,
					callback: History.back,
					args: arguments,
					queue: queue
				});
				return false;
			}

			// Make Busy + Continue
			History.busy(true);

			// Fix certain browser bugs that prevent the state from changing
			History.doubleCheck(function(){
				History.back(false);
			});

			// Go back
			history.go(-1);

			// End back closure
			return true;
		};

		/**
		 * History.forward(queue)
		 * Send the browser history forward one item
		 * @param {Integer} queue [optional]
		 */
		History.forward = function(queue){
			//History.debug('History.forward: called', arguments);

			// Handle Queueing
			if ( queue !== false && History.busy() ) {
				// Wait + Push to Queue
				//History.debug('History.forward: we must wait', arguments);
				History.pushQueue({
					scope: History,
					callback: History.forward,
					args: arguments,
					queue: queue
				});
				return false;
			}

			// Make Busy + Continue
			History.busy(true);

			// Fix certain browser bugs that prevent the state from changing
			History.doubleCheck(function(){
				History.forward(false);
			});

			// Go forward
			history.go(1);

			// End forward closure
			return true;
		};

		/**
		 * History.go(index,queue)
		 * Send the browser history back or forward index times
		 * @param {Integer} queue [optional]
		 */
		History.go = function(index,queue){
			//History.debug('History.go: called', arguments);

			// Prepare
			var i;

			// Handle
			if ( index > 0 ) {
				// Forward
				for ( i=1; i<=index; ++i ) {
					History.forward(queue);
				}
			}
			else if ( index < 0 ) {
				// Backward
				for ( i=-1; i>=index; --i ) {
					History.back(queue);
				}
			}
			else {
				throw new Error('History.go: History.go requires a positive or negative integer passed.');
			}

			// Chain
			return History;
		};


		// ====================================================================
		// HTML5 State Support

		// Non-Native pushState Implementation
		if ( History.emulated.pushState ) {
			/*
			 * Provide Skeleton for HTML4 Browsers
			 */

			// Prepare
			var emptyFunction = function(){};
			History.pushState = History.pushState||emptyFunction;
			History.replaceState = History.replaceState||emptyFunction;
		} // History.emulated.pushState

		// Native pushState Implementation
		else {
			/*
			 * Use native HTML5 History API Implementation
			 */

			/**
			 * History.onPopState(event,extra)
			 * Refresh the Current State
			 */
			History.onPopState = function(event,extra){
				// Prepare
				var stateId = false, newState = false, currentHash, currentState;

				// Reset the double check
				History.doubleCheckComplete();

				// Check for a Hash, and handle apporiatly
				currentHash = History.getHash();
				if ( currentHash ) {
					// Expand Hash
					currentState = History.extractState(currentHash||History.getLocationHref(),true);
					if ( currentState ) {
						// We were able to parse it, it must be a State!
						// Let's forward to replaceState
						//History.debug('History.onPopState: state anchor', currentHash, currentState);
						History.replaceState(currentState.data, currentState.title, currentState.url, false);
					}
					else {
						// Traditional Anchor
						//History.debug('History.onPopState: traditional anchor', currentHash);
						History.Adapter.trigger(window,'anchorchange');
						History.busy(false);
					}

					// We don't care for hashes
					History.expectedStateId = false;
					return false;
				}

				// Ensure
				stateId = History.Adapter.extractEventData('state',event,extra) || false;

				// Fetch State
				if ( stateId ) {
					// Vanilla: Back/forward button was used
					newState = History.getStateById(stateId);
				}
				else if ( History.expectedStateId ) {
					// Vanilla: A new state was pushed, and popstate was called manually
					newState = History.getStateById(History.expectedStateId);
				}
				else {
					// Initial State
					newState = History.extractState(History.getLocationHref());
				}

				// The State did not exist in our store
				if ( !newState ) {
					// Regenerate the State
					newState = History.createStateObject(null,null,History.getLocationHref());
				}

				// Clean
				History.expectedStateId = false;

				// Check if we are the same state
				if ( History.isLastSavedState(newState) ) {
					// There has been no change (just the page's hash has finally propagated)
					//History.debug('History.onPopState: no change', newState, History.savedStates);
					History.busy(false);
					return false;
				}

				// Store the State
				History.storeState(newState);
				History.saveState(newState);

				// Force update of the title
				History.setTitle(newState);

				// Fire Our Event
				History.Adapter.trigger(window,'statechange');
				History.busy(false);

				// Return true
				return true;
			};
			History.Adapter.bind(window,'popstate',History.onPopState);

			/**
			 * History.pushState(data,title,url)
			 * Add a new State to the history object, become it, and trigger onpopstate
			 * We have to trigger for HTML4 compatibility
			 * @param {object} data
			 * @param {string} title
			 * @param {string} url
			 * @return {true}
			 */
			History.pushState = function(data,title,url,queue){
				//History.debug('History.pushState: called', arguments);

				// Check the State
				if ( History.getHashByUrl(url) && History.emulated.pushState ) {
					throw new Error('History.js does not support states with fragement-identifiers (hashes/anchors).');
				}

				// Handle Queueing
				if ( queue !== false && History.busy() ) {
					// Wait + Push to Queue
					//History.debug('History.pushState: we must wait', arguments);
					History.pushQueue({
						scope: History,
						callback: History.pushState,
						args: arguments,
						queue: queue
					});
					return false;
				}

				// Make Busy + Continue
				History.busy(true);

				// Create the newState
				var newState = History.createStateObject(data,title,url);

				// Check it
				if ( History.isLastSavedState(newState) ) {
					// Won't be a change
					History.busy(false);
				}
				else {
					// Store the newState
					History.storeState(newState);
					History.expectedStateId = newState.id;

					// Push the newState
					history.pushState(newState.id,newState.title,newState.url);

					// Fire HTML5 Event
					History.Adapter.trigger(window,'popstate');
				}

				// End pushState closure
				return true;
			};

			/**
			 * History.replaceState(data,title,url)
			 * Replace the State and trigger onpopstate
			 * We have to trigger for HTML4 compatibility
			 * @param {object} data
			 * @param {string} title
			 * @param {string} url
			 * @return {true}
			 */
			History.replaceState = function(data,title,url,queue){
				//History.debug('History.replaceState: called', arguments);

				// Check the State
				if ( History.getHashByUrl(url) && History.emulated.pushState ) {
					throw new Error('History.js does not support states with fragement-identifiers (hashes/anchors).');
				}

				// Handle Queueing
				if ( queue !== false && History.busy() ) {
					// Wait + Push to Queue
					//History.debug('History.replaceState: we must wait', arguments);
					History.pushQueue({
						scope: History,
						callback: History.replaceState,
						args: arguments,
						queue: queue
					});
					return false;
				}

				// Make Busy + Continue
				History.busy(true);

				// Create the newState
				var newState = History.createStateObject(data,title,url);

				// Check it
				if ( History.isLastSavedState(newState) ) {
					// Won't be a change
					History.busy(false);
				}
				else {
					// Store the newState
					History.storeState(newState);
					History.expectedStateId = newState.id;

					// Push the newState
					history.replaceState(newState.id,newState.title,newState.url);

					// Fire HTML5 Event
					History.Adapter.trigger(window,'popstate');
				}

				// End replaceState closure
				return true;
			};

		} // !History.emulated.pushState


		// ====================================================================
		// Initialise

		/**
		 * Load the Store
		 */
		if ( sessionStorage ) {
			// Fetch
			try {
				History.store = JSON.parse(sessionStorage.getItem('History.store'))||{};
			}
			catch ( err ) {
				History.store = {};
			}

			// Normalize
			History.normalizeStore();
		}
		else {
			// Default Load
			History.store = {};
			History.normalizeStore();
		}

		/**
		 * Clear Intervals on exit to prevent memory leaks
		 */
		History.Adapter.bind(window,"unload",History.clearAllIntervals);

		/**
		 * Create the initial State
		 */
		History.saveState(History.storeState(History.extractState(History.getLocationHref(),true)));

		/**
		 * Bind for Saving Store
		 */
		if ( sessionStorage ) {
			// When the page is closed
			History.onUnload = function(){
				// Prepare
				var	currentStore, item, currentStoreString;

				// Fetch
				try {
					currentStore = JSON.parse(sessionStorage.getItem('History.store'))||{};
				}
				catch ( err ) {
					currentStore = {};
				}

				// Ensure
				currentStore.idToState = currentStore.idToState || {};
				currentStore.urlToId = currentStore.urlToId || {};
				currentStore.stateToId = currentStore.stateToId || {};

				// Sync
				for ( item in History.idToState ) {
					if ( !History.idToState.hasOwnProperty(item) ) {
						continue;
					}
					currentStore.idToState[item] = History.idToState[item];
				}
				for ( item in History.urlToId ) {
					if ( !History.urlToId.hasOwnProperty(item) ) {
						continue;
					}
					currentStore.urlToId[item] = History.urlToId[item];
				}
				for ( item in History.stateToId ) {
					if ( !History.stateToId.hasOwnProperty(item) ) {
						continue;
					}
					currentStore.stateToId[item] = History.stateToId[item];
				}

				// Update
				History.store = currentStore;
				History.normalizeStore();

				// In Safari, going into Private Browsing mode causes the
				// Session Storage object to still exist but if you try and use
				// or set any property/function of it it throws the exception
				// "QUOTA_EXCEEDED_ERR: DOM Exception 22: An attempt was made to
				// add something to storage that exceeded the quota." infinitely
				// every second.
				currentStoreString = JSON.stringify(currentStore);
				try {
					// Store
					sessionStorage.setItem('History.store', currentStoreString);
				}
				catch (e) {
					if (e.code === DOMException.QUOTA_EXCEEDED_ERR) {
						if (sessionStorage.length) {
							// Workaround for a bug seen on iPads. Sometimes the quota exceeded error comes up and simply
							// removing/resetting the storage can work.
							sessionStorage.removeItem('History.store');
							sessionStorage.setItem('History.store', currentStoreString);
						} else {
							// Otherwise, we're probably private browsing in Safari, so we'll ignore the exception.
						}
					} else {
						throw e;
					}
				}
			};

			// For Internet Explorer
			History.intervalList.push(setInterval(History.onUnload,History.options.storeInterval));

			// For Other Browsers
			History.Adapter.bind(window,'beforeunload',History.onUnload);
			History.Adapter.bind(window,'unload',History.onUnload);

			// Both are enabled for consistency
		}

		// Non-Native pushState Implementation
		if ( !History.emulated.pushState ) {
			// Be aware, the following is only for native pushState implementations
			// If you are wanting to include something for all browsers
			// Then include it above this if block

			/**
			 * Setup Safari Fix
			 */
			if ( History.bugs.safariPoll ) {
				History.intervalList.push(setInterval(History.safariStatePoll, History.options.safariPollInterval));
			}

			/**
			 * Ensure Cross Browser Compatibility
			 */
			if ( navigator.vendor === 'Apple Computer, Inc.' || (navigator.appCodeName||'') === 'Mozilla' ) {
				/**
				 * Fix Safari HashChange Issue
				 */

				// Setup Alias
				History.Adapter.bind(window,'hashchange',function(){
					History.Adapter.trigger(window,'popstate');
				});

				// Initialise Alias
				if ( History.getHash() ) {
					History.Adapter.onDomLoad(function(){
						History.Adapter.trigger(window,'hashchange');
					});
				}
			}

		} // !History.emulated.pushState


	}; // History.initCore

	// Try to Initialise History
	if (!History.options || !History.options.delayInit) {
		History.init();
	}

})(window);

// return History;
});
define( 'src/js/j',['require','exports','module'],function(ddd,core) {
	// j.js

	var baseUrl = 'http://tj.elongstatic.com/t.gif?';
	var commonObj = {
		g:Math.floor(Math.random()*99999),
		cid:'',
		sid:'',
		rf:'',
		bs:screen?screen.width+'*'+screen.height:''
	};
	if (document.cookie.match(/SessionGuid=([\w-]*)/)){
		commonObj.sid = document.cookie.match(/SessionGuid=([\w-]*)/)[1];
	}
	if (document.cookie.match(/CookieGuid=([\w-]*)/)){
		commonObj.cid = document.cookie.match(/CookieGuid=([\w-]*)/)[1];
	}

	(function(){
		var t = [];
		for (var i in commonObj) {
			 t.push(i+'='+commonObj[i]);
		}
		baseUrl += t.join("&")
	})();
	

	var tj_jsStartTime = Date.now();
	var parmsTJ = {
        channel: "ch",
        pagetype: "pt",
        //orderfrom: "p1",
        //cdnIp: "p85",
        //Html5 Performance.timing属性
        fetchStart: "p88",
        domainLookupStart: "p89",
        domainLookupEnd: "p90",
        connectStart: "p91",
        connectEnd: "p92",
        requestStart: "p93",
        responseStart: "p94",
        responseEnd: "p95",
        domLoading: "p96",
        domContentLoadedEventEnd: "p97",
        tj_jsStartTime: "p98",
        loadEventStart: "p99",
        //browserInfoStr: "p100"
    };
	var tjObj= {},a={};
	tjObj.channel = 'tourpal';
	tjObj.pagetype = 'FEframework';
	// tjObj.ch;
    if ((window.performance) && (window.performance.timing)) {
        tjObj.fetchStart = window.performance.timing.fetchStart;
        tjObj.domainLookupStart = window.performance.timing.domainLookupStart;
        tjObj.domainLookupEnd = window.performance.timing.domainLookupEnd;
        tjObj.connectStart = window.performance.timing.connectStart;
        tjObj.connectEnd = window.performance.timing.connectEnd;
        tjObj.requestStart = window.performance.timing.requestStart;
        tjObj.responseStart = window.performance.timing.responseStart;
        tjObj.responseEnd = window.performance.timing.responseEnd;
        tjObj.domLoading = window.performance.timing.domLoading;
        tjObj.domContentLoadedEventEnd = window.performance.timing.domContentLoadedEventEnd;
        tjObj.tj_jsStartTime = tj_jsStartTime;
        tjObj.loadEventStart = window.performance.timing.loadEventStart;
        //tjObj.browserInfoStr = es();
        for (var c in tjObj) {
	        var d = parmsTJ[c];
	        if (d) {
	            a[d] = tjObj[c];
	        } else {
	            if (c.toString().substr(0, 1) == "m") {
	                a[c] = tjObj[c];
	            } else {
	                // if ($.browser.mozilla) {
	                    // window.console.warn("Elong行为统计警告：页面统计参数"+c+"未注册！");
	                // }
	            }
	        }
	    }
    }

    var __sendObj = function(obj){
    	var params = '';
    	for (var i in obj) {
    		params =params + '&' + i+'='+obj[i];
    	}
    	new Image().src = baseUrl + params;
    };

    

	//g=58472&cid=0d0b2b13-5ece-463a-a7c1-046258363674&sid=145deca2-9a70-4ca5-ad54-2d9cce6f0ba1&rf=&bs=1440*900
	//common
    window.onerror = function(msg,url,line){
    	__sendObj({
    		ev:'webjserror',//jianmei, qiuliang
    		ch:tjObj.channel,
    		pagetype:tjObj.pagetype,
    		e1:location.host,
    		e2:line,
    		e3:url,
    		e4:msg,
    		e5:navigator.userAgent
    	});
    };

    if (document.readyState === 'complete') {
    	__sendObj(a);
    }else{
    	window.onload = function(){
    		__sendObj(a);
    	};
    }

//http://tj.elongstatic.com/t.gif?g=81946&cid=0d0b2b13-5ece-463a-a7c1-046258363674&sid=145deca2-9a70-4ca5-ad54-2d9cce6f0ba1&rf=&bs=1440*900&ch=home&pt=ElongIndexPage&p1=50&p88=1420619358227&p89=1420619358231&p90=1420619358238&p91=1420619358238&p92=1420619358240&p93=1420619358241&p94=1420619358279&p95=1420619358306&p96=1420619358299&p97=1420619359088&p98=1420619358387&p99=1420619359461&p100=0001f147c4568f00b204ffffffffe81b52df23a4a9bfb8c1af6dffffffff496561b18f00b204dcbc1aaa193594686f436287
//http://tj.elongstatic.com/t.gif?g=58472&cid=0d0b2b13-5ece-463a-a7c1-046258363674&sid=145deca2-9a70-4ca5-ad54-2d9cce6f0ba1&rf=&bs=1440*900&ev=webjserror&e1=www.elong.com&e2=1&e3=2&e4=3&e5=Mozilla/5.0%20(Macintosh;%20Intel%20Mac%20OS%20X%2010_10_1)%20AppleWebKit/537.36%20(KHTML,%20like%20Gecko)%20Chrome/39.0.2171.95%20Safari/537.36
// console.log(tjObj.join("&"));

});
define('src/js/pageStorage',[],function(){

	var pageStorage = {};
	var storage = {};

	pageStorage.setItem = function(key, value){
		storage[key] = value;
	};

	pageStorage.getItem = function(key){
		return storage[key];
	};

    pageStorage.removeItem = function(key){
    	delete storage[key];
    };
      
    pageStorage.clear = function(){
    	storage = {};
    };

    try {
    	localStorage.setItem("613421_localStorage_124316", "localStorage_value");
    } catch(e) {
    	localStorage.__proto__ = pageStorage;
    }

    if(localStorage.getItem("613421_localStorage_124316") === "localStorage_value") {
    	localStorage.removeItem("613421_localStorage_124316");
    }
});
define('src/js/core',['lib/zepto','src/web/main','lib/zepto.history','src/js/j','src/js/pageStorage'],function(zepto,blend,his){
    
    // 设计思路
    // 1. 使用
    // 2. 使用history.js 兼容h5和低端浏览器 // 低端浏览器不执行history.js 还是直接跳转，这是一个问题。

    // requirejs 单例
    if (typeof slark !== 'undefined') return slark;
    

    var core = {};
    core.isLowDevice = (function(){
        var ua = navigator.userAgent.toLowerCase();
        //(screen.width < 720) || (screen.height < 720) ||
        //android低端机
        if( ua.indexOf('iemobile') !== -1  || ((ua.indexOf('android') !== -1) && 
                    ((/ucbrowser\/[2-9]\./.test(ua)) ||  (/android [1-2]\./.test(ua))))){
            return true;
        }

        return false;
    })();
    
    var router = function(){
        this.routers = {};
    };
   
    router.prototype.add = function(config){
        for(var i in config){
            this.routers[i] = config[i];
        }
    };

    router.prototype.getInfoFromUrl = function(url) {
        // ifgetIdFromUrl
        var matches;
        for(var i in this.routers) {
            if (url.match(this.routers[i].url)) {
                if (matches) {
                    if (matches.url.length < this.routers[i].url.length ){
                        matches = this.routers[i];
                    }
                }else{
                    matches = this.routers[i];
                }
            }
        }
        return matches;
    };
    router.prototype.getidFromUrl = function(url) {
        // ifgetIdFromUrl
        var info = this.getInfoFromUrl(url);
        return info && info.tpl;
    };
    router.prototype.getUrlFromTpl = function(tpl) {
        return this.routers[tpl] && this.routers[tpl].url ||"";
     
    };

    router.prototype.cleanUrl = function(url,tpl) {
        if (typeof tpl !== 'string') {
            tpl = this.getidFromUrl(url);
        }

        var tplhtml = this.getUrlFromTpl(tpl);
        return url.substring(url.lastIndexOf(tplhtml));
    };

    core.onrender = function(id,callback) {
        if (typeof id === 'function') {
            $(document).on("onrender",function(){
                id();
            });
        }else{
            blend.layerInit(id,callback);
        }
        
    };

    core.onreload = function(){
        
    }
    

    core.router = new router();
   
    core.addPager = function(options) {
        var layerid;
        var shouldredirect = core.isLowDevice?true:false;

        if (options.id ){
            layerid = options.id;
        }else {
            var info = core.router.getInfoFromUrl(options.url);
            if (info ) {
                layerid = options.id = info.tpl; // tpl is id
                options.lindex = info.lindex;
            }else{
                console.log("no info... shouldredirect to true");
                shouldredirect = true;
                // return ;
                // location.href = options.url;
                // return false;
            }
        }

        if( shouldredirect ){
            if(!options.main){
                location.href = options.url;
                return false;
            }
        }

        //clean url 
        //options.url = core.router.cleanUrl(options.url);

        if (layerid && core.get(layerid) ){
            core.get(layerid)["in"](options);
        }else{
            return new blend.Layer(options);
        }
        
    };

    core.addGroup = function(options) {
        return new blend.LayerGroup(options);
    };
    core.get = function(id) {
        return blend.get(id);
    };

    core.canGoBack = function() {
        return blend.canGoBack();
    };

    core.getActiveId = function(){
        return blend.activeLayer.attr("data-blend-id");
    };

    core.getActiveLayer = function(){
        return blend.activeLayer;
    };

    core.moveWidget = function(widget, from, to){
        //animation don't support android 2.3, so use transition
        if (core.isLowDevice){
            widget.addClass("page-on-" + to);
            widget.removeClass("page-on-" + from);
        }else{
            widget.bind("webkitAnimationEnd OAnimationEnd MSAnimationEnd animationend", function(){
                widget.addClass("page-on-" + to);
                widget.removeClass("page-on-" + from);
                widget.removeClass("page-from-" + from + "-to-" + to);
                widget.unbind("webkitAnimationEnd OAnimationEnd MSAnimationEnd animationend");
            });

            widget.removeClass("page-on-"+from).addClass("page-from-" + from + "-to-" + to);
        }
        
    }

    core.transitionEnd = (function(){
        var t;
        var el = document.createElement('element');
        var transitions = {
            'WebkitTransition': 'webkitTransitionEnd',
            'OTransition': 'oTransitionEnd',
            'MozTransition': 'transitionend',
            'MsTransition': 'msTransitionEnd',
            'transition': 'transitionend'
        }
        for (t in transitions) {
            if (el.style[t] !== undefined) {
                return transitions[t];
            }
        }
    })();

    core.init = function(){
        //首先判断给本layer一个独立页面
        if ($(".pages>.page").length === 1) { //符合web blendui 规范
            var pager = $(".pages>.page");
            if ( !pager.attr("data-blend") ){
                var url = location.pathname;
                // url = url[url.length-1];
                // pager.attr("data-url",url);
                pager.addClass("page-on-center");

                // var layerid = core.router.getidFromUrl(url);

                var p = new core.addPager({
                    // id:layerid,
                    url:url,
                    main:pager[0],
                    active:true
                });
                
            }
        }
    };

    core.ui = blend;



    window.slark = core;
    return core;

});
/**
 *@overfileView 公共方法
 *author Yoocky <mengyanzhou@gmail.com>
 */

define('entry/tourpal/js/tourpal',['src/js/core'], function(core){
    
    var tourpal = {};
    
    //接口地址
    var path ={
        'getUserInfo' : '/index.php/Api/User/getUserInfoById',               //获取用户信息
        'getMessage' : '/index.php/Api/Liked/getNewsNum'                     //获取用户信息
    }

    //将简单查询串转换为对象
    tourpal.unparam =  function(query){
        var args = {};
        var pairs = query.split("&"); 
        for(var i = 0; i < pairs.length; i++) {
            var pos = pairs[i].indexOf('=');
            if (pos == -1) continue;
            var argname = pairs[i].substring(0,pos);
            var value = pairs[i].substring(pos+1);
            value = decodeURIComponent(value);
            args[argname] = value;
        }
        return args;
    }

    //cookie方法扩展
     tourpal.cookie = function (key, value, options) {
          var days, time, result, decode

          // A key and value were given. Set cookie.
          if (arguments.length > 1 && String(value) !== "[object Object]") {
              // Enforce object
              options = $.extend({}, options)

              if (value === null || value === undefined) options.expires = -1

              if (typeof options.expires === 'number') {
                  days = (options.expires * 24 * 60 * 60 * 1000)
                  time = options.expires = new Date()

                  time.setTime(time.getTime() + days)
              }

              value = String(value)

              return (document.cookie = [
                  encodeURIComponent(key), '=',
                  options.raw ? value : encodeURIComponent(value),
                  options.expires ? '; expires=' + options.expires.toUTCString() : '',
                  options.path ? '; path=' + options.path : '',
                  options.domain ? '; domain=' + options.domain : '',
                  options.secure ? '; secure' : ''
              ].join(''))
          }

          // Key and possibly options given, get cookie
          options = value || {}

          decode = options.raw ? function (s) { return s } : decodeURIComponent

          return (result = new RegExp('(?:^|; )' + encodeURIComponent(key) + '=([^;]*)').exec(document.cookie)) ? decode(result[1]) : null
      }

    //获取url参数
    tourpal.getArgs = function() { 
        var query = location.search.substring(1);
        var args = this.unparam(query);
        return args;
     }

     //通用弹窗
     tourpal.alert = {
        show : function(text, className, close, closeFn){
            var html =  text || '';
            if(close){
              html += '<span class="icon icon-close" style="float: right;"></span>';
            }  
            var $layer = $(core.getActiveLayer());
            var $header = $layer.find('header').eq(0);
            $layer.find('.alert-bar').remove();
            $header.after('<div class="alert-bar ' + (className || '') + '">' + html + '</div>');
            $layer.find(".alert-bar .icon-close").on('click', function(){
                if(closeFn){
                    tourpal.alert.hide();
                    closeFn();
                }
            });
        },
        hide : function(){
            var $layer = $(core.getActiveLayer());
            $layer.find('.alert-bar').remove();
        }
     }
     
     //获取用户信息
     tourpal.getUserInfo = function(callback, uid){
        var params = uid ? {'uid' : uid} : {};
        $.ajax({
          url : path.getUserInfo,
          data : params,
          dataType : 'json',
          type : 'GET',
          success: function(data){
             if(data.code == 0){
                callback(data.data);
             }
          }
       })
     }

     //获取用户信息
     tourpal.getMessage = function(){
        $.getJSON(path.getMessage, function(data){
            var $newMessage = $('.new-message');
            if(data.code == 0){
              if(data.data == 0){
                $newMessage.addClass('none');
              }else{
                $newMessage.text(data.data).removeClass('none');
              }
            }else{
               $newMessage.addClass('none');
            }
        });
     }
     /** 登录相关回调 **/

     //检测用户是否登录
     tourpal.isLogin = function(){
        return tourpal.cookie('TourpalCheck');
     }

     //跳转h5登录
     tourpal.login = function(dest){
        dest = dest || location.href;
        var params = $.param({RedirectUrl : dest});
        var ssoUrl =  'https://msecure.elong.com/login/';
        location.href = ssoUrl + '?' + params;
     }

     //退出登录
     tourpal.loginOut = function(dest){
        dest = dest || location.href + '/../hotcity';
        var params = $.param({RedirectUrl : dest});
        var ssoUrl =  'https://msecure.elong.com/login/Logout';
        location.href = ssoUrl + '?' + params;
     }

     //获取地理位置
     tourpal.getLocation = function(callback){
       var options = {
           enableHighAccuracy:true, 
           maximumAge:1000
       }
       var data = {
          error: 1,
          message : ''
       }
       if(navigator.geolocation){
           //浏览器支持geolocation
           navigator.geolocation.getCurrentPosition(onSuccess,onError,options);
           
       }else{
           data.message = "您的浏览器不支持获取地理位置";
           callback(data);
       }
       //成功时
       function onSuccess(position){
           data.error = 0;
           data.message = "已显示我的位置",
           data.coords = position.coords;
           callback(data);
       }
  
       //失败时
       function onError(error){
           switch(error.code){
               case 1:
               data.message = "位置服务被拒绝";
               break;
               case 2:
               data.message = "暂时获取不到位置信息";
               break;
               case 3:
               data.message = "获取信息超时";
               break;
               case 4:
               data.message = "获取位置失败";
               break;
           }
           callback(data);
       }
     }
     
    //测试用户资料完成度并发帖发帖
    tourpal.post = function(){
        tourpal.getUserInfo(function(data){
            if(data.is_complete == 0){
                  dialog.confirm({
                    content : '发帖前请完善用户信息！',
                    success : function(){
                        var params = $.param({redirect : 'post'});
                        core.addPager({
                            id:'mycard',
                            url:'mycard?' + params,
                            active:true
                        });
                    }
                  })
            }else{
                core.addPager({
                    id:'post',
                    url:'post',
                    active:true
                });
            }
        })
    }
    return tourpal;
});

/**
 * @preserve FastClick: polyfill to remove click delays on browsers with touch UIs.
 *
 * @version 1.0.3
 * @codingstandard ftlabs-jsv2
 * @copyright The Financial Times Limited [All Rights Reserved]
 * @license MIT License (see LICENSE.txt)
 */

/*jslint browser:true, node:true*/
/*global define, Event, Node*/


/**
 * Instantiate fast-clicking listeners on the specified layer.
 *
 * @constructor
 * @param {Element} layer The layer to listen on
 * @param {Object} options The options to override the defaults
 */
(function(){
function FastClick(layer, options) {
	'use strict';
	var oldOnClick;

	options = options || {};

	/**
	 * Whether a click is currently being tracked.
	 *
	 * @type boolean
	 */
	this.trackingClick = false;


	/**
	 * Timestamp for when click tracking started.
	 *
	 * @type number
	 */
	this.trackingClickStart = 0;


	/**
	 * The element being tracked for a click.
	 *
	 * @type EventTarget
	 */
	this.targetElement = null;


	/**
	 * X-coordinate of touch start event.
	 *
	 * @type number
	 */
	this.touchStartX = 0;


	/**
	 * Y-coordinate of touch start event.
	 *
	 * @type number
	 */
	this.touchStartY = 0;


	/**
	 * ID of the last touch, retrieved from Touch.identifier.
	 *
	 * @type number
	 */
	this.lastTouchIdentifier = 0;


	/**
	 * Touchmove boundary, beyond which a click will be cancelled.
	 *
	 * @type number
	 */
	this.touchBoundary = options.touchBoundary || 10;


	/**
	 * The FastClick layer.
	 *
	 * @type Element
	 */
	this.layer = layer;

	/**
	 * The minimum time between tap(touchstart and touchend) events
	 *
	 * @type number
	 */
	this.tapDelay = options.tapDelay || 200;

	if (FastClick.notNeeded(layer)) {
		// alert("no need fastclick");
		return;
	}

	// Some old versions of Android don't have Function.prototype.bind
	function bind(method, context) {
		return function() { return method.apply(context, arguments); };
	}


	var methods = ['onMouse', 'onClick', 'onTouchStart', 'onTouchMove', 'onTouchEnd', 'onTouchCancel'];
	var context = this;
	for (var i = 0, l = methods.length; i < l; i++) {
		context[methods[i]] = bind(context[methods[i]], context);
	}

	// Set up event handlers as required
	if (deviceIsAndroid) {
		layer.addEventListener('mouseover', this.onMouse, true);
		layer.addEventListener('mousedown', this.onMouse, true);
		layer.addEventListener('mouseup', this.onMouse, true);
	}

	layer.addEventListener('click', this.onClick, true);
	layer.addEventListener('touchstart', this.onTouchStart, false);
	layer.addEventListener('touchmove', this.onTouchMove, false);
	layer.addEventListener('touchend', this.onTouchEnd, false);
	layer.addEventListener('touchcancel', this.onTouchCancel, false);

	// Hack is required for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
	// which is how FastClick normally stops click events bubbling to callbacks registered on the FastClick
	// layer when they are cancelled.
	if (!Event.prototype.stopImmediatePropagation) {
		layer.removeEventListener = function(type, callback, capture) {
			var rmv = Node.prototype.removeEventListener;
			if (type === 'click') {
				rmv.call(layer, type, callback.hijacked || callback, capture);
			} else {
				rmv.call(layer, type, callback, capture);
			}
		};

		layer.addEventListener = function(type, callback, capture) {
			var adv = Node.prototype.addEventListener;
			if (type === 'click') {
				adv.call(layer, type, callback.hijacked || (callback.hijacked = function(event) {
					if (!event.propagationStopped) {
						callback(event);
					}
				}), capture);
			} else {
				adv.call(layer, type, callback, capture);
			}
		};
	}

	// If a handler is already declared in the element's onclick attribute, it will be fired before
	// FastClick's onClick handler. Fix this by pulling out the user-defined handler function and
	// adding it as listener.
	if (typeof layer.onclick === 'function') {

		// Android browser on at least 3.2 requires a new reference to the function in layer.onclick
		// - the old one won't work if passed to addEventListener directly.
		oldOnClick = layer.onclick;
		layer.addEventListener('click', function(event) {
			oldOnClick(event);
		}, false);
		layer.onclick = null;
	}
}


/**
 * Android requires exceptions.
 *
 * @type boolean
 */
var deviceIsAndroid = navigator.userAgent.indexOf('Android') > 0;


/**
 * iOS requires exceptions.
 *
 * @type boolean
 */
var deviceIsIOS = /iP(ad|hone|od)/.test(navigator.userAgent);


/**
 * iOS 4 requires an exception for select elements.
 *
 * @type boolean
 */
var deviceIsIOS4 = deviceIsIOS && (/OS 4_\d(_\d)?/).test(navigator.userAgent);


/**
 * iOS 6.0(+?) requires the target element to be manually derived
 *
 * @type boolean
 */
var deviceIsIOSWithBadTarget = deviceIsIOS && (/OS ([6-9]|\d{2})_\d/).test(navigator.userAgent);

/**
 * BlackBerry requires exceptions.
 *
 * @type boolean
 */
var deviceIsBlackBerry10 = navigator.userAgent.indexOf('BB10') > 0;

/**
 * Determine whether a given element requires a native click.
 *
 * @param {EventTarget|Element} target Target DOM element
 * @returns {boolean} Returns true if the element needs a native click
 */
FastClick.prototype.needsClick = function(target) {
	'use strict';
	switch (target.nodeName.toLowerCase()) {

	// Don't send a synthetic click to disabled inputs (issue #62)
	case 'button':
	case 'select':
	case 'textarea':
		if (target.disabled) {
			return true;
		}

		break;
	case 'input':

		// File inputs need real clicks on iOS 6 due to a browser bug (issue #68)
		if ((deviceIsIOS && target.type === 'file') || target.disabled) {
			return true;
		}

		break;
	case 'label':
	case 'video':
		return true;
	}

	return (/\bneedsclick\b/).test(target.className);
};


/**
 * Determine whether a given element requires a call to focus to simulate click into element.
 *
 * @param {EventTarget|Element} target Target DOM element
 * @returns {boolean} Returns true if the element requires a call to focus to simulate native click.
 */
FastClick.prototype.needsFocus = function(target) {
	'use strict';
	switch (target.nodeName.toLowerCase()) {
	case 'textarea':
		return true;
	case 'select':
		return !deviceIsAndroid;
	case 'input':
		switch (target.type) {
		case 'button':
		case 'checkbox':
		case 'file':
		case 'image':
		case 'radio':
		case 'submit':
			return false;
		}

		// No point in attempting to focus disabled inputs
		return !target.disabled && !target.readOnly;
	default:
		return (/\bneedsfocus\b/).test(target.className);
	}
};


/**
 * Send a click event to the specified element.
 *
 * @param {EventTarget|Element} targetElement
 * @param {Event} event
 */
FastClick.prototype.sendClick = function(targetElement, event) {
	'use strict';
	var clickEvent, touch;

	// On some Android devices activeElement needs to be blurred otherwise the synthetic click will have no effect (#24)
	if (document.activeElement && document.activeElement !== targetElement) {
		document.activeElement.blur();
	}

	touch = event.changedTouches[0];

	// Synthesise a click event, with an extra attribute so it can be tracked
	clickEvent = document.createEvent('MouseEvents');
	clickEvent.initMouseEvent(this.determineEventType(targetElement), true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
	clickEvent.forwardedTouchEvent = true;
	targetElement.dispatchEvent(clickEvent);
};

FastClick.prototype.determineEventType = function(targetElement) {
	'use strict';

	//Issue #159: Android Chrome Select Box does not open with a synthetic click event
	if (deviceIsAndroid && targetElement.tagName.toLowerCase() === 'select') {
		return 'mousedown';
	}

	return 'click';
};


/**
 * @param {EventTarget|Element} targetElement
 */
FastClick.prototype.focus = function(targetElement) {
	'use strict';
	var length;

	// Issue #160: on iOS 7, some input elements (e.g. date datetime) throw a vague TypeError on setSelectionRange. These elements don't have an integer value for the selectionStart and selectionEnd properties, but unfortunately that can't be used for detection because accessing the properties also throws a TypeError. Just check the type instead. Filed as Apple bug #15122724.
	if (deviceIsIOS && targetElement.setSelectionRange && targetElement.type.indexOf('date') !== 0 && targetElement.type !== 'time') {
		length = targetElement.value.length;
		targetElement.setSelectionRange(length, length);
	} else {
		targetElement.focus();
	}
};


/**
 * Check whether the given target element is a child of a scrollable layer and if so, set a flag on it.
 *
 * @param {EventTarget|Element} targetElement
 */
FastClick.prototype.updateScrollParent = function(targetElement) {
	'use strict';
	var scrollParent, parentElement;

	scrollParent = targetElement.fastClickScrollParent;

	// Attempt to discover whether the target element is contained within a scrollable layer. Re-check if the
	// target element was moved to another parent.
	if (!scrollParent || !scrollParent.contains(targetElement)) {
		parentElement = targetElement;
		do {
			if (parentElement.scrollHeight > parentElement.offsetHeight) {
				scrollParent = parentElement;
				targetElement.fastClickScrollParent = parentElement;
				break;
			}

			parentElement = parentElement.parentElement;
		} while (parentElement);
	}

	// Always update the scroll top tracker if possible.
	if (scrollParent) {
		scrollParent.fastClickLastScrollTop = scrollParent.scrollTop;
	}
};


/**
 * @param {EventTarget} targetElement
 * @returns {Element|EventTarget}
 */
FastClick.prototype.getTargetElementFromEventTarget = function(eventTarget) {
	'use strict';

	// On some older browsers (notably Safari on iOS 4.1 - see issue #56) the event target may be a text node.
	if (eventTarget.nodeType === Node.TEXT_NODE) {
		return eventTarget.parentNode;
	}

	return eventTarget;
};


/**
 * On touch start, record the position and scroll offset.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.onTouchStart = function(event) {
	'use strict';
	var targetElement, touch, selection;

	// Ignore multiple touches, otherwise pinch-to-zoom is prevented if both fingers are on the FastClick element (issue #111).
	if (event.targetTouches.length > 1) {
		return true;
	}

	targetElement = this.getTargetElementFromEventTarget(event.target);
	touch = event.targetTouches[0];

	if (deviceIsIOS) {

		// Only trusted events will deselect text on iOS (issue #49)
		selection = window.getSelection();
		if (selection.rangeCount && !selection.isCollapsed) {
			return true;
		}

		if (!deviceIsIOS4) {

			// Weird things happen on iOS when an alert or confirm dialog is opened from a click event callback (issue #23):
			// when the user next taps anywhere else on the page, new touchstart and touchend events are dispatched
			// with the same identifier as the touch event that previously triggered the click that triggered the alert.
			// Sadly, there is an issue on iOS 4 that causes some normal touch events to have the same identifier as an
			// immediately preceeding touch event (issue #52), so this fix is unavailable on that platform.
			// Issue 120: touch.identifier is 0 when Chrome dev tools 'Emulate touch events' is set with an iOS device UA string,
			// which causes all touch events to be ignored. As this block only applies to iOS, and iOS identifiers are always long,
			// random integers, it's safe to to continue if the identifier is 0 here.
			if (touch.identifier && touch.identifier === this.lastTouchIdentifier) {
				event.preventDefault();
				return false;
			}

			this.lastTouchIdentifier = touch.identifier;

			// If the target element is a child of a scrollable layer (using -webkit-overflow-scrolling: touch) and:
			// 1) the user does a fling scroll on the scrollable layer
			// 2) the user stops the fling scroll with another tap
			// then the event.target of the last 'touchend' event will be the element that was under the user's finger
			// when the fling scroll was started, causing FastClick to send a click event to that layer - unless a check
			// is made to ensure that a parent layer was not scrolled before sending a synthetic click (issue #42).
			this.updateScrollParent(targetElement);
		}
	}

	this.trackingClick = true;
	this.trackingClickStart = event.timeStamp;
	this.targetElement = targetElement;

	this.touchStartX = touch.pageX;
	this.touchStartY = touch.pageY;

	// Prevent phantom clicks on fast double-tap (issue #36)
	if ((event.timeStamp - this.lastClickTime) < this.tapDelay) {
		event.preventDefault();
	}

	return true;
};


/**
 * Based on a touchmove event object, check whether the touch has moved past a boundary since it started.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.touchHasMoved = function(event) {
	'use strict';
	var touch = event.changedTouches[0], boundary = this.touchBoundary;

	if (Math.abs(touch.pageX - this.touchStartX) > boundary || Math.abs(touch.pageY - this.touchStartY) > boundary) {
		return true;
	}

	return false;
};


/**
 * Update the last position.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.onTouchMove = function(event) {
	'use strict';
	if (!this.trackingClick) {
		return true;
	}

	// If the touch has moved, cancel the click tracking
	if (this.targetElement !== this.getTargetElementFromEventTarget(event.target) || this.touchHasMoved(event)) {
		this.trackingClick = false;
		this.targetElement = null;
	}

	return true;
};


/**
 * Attempt to find the labelled control for the given label element.
 *
 * @param {EventTarget|HTMLLabelElement} labelElement
 * @returns {Element|null}
 */
FastClick.prototype.findControl = function(labelElement) {
	'use strict';

	// Fast path for newer browsers supporting the HTML5 control attribute
	if (labelElement.control !== undefined) {
		return labelElement.control;
	}

	// All browsers under test that support touch events also support the HTML5 htmlFor attribute
	if (labelElement.htmlFor) {
		return document.getElementById(labelElement.htmlFor);
	}

	// If no for attribute exists, attempt to retrieve the first labellable descendant element
	// the list of which is defined here: http://www.w3.org/TR/html5/forms.html#category-label
	return labelElement.querySelector('button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea');
};


/**
 * On touch end, determine whether to send a click event at once.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.onTouchEnd = function(event) {
	'use strict';
	var forElement, trackingClickStart, targetTagName, scrollParent, touch, targetElement = this.targetElement;

	if (!this.trackingClick) {
		return true;
	}

	// Prevent phantom clicks on fast double-tap (issue #36)
	if ((event.timeStamp - this.lastClickTime) < this.tapDelay) {
		this.cancelNextClick = true;
		return true;
	}

	// Reset to prevent wrong click cancel on input (issue #156).
	this.cancelNextClick = false;

	this.lastClickTime = event.timeStamp;

	trackingClickStart = this.trackingClickStart;
	this.trackingClick = false;
	this.trackingClickStart = 0;

	// On some iOS devices, the targetElement supplied with the event is invalid if the layer
	// is performing a transition or scroll, and has to be re-detected manually. Note that
	// for this to function correctly, it must be called *after* the event target is checked!
	// See issue #57; also filed as rdar://13048589 .
	if (deviceIsIOSWithBadTarget) {
		touch = event.changedTouches[0];

		// In certain cases arguments of elementFromPoint can be negative, so prevent setting targetElement to null
		targetElement = document.elementFromPoint(touch.pageX - window.pageXOffset, touch.pageY - window.pageYOffset) || targetElement;
		targetElement.fastClickScrollParent = this.targetElement.fastClickScrollParent;
	}

	targetTagName = targetElement.tagName.toLowerCase();
	if (targetTagName === 'label') {
		forElement = this.findControl(targetElement);
		if (forElement) {
			this.focus(targetElement);
			if (deviceIsAndroid) {
				return false;
			}

			targetElement = forElement;
		}
	} else if (this.needsFocus(targetElement)) {

		// Case 1: If the touch started a while ago (best guess is 100ms based on tests for issue #36) then focus will be triggered anyway. Return early and unset the target element reference so that the subsequent click will be allowed through.
		// Case 2: Without this exception for input elements tapped when the document is contained in an iframe, then any inputted text won't be visible even though the value attribute is updated as the user types (issue #37).
		if ((event.timeStamp - trackingClickStart) > 100 || (deviceIsIOS && window.top !== window && targetTagName === 'input')) {
			this.targetElement = null;
			return false;
		}

		this.focus(targetElement);
		this.sendClick(targetElement, event);

		// Select elements need the event to go through on iOS 4, otherwise the selector menu won't open.
		// Also this breaks opening selects when VoiceOver is active on iOS6, iOS7 (and possibly others)
		if (!deviceIsIOS || targetTagName !== 'select') {
			this.targetElement = null;
			event.preventDefault();
		}

		return false;
	}

	if (deviceIsIOS && !deviceIsIOS4) {

		// Don't send a synthetic click event if the target element is contained within a parent layer that was scrolled
		// and this tap is being used to stop the scrolling (usually initiated by a fling - issue #42).
		scrollParent = targetElement.fastClickScrollParent;
		if (scrollParent && scrollParent.fastClickLastScrollTop !== scrollParent.scrollTop) {
			return true;
		}
	}

	// Prevent the actual click from going though - unless the target node is marked as requiring
	// real clicks or if it is in the whitelist in which case only non-programmatic clicks are permitted.
	if (!this.needsClick(targetElement)) {
		event.preventDefault();
		this.sendClick(targetElement, event);
	}

	return false;
};


/**
 * On touch cancel, stop tracking the click.
 *
 * @returns {void}
 */
FastClick.prototype.onTouchCancel = function() {
	'use strict';
	this.trackingClick = false;
	this.targetElement = null;
};


/**
 * Determine mouse events which should be permitted.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.onMouse = function(event) {
	'use strict';

	// If a target element was never set (because a touch event was never fired) allow the event
	if (!this.targetElement) {
		return true;
	}

	if (event.forwardedTouchEvent) {
		return true;
	}

	// Programmatically generated events targeting a specific element should be permitted
	if (!event.cancelable) {
		return true;
	}

	// Derive and check the target element to see whether the mouse event needs to be permitted;
	// unless explicitly enabled, prevent non-touch click events from triggering actions,
	// to prevent ghost/doubleclicks.
	if (!this.needsClick(this.targetElement) || this.cancelNextClick) {

		// Prevent any user-added listeners declared on FastClick element from being fired.
		if (event.stopImmediatePropagation) {
			event.stopImmediatePropagation();
		} else {

			// Part of the hack for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
			event.propagationStopped = true;
		}

		// Cancel the event
		event.stopPropagation();
		event.preventDefault();

		return false;
	}

	// If the mouse event is permitted, return true for the action to go through.
	return true;
};


/**
 * On actual clicks, determine whether this is a touch-generated click, a click action occurring
 * naturally after a delay after a touch (which needs to be cancelled to avoid duplication), or
 * an actual click which should be permitted.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.onClick = function(event) {
	'use strict';
	var permitted;

	// It's possible for another FastClick-like library delivered with third-party code to fire a click event before FastClick does (issue #44). In that case, set the click-tracking flag back to false and return early. This will cause onTouchEnd to return early.
	if (this.trackingClick) {
		this.targetElement = null;
		this.trackingClick = false;
		return true;
	}

	// Very odd behaviour on iOS (issue #18): if a submit element is present inside a form and the user hits enter in the iOS simulator or clicks the Go button on the pop-up OS keyboard the a kind of 'fake' click event will be triggered with the submit-type input element as the target.
	if (event.target.type === 'submit' && event.detail === 0) {
		return true;
	}

	permitted = this.onMouse(event);

	// Only unset targetElement if the click is not permitted. This will ensure that the check for !targetElement in onMouse fails and the browser's click doesn't go through.
	if (!permitted) {
		this.targetElement = null;
	}

	// If clicks are permitted, return true for the action to go through.
	return permitted;
};


/**
 * Remove all FastClick's event listeners.
 *
 * @returns {void}
 */
FastClick.prototype.destroy = function() {
	'use strict';
	var layer = this.layer;

	if (deviceIsAndroid) {
		layer.removeEventListener('mouseover', this.onMouse, true);
		layer.removeEventListener('mousedown', this.onMouse, true);
		layer.removeEventListener('mouseup', this.onMouse, true);
	}

	layer.removeEventListener('click', this.onClick, true);
	layer.removeEventListener('touchstart', this.onTouchStart, false);
	layer.removeEventListener('touchmove', this.onTouchMove, false);
	layer.removeEventListener('touchend', this.onTouchEnd, false);
	layer.removeEventListener('touchcancel', this.onTouchCancel, false);
};


/**
 * Check whether FastClick is needed.
 *
 * @param {Element} layer The layer to listen on
 */
FastClick.notNeeded = function(layer) {
	'use strict';
	var metaViewport;
	var chromeVersion;
	var blackberryVersion;

	// Devices that don't support touch don't need FastClick
	if (typeof window.ontouchstart === 'undefined') {
		return true;
	}

	// Chrome version - zero for other browsers
	chromeVersion = +(/Chrome\/([0-9]+)/.exec(navigator.userAgent) || [,0])[1];

	if (chromeVersion) {

		if (deviceIsAndroid) {
			metaViewport = document.querySelector('meta[name=viewport]');

			if (metaViewport) {
				// Chrome on Android with user-scalable="no" doesn't need FastClick (issue #89)
				if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
					return true;
				}
				// Chrome 32 and above with width=device-width or less don't need FastClick
				if (chromeVersion > 31 && document.documentElement.scrollWidth <= window.outerWidth) {
					return true;
				}
			}

		// Chrome desktop doesn't need FastClick (issue #15)
		} else {
			return true;
		}
	}

	if (deviceIsBlackBerry10) {
		blackberryVersion = navigator.userAgent.match(/Version\/([0-9]*)\.([0-9]*)/);

		// BlackBerry 10.3+ does not require Fastclick library.
		// https://github.com/ftlabs/fastclick/issues/251
		if (blackberryVersion[1] >= 10 && blackberryVersion[2] >= 3) {
			metaViewport = document.querySelector('meta[name=viewport]');

			if (metaViewport) {
				// user-scalable=no eliminates click delay.
				if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
					return true;
				}
				// width=device-width (or less than device-width) eliminates click delay.
				if (document.documentElement.scrollWidth <= window.outerWidth) {
					return true;
				}
			}
		}
	}

	// IE10 with -ms-touch-action: none, which disables double-tap-to-zoom (issue #97)
	if (layer.style.msTouchAction === 'none') {
		return true;
	}

	return false;
};


/**
 * Factory method for creating a FastClick object
 *
 * @param {Element} layer The layer to listen on
 * @param {Object} options The options to override the defaults
 */
FastClick.attach = function(layer, options) {
	'use strict';
	return new FastClick(layer, options);
};


if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {

	// AMD. Register as an anonymous module.
	define('lib/fastclick',[],function() {
		'use strict';
		return FastClick;
	});
} else if (typeof module !== 'undefined' && module.exports) {
	module.exports = FastClick.attach;
	module.exports.FastClick = FastClick;
} else {
	window.FastClick = FastClick;
}
})();
define('src/js/common',['src/js/core', 'lib/fastclick'],function(core,FastClick){

// (function(){
    // 'use strict';//最好放在外边

    FastClick.attach(document.body);//attach fastclick

    //android 卡顿解决
    if ($("html").hasClass("android")) {
        $(".pages").addClass("page-fade");
    }

    if( core.isLowDevice ){
        $('html').addClass('low-device');
    }

// switch
    $(document).on("click", ".label-switch", function(e){

        var ele = $(this).find(".checkbox");

        if (ele.hasClass("active")) {
            ele.removeClass("active").attr("data-checkbox", "false");
        } else{
            ele.addClass("active").attr("data-checkbox", "true");
        }
        return false;
    });

// checkbox
    $(document).on("click", ".label-checkbox", function(e){

        var ele = $(this).find(".checkbox");

        if (ele.hasClass("checked")) {
            ele.removeClass("checked");
        } else{
            ele.addClass("checked");
        }
        return false;
    });


    //通用的后退按钮

    $(document).on("click", "[data-rel=back]", function(e){

        if( core.isLowDevice ){
            History.back();
        }else if (core.canGoBack()){//有id，则是其他页面转过来的
            History.back();
        }else if ($(this).attr("href")){

            var page = $(this).parents(".page");
            var id = page.attr("data-blend-id");
            var layerid = core.router.getidFromUrl($(this).attr("href"));
            core.addPager({
                // id:layerid,
                url:$(this).attr("href"),
                active:true,
                reverse:true
            });
        }else{
            location.href= "http://ly.elong.com/Mobile/Index/hotcity";
        }
        return false;
    });
    
    $(document).on("click", "a[href='#']", function(e){
        return false;
    });

    //1. 页面加载后，url变化
    var historyState = {};//在url变化时，控制是否进行js layer的创建

    $(document).on("beforeshow",function(ev){
        var layer = $(ev.srcElement || ev.target);
        if (layer.attr("data-blend") === 'layer') {//这里有url链接
            
            if ( layer.parent().attr("data-blend") === 'layerGroup' ){//layergroup 也是完整的页面
                if ( layer.parent().attr("data-routing") === 'false' ) {

                }else{
                    //routing === true , the url should replaced
                    // core.getActiveLayer().url = layer.attr("data-url");
                    (core.get(core.getActiveId())).url = layer.attr("data-url");
                    core.getActiveLayer().attr("data-url",layer.attr("data-url"));
                    // layer.parent().parent().attr("data-url",layer.attr("data-url"));//update parent layer url
                    History.replaceState({blendid:layer.attr("data-blend-id")},document.title,layer.attr("data-url"));
                }
                
            }else{
                // console.log("111111111",historyState[ev.detail]);
                if (!historyState[ev.detail]){//如果存在，说明是从前进后退导航来的，所以不需要pushState
                    historyState[ev.detail] = true;
                    History.pushState({blendid:layer.attr("data-blend-id")},layer.attr("data-blend-id"),layer.attr("data-url"));
                }
            }
            
        }
    });
    var titleControl = {};
    $(document).on("beforeshow",function(ev){
        var layer = $(ev.srcElement);
        if (layer.attr("data-title")) {//hit cache
            document.title = layer.attr("data-title");
            // titleControl[layer.attr("data-blend-id")] = true;
        }else{
            titleControl[layer.attr("data-blend-id")] = false;
        }
    });
    $(document).on("onrender",function(ev){
        var layer = $(ev.srcElement);
        if ( titleControl[layer.attr("data-blend-id")] === false ) {
            document.title = layer.attr("data-title");
        }
        if (layer.attr("data-title")) {
            titleControl[layer.attr("data-blend-id")] = layer.attr("data-title");
        }
    });
    $(document).on("onshow",function(ev){
        var layer = $(ev.srcElement);
        if (layer.attr("data-blend") === 'layer') {//这里有url链接
            historyState[ev.detail] = false;
            
        }
        // if (layer.parent().attr("data-blend") === 'layerGroup'){
        //     historyState[layer.parent().attr("data-blend-id")] = false;
        // }

    });
    //2. url变化后
    History.Adapter.bind(window,'statechange',function(){

        var state =History.getState();
        
        // var currenturl = Blend.ui.activeLayer.attr("data-url");
        //目的： 发现是否确定是浏览器行为，还是history行为
        // 浏览器行为，则进行页面跳转，js行为，则不变
        var layerid = core.router.getidFromUrl(state.url);

        if (!core.getActiveId() || (core.getActiveId() && layerid === core.getActiveId())) {
            console.log("active id === state layerid, return;");
            return ;
        }
        
        var dataurl = core.router.cleanUrl(state.url,layerid);

        if (!!titleControl[layerid] && titleControl[layerid] != document.title) {
            document.title = titleControl[layerid];
        }
        
        if (layerid && historyState[layerid] !== true && core.getActiveId() !== layerid ) {
        // alert($(core.get(layerid).main).css("transform"))
        // if (core.get(layerid)){
        //     console.log("statechange layerid: "+layerid+core.get(layerid).main.className);
        
        //     console.log("statechange activeId: "+core.getActiveId()+core.get(core.getActiveId()).main.className);
        // }
        
        // console.log("history js calling.... create layer...",layerid);
            //判断是否存在
            if ( core.get(layerid) ){
                if (! core.get(layerid).myGroup) {
                    historyState[layerid] = true;
                }
                
                core.get(layerid)["in"]({url:dataurl});
            }else{
                core.addPager({
                    // id: layerid,
                    url:state.url,
                    active:true,
                });
            }
            
        }
        
    });

});
/**
 *@overfileView 路由配置
 *author Yoocky <mengyanzhou@gmail.com>
 */
define('entry/tourpal/js/route',['src/js/core'], function(core){
  //route
    core.router.add({
        "hotcity":{
            lindex:1,
            tpl:"hotcity",
            url:"hotcity"
        }, 
        "card":{
            lindex:2,
            tpl:"card",
            url:"card"
        }, 
        "mycard":{
            lindex:3,
            tpl:"mycard",
            url:"mycard"
        }, 
        "postlist":{
            lindex:4,
            tpl:"postlist",
            url:"postlist"
        },  
        "post":{
            lindex:5,
            tpl:"post",
            url:"post"
        },
        "message":{
            lindex:6,
            tpl:"message",
            url:"message"
        }, 
        "joylist":{
            lindex:7,
            tpl:"joylist",
            url:"joylist"
        }, 
         "mypost":{
            lindex:8,
            tpl:"mypost",
            url:"mypost"
        }, 
        "myjoy":{
            lindex:9,
            tpl:"myjoy",
            url:"myjoy"
        },
        "feedback": {
            lindex:10,
            tpl:"feedback",
            url:"feedback"
        },
        "postdetail": {
            lindex:11,
            tpl:"postdetail",
            url:"postdetail"
        },
        "setting": {
            lindex:12,
            tpl:"setting",
            url:"setting"
        }                         
    });
});
define('src/js/city',['src/js/core'],function(core) {
    
    var city = {
        TEMPLATE : {
            BODY : '<div class="city-sel page-on-right"><header class="bar bar-nav"><nav><span class="icon icon-left-nav pull-left" data-rel="back"></span><span class="title">城市选择</span></nav></header><div class="input-block"><div class="search-icon"></div><div class="search-box"><input placeholder=" 请输入目的地如 ：北京"></div><div class="input-base-line"></div><button>取消</button><ul class="match-list" class="table-view"></ul></div><div class="all-list page-content"><ul id="recent-list" class="table-view"><li class="table-view-divider">上次搜索</li></ul><ul id="hot-city-list" class="table-view"><li class="table-view-divider">热门</li></ul></div></div>',
            CITYGROUP : {
                HEAD : '<ul id="${id}" class="table-view">',
                FOOT : '</ul>'
            },
            LISTHEAD : '<li class="table-view-divider">${letter}</li>',
            LISTITEM : '<li class="table-view-cell${class}" place="${place}" dest="${dest}" pid="${id}">${text}</li>'
        },
        orderCityList : [],
        recentList : [],
        hotList : [["成都", 286],["拉萨", 332], ["北京", 50], ["杭州", 136], ["厦门", 165], ["南京", 123]],
        suggestApi :'/Api/Dest/suggest',
        handler : null,
        page : null,
        searchTimeout : 0,
        isWaitingToSearch : false,
        beforeShow : function(callback, value){
            var _this = this;

            if(this.page === null){
                this.init();
            }
            value = $.trim(value);
            this.handler = callback;

            if(value){
                var input = this.page.find(".search-box input");

                input.val(value);
                this._renderMatchList(value);
                this.page.find(".match-list").hide();
                $('.all-list').show();
            }
        },
        init : function(){
            if($(".city-sel").length === 0){
                this._render();
            }

            this._bindEvent();
        },
        _render : function(){
            var page = $(this.TEMPLATE.BODY);
            var hotContainer = page.find("#hot-city-list");
            var localRecentList = localStorage.getItem("recentCityListV1");
            var hotCityList = [];

            if(!!localRecentList){
                this.recentList = JSON.parse(localRecentList);
            }

            this._reRenderRecent(page);

            for(var i = 0; i < this.hotList.length; i ++){
                hotCityList.push(this.TEMPLATE.LISTITEM
                    .replace('${text}', this.hotList[i][0])
                    .replace('${id}', this.hotList[i][1])
                    .replace('${dest}', this.hotList[i][0])
                    .replace('${place}', this.hotList[i][0])
                    .replace('${class}', ''));
            }

            hotContainer.html(hotContainer.html() + hotCityList.join(''));

            if (core.getActiveLayer()){
                page.appendTo(core.getActiveLayer());
            }else{
                page.appendTo("body");
            }
            
            this.page = page;
        },
        _reRenderRecent : function(page){
            var recentContainer = page.find("#recent-list");
            var recentCityList = [];

            if(this.recentList.length === 0){
                recentContainer.hide();
                return;
            }

            recentContainer.show();
            recentContainer.find(".table-view-cell").remove();

            for(var i = 0; i < this.recentList.length; i ++){
                recentCityList.push(this.TEMPLATE.LISTITEM
                    .replace('${place}', this.recentList[i][0])
                    .replace('${dest}', this.recentList[i][1])
                    .replace('${text}', this.recentList[i][2])
                    .replace('${id}', this.recentList[i][3])
                    .replace('${class}', ''));
            }

            recentContainer.html(recentContainer.html() + recentCityList.join(''));
        },
        _doReturn : function(city){
            this._updateRecentList(city);
            this._reRenderRecent(this.page);
            this.page.find(".match-list").hide();
            this.page.find(".all-list").show();
            this.hide();
            if(!!this.handler){
                this.handler(city);
            }
        },
        _bindEvent : function(){
            var _this = this;

            this.page.find(".icon-left-nav").click(function(){
                _this.hide();
                return false;
            });
            this.page.on('click', "li.table-view-cell", function(){
                var city = [$(this).attr('place'), $(this).attr('dest'), $(this).html(), $(this).attr('pid')];
                _this.page.find(".search-box input").val('');
                _this._doReturn(city);
            });

            this.page.find(".input-block button").on("click", function(){
                _this.hide();
            });
            
            this.page.find(".search-box input").bind("input propertychange touchend", function(){
                var input = this;

                if(!_this.isWaitingToSearch){
                    _this.isWaitingToSearch = true;

                    setTimeout(function(){
                        _this.isWaitingToSearch = false;
                        _this._renderMatchList($(input).val());
                    }, 200);
                }
            });
        },
        _renderMatchList : function(keyword){
            var matchContainer = this.page.find(".match-list");
            if(keyword === ""){
                matchContainer.hide();
                matchContainer.find(".table-view-cell").remove();
                return;
            }

            $.getJSON(this.suggestApi, {dest: keyword}, function(data){
                var matchList = data.data.list;
                if(matchList.length > 0){
                    var  matchCityList = [];

                    for( i = 0; i < matchList.length; i ++){
                        var desc = matchList[i]['desc'].split(' ');
                        if(desc.length > 1){
                            desc = desc[0] + '<span class="gray"> ' + desc[1] + '</span>';
                        }else{
                            desc = desc[0];
                        }
                        matchCityList.push(this.TEMPLATE.LISTITEM
                            .replace('${text}', desc)
                            .replace('${id}', matchList[i]['id'])
                            .replace('${place}', matchList[i]['place'])
                            .replace('${dest}', matchList[i]['dest'])
                            .replace('${class}', matchList[i]['desc'] == keyword ? ' full-match' : ''));
                    }

                    matchContainer.html(matchCityList.join(''));

                    matchContainer.show();
                } else {
                    matchContainer.hide();
                    matchContainer.find(".table-view-cell").remove();
                }
            }.bind(this));
        },
        _updateRecentList : function(city){
            if(city[0] === "") return;

            var recentList = this.recentList;
            var orIndex = this._isCityInRecent(city);

            if(orIndex >= 0){
                recentList.splice(orIndex, 1);
            } else if(recentList.length == 3){
                recentList.splice(2, 1);
            }

            recentList.splice(0, 0, city);
            localStorage.setItem("recentCityListV1", JSON.stringify(recentList));
        },
        _isCityInRecent : function(city){
            for(var i = 0; i < this.recentList.length; i ++){
                if(city[0] == this.recentList[i][0]){
                    return i;
                }
            }

            return -1;
        },
        _matchKeyword : function(keyword, city){
            return city[0].indexOf(keyword) === 0 || city[1].indexOf(keyword) === 0 || city[2].indexOf(keyword) === 0;
        }
    };

    return city;
});
define('src/js/PluginManager',['src/js/core'], function(core){

	/*继承方法，同名属性若同为对象则递归继承该对象，否则重写*/
	function inheritObject(extend, base){
		for(var i in base){
			if(!extend[i]){
				extend[i] = base[i];
			} else {
				//同名属性同为对象，递归继承该对象
				if(typeof extend[i] == "object" && typeof base[i] == "object"){
					inheritObject(extend[i], base[i]);
				}
			}
		}
	}

	(function(){
		if(location.href.indexOf('&!_PLU_') > 0){
			var activeId = core.getActiveId();

			History.replaceState(activeId, document.title, location.href.split('&!_PLU_')[0]);
		}
	})();

	PluginManager = {
		plugins : {},
		isHashChangeByPlugin : false,
		lastUrl : location.href,
		/*-----------插件基础对象base start-----------*/
		base : {
			id : null,
			option : {
				showType : "animation", //类型：animation/transition, transition需搭配class选项
				transitionClass : "" //showType为transition时搭配使用的class
			},
			init : function(){

			},
			page : null,
			beforeShow : function(){
				return false;
			},
			//上一次执行show方法时传入的参数
			lastShowArguments : null,
			show : function(){
				//若beforeShow返回为true，则不执行后面的流程
				if(!!this.beforeShow.apply(this, arguments)) return; 

				if(this.option.showType == "animation"){
					core.moveWidget(this.page, "right", "center");
				} else {
					this.page.addClass(this.option.transitionClass);
				}

				this.afterShow.apply(this, arguments);
				this.lastShowArguments = arguments;
				//如果非hashchange触发，hash中增加当前插件的标识
				if(location.href.indexOf("&!_PLU_" + this.id) < 0){
					var activeId = core.getActiveId();
					var url = location.href + (location.search === "" ? "?_=1" : "") +　"&!_PLU_" + this.id;

					PluginManager.isHashChangeByPlugin = true;
					History.pushState(activeId, document.title, url);
				}
			},
			afterShow : function(){

			},
			beforeHide : function(){

			},
			hide : function(){
				if(this.beforeHide()) return;

				if(this.option.showType == "animation"){
					core.moveWidget(this.page, "center", "right");
				} else {
					this.page.removeClass(this.option.transitionClass);
				}

				//如果非hashchange触发，取消hash中该插件的标识
				if(location.href.indexOf("&!_PLU_" + this.id) > 0){
					PluginManager.isHashChangeByPlugin = true;
					History.back();
				}

				this.afterHide();
			},
			afterHide : function(){

			},
			//将插件节点从dom树上移除
			destroy : function(){
				this.page.remove();
			},
			//恢复之前被删除的插件节点
			restore : function(activeId){
				this.page.appendTo(core.get(activeId).main);
			}
		},
		/*-----------插件基础对象base end-----------*/

		//添加插件并继承base对象的方法
		add : function(id, plugin){
			var currentPagePlugins = this.getCurrentPagePlugins();

			if(!currentPagePlugins) {
				currentPagePlugins = {};
				this.setCurrentPagePlugins(currentPagePlugins);
			}

			var _this = this;

			inheritObject(plugin, this.base);
			plugin.id = id;
			plugin.init();
			plugin.destroy();
			plugin.restore(core.getActiveId());
			currentPagePlugins[id] = plugin;
		},
		//获得当前页面的插件
		getCurrentPagePlugins : function(){
			return this.plugins[core.getActiveId()];
		},
		//设置当前页面的插件
		setCurrentPagePlugins : function(currentPagePlugins){
			this.plugins[core.getActiveId()] = currentPagePlugins;
		},
		//获取当前页面对应id的插件
		getItem : function(id){
			var currentPagePlugins = this.getCurrentPagePlugins();

			return !!currentPagePlugins ? currentPagePlugins[id] : null;
		},
		//移除当前页面对应id的插件
		remove : function(id){
			var currentPagePlugins = this.getCurrentPagePlugins();

			currentPagePlugins[id].destroy();
			delete currentPagePlugins[id];
		},
		//页面隐藏后移除该页面所有的插件节点
		removePluginBeforePageHide : function(activeId){
			var currentPagePlugins = this.plugins[activeId];

			if(!currentPagePlugins) return;

			for(var i in currentPagePlugins){
				currentPagePlugins[i].destroy();
			}
		},
		//进入页面后恢复之前删除的插件节点
		restorePluginBeforePageShow : function(activeId){
			var currentPagePlugins = this.plugins[activeId];

			if(!currentPagePlugins) return;

			for(var i in currentPagePlugins){
				currentPagePlugins[i].restore(activeId);
			}
		}
	};

	//页面移出时移除所有dom节点，移入时再恢复
	var _beforeshow = function(e){
		PluginManager.restorePluginBeforePageShow(e.detail);
	};

	var _beforehide = function(e){
		PluginManager.removePluginBeforePageHide(e.detail);
	};

	$(document).on("beforehide", _beforehide);

	$(document).on("onshow", _beforeshow);

	//通过监听onhashchange事件控制前进后退时插件的隐藏显示
	History.Adapter.bind(window, 'statechange', function(e){
		var newURL = location.href;
		var oldURL = PluginManager.lastUrl;

		PluginManager.lastUrl = location.href;

		if(PluginManager.isHashChangeByPlugin){
			PluginManager.isHashChangeByPlugin = false;
			return;
		} else {
			var tmp = null;
			var plugin = null;

			if(newURL.length > oldURL.length){
				tmp = newURL.split("&!_PLU_");
				plugin = PluginManager.getItem(tmp[tmp.length - 1]);

				if(!plugin) return;

				if(!!plugin.lastShowArguments){
					plugin.show.apply(plugin, plugin.lastShowArguments);
				} else {
					plugin.show();
				}
			} else {
				tmp = oldURL.split("&!_PLU_");
				plugin = PluginManager.getItem(tmp[tmp.length - 1]);

				!!plugin? plugin.hide() : null;
			}
		}
	});

	return PluginManager;
});
/**
 *@overfileView 首页-热门城市
 *author Yoocky <mengyanzhou@gmail.com>
 */

define('entry/tourpal/js/hotcity',['src/js/core', 'lib/artTemplate', 'src/js/city', 'src/js/PluginManager', 'entry/tourpal/js/tourpal'], function(core, template, city, PluginManager, tourpal){
    //路径配置
    var path = {
        'hotCity' : '/index.php/Api/Dest/getHotCity'                                      //热门城市   
    }

    core.onrender('hotcity',function(dom){

        //载入热门城市
        $.getJSON(path.hotCity, function(data){
          if(data.code == 0){
            var html = template('hot_city_tpl', data);
            $('.hot-city-list').html(html);
          }
        })

        //城市选择
        $("#city_selector").on("click", function(){
              var ele = $(this);
              pluginCity.show(function(data) {
                  if(data[0].trim() == ''){
                    return false;
                  }
                  ele.val(data[0]);
                  setTimeout(function(){
                    openPostList();
                  }, 500)
              });
        });
        
        //打开目的地页
        var openPostList = function() {
            var params = $.param({'city': $("#city_selector").val(), 'random' : new Date().getTime()});
            tourpal.alert.hide();
            core.addPager({
                id:'postlist',
                url:'postlist?' + params,
                active:true
            });
        }

        //载入城市选择插件
        PluginManager.add("city", city);
        pluginCity = PluginManager.getItem('city');

        $('#btn_search').on('click', function(){
              if($("#city_selector").val().trim() == ''){
                 tourpal.alert.show('请输入城市名称');
                 return false;
              }
              openPostList();
        })

        //点击发帖
        $(dom).find('.post-btn').on('click', function(){
            if(!tourpal.isLogin()){
                tourpal.login(location.href+'#callback');
                return false;
            }  
            tourpal.post();
        })

        var init = function(){
           tourpal.getMessage();
        }
        
        $(dom).on("beforeshow", function(eve) {
            if (eve.detail === 'hotcity') {
                init();
            }
        });

        init();

        //页面跳转回调
        if(location.hash.indexOf('callback') > 0){
            $(dom).find('.post-btn').trigger('click');
        }
    });
});
define('src/js/dialog',['src/js/core'], function(core) {

	var _ui = $('<div>').addClass('dialog');
	var _mask = $('<div>').addClass('mask-layer');


	var emptyfunc = function() {};

	var dialog = {

		init: function(opt) {

			var options = $.extend({
				container: core.getActiveLayer(),
				content: "请选择相应的操作",
				btnArr: [{}],
				mask: true,
				clickMask: function() {}
			}, opt);

			if (_ui.parent().length === 0 || _ui.parent().attr("id") !== options.container.attr("id")) {
				_ui.appendTo(options.container);
				_mask.appendTo(options.container);
			}


			return options;

		},

		showmask: function() {
			this.init();
			_mask.show();
		},
		hidemask: function() {
			_mask.hide();
		},

		//  [{ text:"确定", color:"red", type:"button", click:function(){} },{},{}]
		show: function(opt) {

			var options = dialog.init(opt);

			var btnHtml = "";
			for (var i = 0; i < options.btnArr.length; i++) {

				btnHtml += '<div class="item-btn">' + options.btnArr[i].text + '</div>';
			};

			if (options.mask) {
				_mask.show().unbind("click").bind("click", function() {
					options.clickMask();
				});
			};
			_ui.html('<div class="content">' + options.content + '</div>' + btnHtml);

			_ui.find(".item-btn").each(function(index) {
				if (options.btnArr[index].color !== "") {
					$(this).css("background", options.btnArr[index].color);
				};
				if (options.btnArr[index].type == "button") {
					$(this).on("click", function() {
						options.btnArr[index].click();
						dialog.close();
					});
				};
			});



			_ui.addClass("dialog-active");

		},

		close: function() {

			_ui.removeClass("dialog-active");
			_mask.hide();

		},

		alert: function(msg, callback) {

			if (typeof msg === 'object') { //兼容下
				opt = msg;
				msg = opt.content;
				callback = opt.click;
			}

			var alertOpt = {
				//container: opt.container,
				content: msg,
				btnArr: [{
					text: "确 定",
					color: "#E65749",
					type: "button",
					click: (callback || emptyfunc)
				}]
			}

			dialog.show(alertOpt);

		},

		newAlert: function(opt) {

			var options = $.extend({
				container: null,
				msg: "请选择相应的操作",
				btnText: "确 定",
				callback: function() {}
			}, opt);



			var alertOpt = {
				container: options.cont,
				content: options.msg,
				btnArr: [{
					text: options.btnText,
					color: "#E65749",
					type: "button",
					click: options.callback
				}]
			}

			dialog.show(alertOpt);
		},

		confirm: function(opt) {
			if (!opt.success) {
				opt.success = function() {};
			};
			if (!opt.cancel) {
				opt.cancel = function() {};
			};
			var confirmOpt = {
				container: opt.container,
				content: opt.content,
				btnArr: [{
					text: "确 定",
					color: "#E65749",
					type: "button",
					click: opt.success
				}, {
					text: "取 消",
					color: "#757575",
					type: "button",
					click: opt.cancel
				}]
			}

			dialog.show(confirmOpt);

		},
		superconfirm: function(opt) {

			if (!opt.cancel) {
				opt.cancel = function() {};
			};

			var confirmOpt = {
				content: opt.content,
				btnArr: [{
					text: "取 消",
					color: "#757575",
					type: "button",
					click: opt.cancel
				}]
			}

			if (opt && opt.btnArr) {
				for (var i = opt.btnArr.length-1; i >=0; i--) {
					var _b = opt.btnArr[i];

					confirmOpt.btnArr.unshift({
						text: _b.name,
						color: "#E65749",
						type: "button",
						click: _b.event
					});
				};

			}

			dialog.show(confirmOpt);

		}

	}

	return dialog;

});
/**
 *@overfileView 滚动加载
 *author Yoocky <mengyanzhou@gmail.com>
 */

define('entry/tourpal/js/scrollLoad',['lib/artTemplate'], function(template) {

    //扩展template方法  输出性别
    template.helper('sex', 
    function(number) {
        number = number * 1 || 1;
        var sex = ['male', 'female']
        return sex[number - 1];

    });

    
    //扩展template方法  格式化输出日期
    template.helper('dateFormat', 
    function(number, format) {
        return new Date(number*1000).format(format);
    });

    function ScrollLoad(settings) {
        settings = settings || {};
        var defaults = {
            scrollWrapSel: '',                      //滚动容器
            listContentSel: '.list-content-wrap',   //内容区块
            templateId: '',                         //模板ID
            perNum: 10,                             //每页显示多少个
            url: '',                                //接口地址
            data: {},                               //附加参数
            noDataText: '暂无结果',                   //数据为空时的提示文案
            callback: function() {}                 //分页数据获取成功后回调
        };
        $.extend(this, defaults, settings);

        this._$scroll = $(this.scrollWrapSel);
        this._$list = this._$scroll.find(this.listContentSel);
        this._init();


    }

    ScrollLoad.prototype = {
        // 初始化
        _init: function() {
            var that = this;
            this._$scroll.append('<div class="spinner none"> <div class="rect1"></div> <div class="rect2"></div> <div class="rect3"></div> <div class="rect4"></div> <div class="rect5"></div> </div>');
            this.getContent();
            //事件监听
            this._$scroll.on('scroll', 
            function(e) {
                //可见高度
                var viewH = $(this).height();
                //内容高度
                var contentH = $(this).get(0).scrollHeight;
                //滚动高度
                var scrollTop = $(this).scrollTop();
                if (contentH - viewH == scrollTop && that._$list.attr('loading') != 'true' && that._$list.attr('hasRest') == 1) {
                    that.getContent();
                }

            })

        },

        //获取分页内容
        getContent: function() {
            var that = this;
            var offset = this._$list.attr('offset') || 0;
            var params = {
                perNum: this.perNum,
                offset: offset
            }
            params = $.extend(params, that.data);
            that._$list.attr('loading', 'true');
            $.ajax({
                url: this.url,
                data: params,
                dataType: 'json',
                type: 'GET',
                success: function(data) {
                    that.callback(data.data, offset);
                    if (data.code == 0) {
                        that._$list.attr('loading', 'false');
                        if (data.data.offset == 0) {
                            that._$list.html('<p class="error-tip">' + that.noDataText + '</p>');
                            return false;
                        }else{
                            that._$list.find('.error-tip').remove();
                            var html = template(that.templateId, data.data);
                            that._$list.append(html);
                            that._$list.attr('offset', data.data.offset);
                            that._$list.attr('hasRest', data.data.has_rest);
                        }
                        //是否显示加载更多
                        if (data.data.has_rest == 0) {
                            that._$scroll.find('.spinner').hide();

                        } else {
                            that._$scroll.find('.spinner').show();

                        }
                    }

                },
                error: function() {
                    that._$list.attr('loading', 'false');

                }

            })
        },

        //重新载入
        reload: function() {
            this._$list.html('');
            this._$scroll.find('.spinner').hide();
            this._$list.attr('offset', 0);
            this._$list.attr('has_rest', 0);
            this.getContent();

        }

    }

    return ScrollLoad;

});
/**
 *@overfileView 图片预览
 *author Yoocky <mengyanzhou@gmail.com>
 */
define('entry/tourpal/js/picview',['src/js/core'], function(core) {

	var _ui = $('<div>').addClass('picview');
	var _mask = $('<div>').addClass('mask-layer');


	var emptyfunc = function() {};

	var picview = {

		init: function(opt) {

			var options = $.extend({
				container: core.getActiveLayer(),
				url: "",
				btnArr: [{text : '&times', type : 'button', click : function(){}}],
				mask: true,
				clickMask: function() {}
			}, opt);

			if (_ui.parent().length === 0 || _ui.parent().attr("id") !== options.container.attr("id")) {
				_ui.appendTo(options.container);
				_mask.appendTo(options.container);
			}


			return options;

		},

		showmask: function() {
			this.init();
			_mask.show();
		},
		hidemask: function() {
			_mask.hide();
		},

		//  [{ text:"确定", color:"red", type:"button", click:function(){} },{},{}]
		show: function(opt) {

			var options = picview.init(opt);

			var btnHtml = "";
			for (var i = 0; i < options.btnArr.length; i++) {

				btnHtml += '<div class="item-btn">' + options.btnArr[i].text + '</div>';
			};

			if (options.mask) {
				_mask.show().unbind("click").bind("click", function() {
					options.clickMask();
				});
			};
			_ui.html('<div class="content"><div class="preloader-indicator-modal"><span class="preloader"></span></div><div class="image"></div></div>' + btnHtml);

			_ui.find(".item-btn").each(function(index) {
				if (options.btnArr[index].color !== "") {
					$(this).css("background", options.btnArr[index].color);
				};
				if (options.btnArr[index].type == "button") {
					$(this).on("click", function() {
						options.btnArr[index].click();
						picview.close();
					});
				};
			});

			//载入图片
			var img = new Image();
			img.src = options.url;
			img.onload = function(){
				_ui.find('.preloader-indicator-modal').hide();
				_ui.find('.image').html(img);
			}

			_ui.addClass("picview-active");

		},

		close: function() {

			_ui.removeClass("picview-active");
			_mask.hide();

		}
	}

	return picview;

});
/**
 *@overfileView 目的地页
 *author Yoocky <mengyanzhou@gmail.com>
 */

define('entry/tourpal/js/postlist',['src/js/core', 'src/js/dialog', 'entry/tourpal/js/tourpal', 'entry/tourpal/js/scrollLoad', 'entry/tourpal/js/picview'], function(core, dialog, tourpal, ScrollLoad, picview){
   
    //路径配置
    var path = {
        'postList' : '/index.php/Api/Dest/getPostsByPlace',                 //获取帖子列表 
        'delPost'  : '/index.php/Api/Posts/delPostById',                    //删除我的发帖
        'like': '/index.php/Api/Liked/like'                      //求同行
    }

    core.onrender('postlist',function(dom){
        
        var city = tourpal.getArgs()['city'];
        var $postlist = $(dom).find('.page-postlist');
        $(dom).find('.title').text(city);

        
        //滚动分页
        var sl = new ScrollLoad({
             scrollWrapSel : '.page-postlist',
             templateId : 'post_list_tpl',
             url : path.postList,
             data : {dest : city},
             noDataText : '该城市暂无发帖，<br/>点击发帖寻找同行的旅伴'      
        })  
    
        //求同行
        $postlist.on('click', '.join', function(){
            var that = this;
            //state : 1-求同行 0-取消同行
            var together = function(state){
                var $curPost = $(that).parents('.post-list');
                var params = { post_id : $curPost.attr('postid'), state : state }
                $.ajax({
                    url : path.like,
                    data : params,
                    dataType : 'json',
                    type : 'GET',
                    success : function(data){
                        if(data.code == 0){
                            if(data.data){
                                $curPost.find('.join-count em').text(data.data.likedNum);
                                if(data.data.state == 1){
                                    $curPost.find('.join .ico').addClass('active');
                                    $curPost.find('.join .text').html('已约行');
                                }else{
                                    $curPost.find('.join .ico').removeClass('active');
                                    $curPost.find('.join .text').html('求同行');
                                }
                            }
                        }else if(data.code == 2){
                            dialog.confirm({
                                content : '求同行前请完善用户信息！',
                                success : function(){
                                    core.addPager({
                                      id:'mycard',
                                      url:'mycard',
                                      active:true
                                    });
                                }
                            })
                        }
                    }
                });
            }   
            //检测是否登录
            if(!tourpal.isLogin()){
                tourpal.login();
                return false;
            } 
            //同行或取消同行
            if($(this).find('.active').length){
                dialog.confirm({
                    content : '真的不想一起同行了吗？',
                    success : function(){
                        together(0);
                    }
                })
            }else{
                if(localStorage.getItem('showSetting')){
                    together(1);
                }else{
                    localStorage.setItem('showSetting', 'hasShow');
                    var confirmOpt = {
                        content: '你的联系方式会展示给求同行的人',
                        btnArr: [
                        {
                            text: "确认",
                            color: "#E65749",
                            type: "button",
                            click: function(){
                                together(1);
                            }
                        },
                        {
                            text: "修改",
                            color: "#757575",
                            type: "button",
                            click: function(){
                                core.addPager({
                                  id:'setting',
                                  url:'setting',
                                  active:true
                                });
                            }
                        }]
                    }
                    dialog.show(confirmOpt);
                }
            }
            return false;
            
        });

        //点击发帖
        $(dom).find('.post-btn').on('click', function(){
            if(!tourpal.isLogin()){
                tourpal.login();
                return false;
            }  
            tourpal.post();
        })

        //图片预览
        $(dom).on('click', 'ul img', function(){
            var url = $(this).attr('preview');
            picview.show({
                url: url
            })
            return false;
        });
        
        //引导发帖
        var showTips = function(){
            //tips提示发帖
            var lastTime = localStorage.getItem('adLastCloseTime');
            if(!lastTime || new Date().getTime() - lastTime > 604800000){
                tourpal.alert.show('发个帖子试试，更容易找到驴友哦', 'alert-bar-shadow', true, function(){
                    localStorage.setItem('adLastCloseTime', new Date().getTime());
                });
            }
        }

        $(dom).on("beforeshow", function(eve) {
            if (eve.detail === 'postlist') {
               sl.reload();
            }
        });

        showTips();
    });
});
/**
 *@overfileView 我的发帖
 *author Yoocky <mengyanzhou@gmail.com>
 */

define('entry/tourpal/js/mypost',['src/js/core', 'src/js/dialog', 'entry/tourpal/js/tourpal', 'entry/tourpal/js/scrollLoad', 'entry/tourpal/js/picview'], function(core, dialog, tourpal, ScrollLoad, picview){
     //路径配置
    var path = {
        'thumbnail' : 'http://192.168.14.132:8080/i/tourpal_184x184/',      //缩略图图床路径
        'delPost'  : '/index.php/Api/Posts/delPostById',                    //删除我的发帖
        'myPosts' : '/index.php/Api/Posts/myPosts'                        //获取我的发帖 
    }

    core.onrender('mypost',function(dom){

        var $postlist = $(dom).find('.page-mypost');
        
        //滚动分页
        var sl = new ScrollLoad({
             scrollWrapSel : '.page-mypost',
             templateId : 'my_post_tpl',
             url : path.myPosts,
             noDataText : '你还没有发过帖子'      
        })  

        //图片预览
        $(dom).on('click', 'ul img', function(){
            var url = $(this).attr('preview');
            picview.show({
                url: url
            })
            return false;
        });

        $(dom).on("beforeshow", function(eve) {
            if (eve.detail === 'mypost') {
                sl.reload();
            }
        });
    });
});
define('src/js/dateextend',['lib/zepto'],function() {
	//日期扩展
	$.extend(Date.prototype, {
		//格式化输出日期
		format: function(fmt) {
				fmt = fmt || "yyyy-MM-dd";
				var t = this.toArray(),
					o = {
						"M+": t[1] + 1,
						"d+": t[2],
						"h+": t[3],
						"m+": t[4],
						"s+": t[5],
						"q+": Math.floor((t[1] + 3) / 3),
						"S": t[6]
					};
				if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (t[0] + "").substr(4 - RegExp.$1.length));
				for (var k in o) {
					if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
				}
				return fmt;
			},
		isLeapYear: function() {
				var y = this.getFullYear();
				return (0 === y % 4 && ((y % 100 !== 0) || (y % 400 === 0)));
			},
		daysInMonth: function() {
				return [31, 0, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][this.getMonth()] || (this.isLeapYear() ? 29 : 28);
			},
		dayOfYear: function() {
				return Math.ceil((this.getTime() - new Date(this.getFullYear(), 0, 1).getTime()) / Date.MSINDAY);
			},
			//返回添加相应时间后的时间(默认不指定part=7则按毫秒为单位)
			//part:1-年，2-月，3-日，4-时，5-分，6-秒，7-毫(默认)
			
		add: function(v, part) {
				if (part == 1 || part == 2) {
					var r = new Date(this);
					if (part == 1) r.setYear(r.getFullYear() + v);
					else r.setMonth(r.getMonth() + v);
					return r;
				} else return new Date(this.getTime() + [1, 0, 0, Date.MSINDAY, Date.MSINHOUR, Date.MSINMINUTE, Date.MSINSECOND, 1][part || 7] * v);
			},
			//返回日期的部分，默认年月日，可以通过part参数指定精度
			//part:1-年，2-月，3-日(默认)，4-时，5-分，6-秒，7-毫
			
		date: function(part) {
				var t = this.toArray();
				for (var i = part || 3; i < 7; i++) t[i] = i == 2 ? 1 : 0;
				return new Date(t[0], t[1], t[2], t[3], t[4], t[5], t[6]);
			},
			//将时间转换为数组
			
		toArray: function() {
				return [this.getFullYear(), this.getMonth(), this.getDate(), this.getHours(), this.getMinutes(), this.getSeconds(), this.getMilliseconds()];
			},
			//判断两个时间是否相等，可以通过part参数指定判断的精度
			//part:1-年，2-月，3-日，4-时，5-分，6-秒，7-毫(默认)
			
		equal: function(date, part) {
				if (typeof this != typeof date) return false;
				var t = this.toArray();
				date = date.toArray();
				for (var i = 0; i < (part || 7); i++)
					if (t[i] != date[i]) return false;
				return true;
			},
			//计算两个日期的间隔，可以通过part参数指定哪部分
			//part:1-年，2-月，3-日，4-时，5-分，6-秒，7-毫(默认)
			
		diff: function(date, part) {
			if (part == 1 || part == 2) {
				var r = this.getFullYear() - date.getFullYear();
				return part == 2 ? (r * 12 + this.getMonth() - date.getMonth()) : r;
			}
			part = [1, 0, 0, Date.MSINDAY, Date.MSINHOUR, Date.MSINMINUTE, Date.MSINSECOND, 1][part || 7];
			return this.getTime() / part - date.getTime() / part;
		}
	});

	$.extend(Date, {
		//转换对象、字符串或数字为日起对象
		parseDate: function(v, d) {
			switch (typeof v) {
				case "object":
				case "number":
					v = new Date(v);
					break;
				case "string":
					v = new Date(isNaN(v) ? v.trim().replace(/\-/g, "/") : parseInt(v));
					break;
			}
			return v == "Invalid Date" ? d : v;
		},
		MSINSECOND: 1e3,
		MSINMINUTE: 6e4,
		MSINHOUR: 36e5,
		MSINDAY: 864e5
	});
});
define('src/js/calendar',['src/js/dateextend','src/js/core'], function(ddd,core) {
	$.extend($.fn, {
		calendar: function(options) {
			options = $.extend({
				mindate: new Date(1970, 0, 1),
				maxdate: new Date(2050, 12, 31),
				tag: {
					week: ["日", "一", "二", "三", "四", "五", "六"]
				},
				eventCallBack: function(n) {
					console.log('this is callBack!');
					console.log(n);
				},
				festivaltag: {
					"1-1": ["元旦"],
					"2-14": ["情人节"],
					"3-8": ["妇女节"],
					"5-1": ["劳动节"],
					"6-1": ["儿童节"],
					"10-1": ["国庆"],
					"11-11": ["双十一"],
					"12-24": ["平安夜"],
					"12-25": ["圣诞"]
				},
				cnfestivaltag: {
					"2014-1-30": ["除夕"],
					"2014-1-31": ["春节"],
					"2014-2-14": ["元宵节"],
					"2014-4-5": ["清明"],
					"2014-6-2": ["端午节"],
					"2014-8-2": ["七夕"],
					"2014-9-8": ["中秋节"],

					"2015-2-18": ["除夕"],
					"2015-2-19": ["春节"],
					"2015-3-5": ["元宵节"],
					"2015-4-5": ["清明"],
					"2015-6-20": ["端午节"],
					"2015-8-20": ["七夕"],
					"2015-9-27": ["中秋节"],
				}


			}, options);

			var _this = this,
				_ui,
				pageWrap,
				_tag = {
					el: '',
					data: ''
				},
				_activeEls = {
					el: '',
					data: ''
				},
				_oldDay = true,
				_cln = null;

			var _buildUi = function() {
				var _count = options.maxdate.diff(options.mindate, 2);
				// console.log("_count........"+_count);
				var _pages = [];

				//用于管理tapBar
				var pageCtrl = {
					header: '',
					left: '',
					right: ''
				};
				pageWrap = $('<div>').addClass('cld page');//
				if (core.getActiveLayer()){
	                pageWrap.appendTo(core.getActiveLayer());
	            }else{
	                // pageWrap.appendTo("body");
	                document.body.appendChild(pageWrap[0])
	            }
				// .appendTo('body');
				pageCtrl.header = $('<header class="bar bar-nav"><nav><span class="icon icon-left-nav pull-left hide-cln"></span><span class="title">出发日期</span></nav></header>').appendTo(pageWrap);
				pageCtrl.left = pageCtrl.header.find('.hide-cln');
				var _title = $('<ul>').appendTo(pageWrap).addClass('cld-title');
				
				_ui = $('<div>').addClass('page-content').appendTo(pageWrap);
				pageCtrl.left.bind("click", function() {
					_cln.hide();
				});

				_bindEventFn();//绑定事件

				
				for (var j = 0; j < options.tag.week.length; j++) {
					var _item = $('<li>').text(options.tag.week[j]);
					_item.appendTo(_title);
				}
				// alert(options.mindate.format('yyyy-MM'));
				for (var i = 0; i <= _count; i++) {//fix 如果日期差2个月，则显示3个月
					//当前日历页签的日期
					//这里有可能会加多月份,切换到1号避免此问题
					var _monthDate = new Date(options.mindate.format('yyyy-MM')+"-01");

					var _firstDay = _monthDate.add(i, 2);
					// var _firstDay = new Date(_thisDate.format('yyyy-MM'));
					var _firstDayNum = _firstDay.getDay();
					var _monthNum = _firstDay.daysInMonth();
					var _dayTag = 0;

					// console.log(_firstDay);
					//每一个月的page
					var _page = {};
					_page.wrap = $("<section>").addClass('cld-item');
					_page.date = $("<h1>").appendTo(_page.wrap).text(_firstDay.format('MM') + "月").addClass('cld-titleDate');
					_page.days = $('<ul>').appendTo(_page.wrap).addClass('cld-day');

					for (var d = 0; d < 42; d++) {//6 * 7 最多6行，极端情况跨越6周
						if (d >= _firstDayNum && _dayTag < _monthNum) {
							var _thisDay = _firstDay.add(_dayTag, 3);
							_dayTag++;

							var _thisEl = $('<li>').text(_dayTag).attr('data-day', _thisDay.format()).appendTo(_page.days);

							_bindFestivalTagFn(_thisEl, _thisDay, _dayTag);

							if (_oldDay) {
								_thisEl.addClass("disabled");
							}
							
						} else{
							if (d >= 28 && d % 7 === 0) {
								break;
							}
							$('<li>').text('').appendTo(_page.days);
						}
						
					}
					_pages.push(_page);
				}

				for (i = 0; i < _pages.length; i++){
					_pages[i].wrap.appendTo(_ui);
				}
			
			}


			var _bindFestivalTagFn = function(el, date, n, cb) {
				var _today = new Date();
				//固定节日信息
				var _ftag = options.festivaltag[[date.getMonth() + 1, date.getDate()].join("-")];
				//中国节日信息
				var _cnftag = options.cnfestivaltag[[date.getFullYear(), date.getMonth() + 1, date.getDate()].join("-")];

				if (date.equal(_today, 3)) {
					el.text("今天");
				}
				if (date.equal(options.mindate, 3)){//比最小日期小的不绑定事件
					_oldDay = false;
				}else if (date.equal(options.maxdate.add(1, 3), 3)){
					_oldDay = true;
				}

				if (_ftag || _cnftag) {
					var _tagtext;

					if (_ftag)
						_tagtext = _ftag;

					if (_cnftag)
						_tagtext = _cnftag;

					el.html('<div><span class="festival">' + n + '</span><span class="festivalText">' + _tagtext + '</span></div>');
				}

				if (typeof cb == "function")
					cb();

			}

			var _bindEventFn = function() {
				if (typeof options.eventCallBack === 'function') {
					_ui.on("click",".cld-day li",function(){
						if ($(this).hasClass("disabled")) {
							return false;
						}
						var _data = $(this).attr('data-day');
						
						_activeFn($(this), new Date(_data).getDate());
						_tag.el = $(this);
						_tag.data = _data;
						_cln.hide();
						options.eventCallBack(_data);
					});
				}

				// new IScroll(pageWrap[0], { mouseWheel: true });
				 
				// if (el && fn && typeof fn == "function") {
				// 	el.bind("click", function() {
				// 		var _data = $(this).attr('data-day');
				// 		fn(_data);
				// 		_activeFn($(this), new Date(_data).getDate());
				// 		_tag.el = $(this);
				// 		_tag.data = _data;
				// 		hideCln();
				// 	});
				// }

				$(_this).on("click", function(){
					_cln.show();
				});
			};

			var _activeFn = function(el, n) {

				if (_activeEls.el !== '') {
					_activeEls.el.hide();
					_activeEls.el.parent().html(_activeEls.data)
					_activeEls.el.remove();
				}

				var _wrap = $('<div>');

				$('<span>').addClass('active').text(n).appendTo(_wrap);
				$('<span>').text('出发').addClass('activeText').appendTo(_wrap);
				_activeEls.data = $(el).html();
				_activeEls.el = _wrap;
				el.html('');
				_wrap.appendTo(el);

			}

			var hideCln = function() {
				if (core.isLowDevice) {
					pageWrap.siblings(".page-content").show();
				}
				if (core.transitionEnd) {
					_ui.parent().addClass("page-transitioning").on(core.transitionEnd,function(){
						$(this).removeClass("page-transitioning");
					});
				}
			}

			var showCln = function() {
				if (typeof options.selectDate === 'function') {//更新show btn的方法
					var activeDate = options.selectDate();
					var li = _ui.find("[data-day='"+activeDate+"']");
					var shownum = parseInt(activeDate.substr(-2));
					li.length && _activeFn(li,shownum);
				}
				if (core.isLowDevice) {
					pageWrap.siblings(".page-content").hide();
					$("body").scrollTop(0)
				}
				if (core.transitionEnd) {
					_ui.parent().addClass("page-transitioning").on(core.transitionEnd,function(){
						$(this).removeClass("page-transitioning");
					});
				}
			}

			_buildUi();

			_cln = {
				page: _ui.parent(),
				option : {
					showType : "transition",
					transitionClass : "cld-active"
				},
				beforeShow: showCln,
				afterHide: hideCln
			};

			return _cln;
		}
	});

});
/**
 *@overfileView 图片上传业务插件
 *author Yoocky <mengyanzhou@gmail.com>
 */

define('entry/tourpal/js/upload',['src/js/core', 'entry/tourpal/js/tourpal'], function(core, tourpal){
       var upload = function (settings) {  
  
            var options = $.extend({  
                fileType: "gif|jpg|jpeg|png|bmp",                       //允许的文件格式  
                uploadUrl: "/index.php/Api/Images/upload",      //上传URL地址    
                width: "",                                              //图片显示的宽度  
                height: 100,                                            //图片显示的高度  
                addSelector: ".add-btn",                                //添加按钮
                listSelector: ".img-list",                              //图片列表容器
                successFn: function(){}                                 //返回图片地址，和dom中的
            }, settings);  
            
            //初始化
            var init = function(){
                addInput();
                bindEvent();

            }

            //添加input
            var addInput = function(){
                $(options.addSelector).html('<input type="file" name="file"  class="watch-change"/>');
            }

            //验证文件格式  
            var checkFile = function (filename) {  
                   var reg = new RegExp('\.' + options.fileType + '$','i');
                   return reg.test(filename); 
            }  

            //创建表单  
            var createForm = function () {  

                    var form = document.createElement("form");  
                    var id = new Date().getTime();
                    form.action = options.uploadUrl;
                    form.method = "post";  
                    form.enctype = "multipart/form-data";  
                    form.target  = "iframe_" + id;
                    form.style.display = "none";  
                    var $form = $(form);
                    $form.attr('data-id', id);
                    $form.addClass('id_' + id);
                    var $iframe = $('<iframe style="display:none" data-id="' + id + '" name="iframe_' + id + '" class="id_' + id + '"></iframe>');
                    $('body').append($iframe); 
                    $('body').append($form); 
                    return $form;  
            } 
            //上传主函数  
            var bindEvent = function(){
                $('.add-btn').on('change', '.watch-change', function(){  
                    var $this = $(this);    
                    var $imgList = $(options.listSelector);  
                    if ($this.val() === "") {  
                        tourpal.alert.show("请选择要上传的图片！");  
                        return false;  
                    }  
                    //验证图片  
                    if (!checkFile($this.val())) {  
                        tourpal.alert.show("文件格式不正确，只能上传格式为：" + options.fileType + "的文件。");  
                        return false;  
                    }  

                    //创建表单  
                    var $form = createForm();  

                    //把上传控件附加到表单  
                    var formId = $form.attr('data-id'); 
                    $this.appendTo($form);
                    $form.append('<input name="id" value="' + formId  + '">');
                    addInput();
                    $imgList.prepend('<li data-id="' + formId +'"><img src="data:image/gif;base64,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" alt=""><span class="del">&times;</span></li>');
                    //提交
                    $form.submit();
                   
                });
                
                //监听iframe中的图片上传事件
                $(window).on('message', function(e){
                        options.successFn(e.data);
                        var id = e.data.data.id;
                        $('.id_' + id).remove();
                })
            }  

            init();
        }  
  return upload;
});
/**
 *@overfileView 发帖页
 *author Yoocky <mengyanzhou@gmail.com>
 */

define('entry/tourpal/js/post',['src/js/core', 'src/js/dialog', 'src/js/city', 'src/js/calendar', 'src/js/PluginManager' ,'entry/tourpal/js/upload', 'entry/tourpal/js/tourpal'], function(core, dialog, city, calendar, PluginManager, upload, tourpal){
  
    //路径配置
    var path = {
        'thumbnail' : 'http://192.168.14.132:8080/i/tourpal_184x184/',      //缩略图图床路径
        'postApi' : '/index.php/Api/Posts/post',                            //发帖接口  
        'getTags' : '/index.php/Api/Tags/getTags'                           //获取标签接口
    }
    
    //表单验证
    var validate = {

        //基本校验是不是为空值
        checkNull : function(form){
            return $(form).val().trim() != '';
        },

         //校验目的地
        checkDest : function(form) {
              if(this.checkNull(form)){
                 return true;
              }
              this.showError('目的地不能为空', form);   
              return false;             
        },

        //校验出发时间
        checkStart : function(form) {
              if(this.checkNull(form)){
                 return true;
              }
              this.showError('出发时间不能为空', form);   
              return false;                   
        },

        //校验出发天数
        checkDays : function(form) {
            if(this.checkNull(form)){
              var number = $(form).val().trim();
              number = number.replace(/^0*/g, '');
              $(form).val(number);
              if(number < 1){
                  this.showError('旅行时间不能小于1天', form); 
                  return false;            
              }else if(number > 99){
                   this.showError('旅行时间不能超过99天', form); 
                  return false; 
              }else{
                  return true;
              }          
            }else{
              this.showError('旅行时间不能为空', form);
              return false;
            }
        },

          //校验手机号
        checkPhone : function(form) {
          if(this.checkNull(form)){
              var phone = $(form).val().trim();
              var flag = /^1[3|4|5|8|7][0-9]\d{4,8}$/.test(phone);
              if(!flag){
                  this.showError('手机号格式错误', form);
              }
              return flag;
          }else{
            return true;
          }
        },

        //校验QQ
        checkQQ : function(form) {
              var number = $(form).val().trim();
              number = number.replace(/^0*/g, '');
              $(form).val(number);
              return true;                    
        },

        //校验微信
        checkWeixin : function(form) {
              return true;                
        },

        //校验内容
        checkContent : function(form) {
            if(this.checkNull(form)){
              return true;
            }
            this.showError('描述不能为空', form);   
            return false;                    
        },

        //错误提示
        showError : function(message, form){
            $(form).focus();
            tourpal.alert.show(message);
        },

        flag : true
    }

    core.onrender('post',function(dom){
        var init = function(){
            $(dom).find('.alert-bar').hide();
            var $btn = $(dom).find('.btn-post');
            var $form = $('#post_form');;
             //清空表单
            $btn.removeClass('disabled');
            $form[0].reset()
            $('.img-list li[data-id]').remove();
            $('#dest_list').html('');
            tagAction.clear();
            //初始化用户信息
            tourpal.getUserInfo(function(data){
               if(data.is_complete == 0){
                  core.addPager({
                      id:'mycard',
                      url:'mycard',
                      active:true,
                      reverse:true
                  });
               }else{
                  //destAction.add(localStorage.getItem('dest'));
                  $form.find('[name=nick_name]').val(data.nick_name);
                  $form.find('[name=sex]').val(data.sex);
                  $form.find('[name=age]').val(data.age);
                  $form.find('[name=weixin]').val(data.weixin);
                  $form.find('[name=qq]').val(data.qq);
                  //$form.find('[name=phone]').val(data.phone); 暂时不自动填写手机号
                  window.locationSuccess = function(data){
                    data = JSON.parse(data);
                    if(data.error == 0){
                      var coords = data.data.coords;
                      $form.find('[name=post_place]').val(coords.latitude + ',' + coords.longitude);
                    }
                  }
                  ElongApp.locationGet("locationSuccess");
               }
          })
        }
        //目的地
        var destAction = {
          add : function(data){
            if($.inArray(data[3], this.getList()) > -1){
              return;
            }
            $('#dest_list').append('<span class="btn btn-negative btn-outlined"><span class="dest-name" pid="' + data[3] + '">' + data[1] + '</span><span class="del-dest">&times</span></span>');
          },
          getList :function(){
            var list = [];
            $('#dest_list .dest-name').each(function(){
              list.push($(this).attr('pid'));
            })
            return list;
          },
          setValue : function(){
             var list = this.getList();
             $('#post_form').find('[name=dest]').val(list.join(','));
          }
        }
        //城市选择
        $("#dest_selector").on("click", function(){
              pluginDest.show(function(data) {
                  destAction.add(data);
              });
        });
        PluginManager.add("dest", city);
        pluginDest = PluginManager.getItem('dest');

        //删除城市
        $('#dest_list').on('click', '.del-dest', function(){
            $(this).parent().remove();
        })

        //日期选择
        var date = new Date();
        var cln = $("#date_selector").calendar({
            mindate: date,
            maxdate: date.add(2, 2),
            eventCallBack: function(data) {
                $("#date_selector").val(data);
            }
        });
        PluginManager.add("calendar", cln);

        //标签选择
        var tagAction = {
          getTags : function(){
            var tags = [];
            $('.tag-list .active').each(function(){
                tags.push($(this).text());
            })
            return tags.join(',');
          },
          initList : function(){
            $.getJSON(path.getTags, function(data){
                var html = '';
                data.data.forEach(function(tag){
                  html += '<span class="btn gray">' + tag + '</span>\n';
                })
                $('.tag-list').html(html);
            })
          },
          clear : function(){
              $('.tag-list .btn').removeClass('active');
          } 
        }
        //便签选择
        $('.tag-list').on('click', '.btn', function(){
            $(this).toggleClass('active');
            if($('.tag-list .active').length > 3){
              $(this).removeClass('active');
            }
        })
        tagAction.initList();

        //初始化图片上传插件
        upload({
          successFn : function(data){
            if(data.code == 0){
              var url = data.data[0];
              var picId = url.substr(url.lastIndexOf('/')+1).replace('.jpg', '');
              var $li = $('.img-list').find('[data-id="' + data.data.id + '"]');
              $li.find('img').attr('src', url);
              $li.attr('data-picid', picId);
            } 
          }
        });
        
        //删除照片
        $(dom).find('.img-list').on('click', '.del', function(){
            $(this).parents('li').remove();
        })
        
        //地理位置开关
        $(dom).on('click', '.position-switch', function(){
            var $ico = $(this).find('.ico');
            var $text = $(this).find('label em').eq(1);
            $ico.toggleClass('ico-positionact');
            if($ico.hasClass('ico-positionact')){
              $text.text('已显示我的位置');
            }else{
              $text.text('点击显示我的位置');
            }
        })

        //图片个数限制
        $(dom).find('.add-btn').on('click', function(){
            if($('.img-list li[data-id]').length >= 3){
                dialog.alert('最多上传三张照片');
                return false;
            }
        })

        //发帖
        $(dom).find('.btn-post').on('click', function(){
           var $btn = $(this);
           if($btn.hasClass('disabled')){
              return false;
           }
           
           var $form = $('#post_form');
           destAction.setValue();
           validate.flag = true;
           $form.find('[data-check]').each(function(){
               if(validate.flag){
                 var checkType = $(this).attr('data-check');
                 validate.flag &= validate[checkType](this);
                }
           })
           if(!validate.flag){
              return false;
           }  

           //校验至少有一个联系方式
           var allNull = true;
           $form.find('.needone').each(function(){
                allNull &= !validate.checkNull(this);
           })
           if(allNull){
              tourpal.alert.show('至少输入一个联系方式');
              return false;
           }
           //通过校验提交表单
           tourpal.alert.hide();
           var data = $form.serialize();
           data = tourpal.unparam(data);
           //是否提交地理位置
           if(!$('.position-switch').find('.ico').hasClass('ico-positionact')){
              data.post_place = '';
           }
           var imgs = [];
           $('.img-list [data-picid]').each(function(){
              var picId = $(this).attr('data-picid');
              imgs.push(picId);
           })
           data.imgs = imgs.join(',');
           data.tags = tagAction.getTags();
           var dest = $('#dest_list .dest-name').eq(0).text();
           $btn.addClass('disabled');
           $.ajax({
              url : path.postApi,
              data : data,
              dataType : 'json',
              type : 'POST',
              success: function(data){
                 if(data.code == 0){
                    $btn.removeClass('disabled');
                    var params = $.param({'city': dest, 'r' : new Date().getTime()});
                    core.addPager({
                        id:'postlist',
                        url:'postlist?' + params,
                        active:true,
                        reverse:true
                    });
                 }
              }
           })
        })
        
        $(dom).on("beforeshow", function(eve) {
            if (eve.detail === 'post') {
              init();
            }
        });

        init();
    });
});
/**
 *@overfileView 求同行的人
 *author Yoocky <mengyanzhou@gmail.com>
 */

define('entry/tourpal/js/joylist',['src/js/core', 'entry/tourpal/js/tourpal', 'entry/tourpal/js/scrollLoad'], function(core,  tourpal, ScrollLoad){
     //路径配置
    var path = {
        'getLiked'  : '/index.php/Api/Liked/getLikedInfoByPostId'                //获取点赞列表
    }

    core.onrender('joylist',function(dom){

        var $list = $(dom).find('.page-joylist');
        var postId = tourpal.getArgs()['post_id'];

        //滚动分页
        var sl = new ScrollLoad({
             scrollWrapSel : '.page-joylist',
             templateId : 'joy_list_tpl',
             url : path.getLiked,
             data : {post_id : postId},
             noDataText : '暂未收到请求同行的消息',
             callback : function(data, offset){
                if(offset == 0){
                     tourpal.alert.show('<a data-rel="link" href="postdetail?post_id=' + postId + '">同行目的地：' + data.dest + '</a>', 'joylist-bar');
                }    
             }      
        })
        $(dom).on("beforeshow", function(eve) {
            if (eve.detail === 'joylist') {
              sl.reload();
            }
        });  
    });
});
/**
 *@overfileView 个人资料页
 *author Yoocky <mengyanzhou@gmail.com>
 */

define('entry/tourpal/js/mycard',['src/js/core', 'entry/tourpal/js/tourpal'], function(core, tourpal){
  
    //路径配置
    var path = {
        'userSave' : '/index.php/Api/User/userSave'                                      //发帖接口   
    }
    
    //表单验证
    var validate = {

        //基本校验是不是为空值
        checkNull : function(form){
            return $(form).val().trim() != '';
        },
        //校验昵称
        checkNickname : function(form) {
              if(this.checkNull(form)){
                  return true;
              }else{
                  this.showError('昵称不能为空', form);
                  return false;
              }               
        },
         //校验年龄
        checkAge : function(form) {
            if(this.checkNull(form)){
              var number = $(form).val().trim();
              number = number.replace(/^0*/g, '');
              $(form).val(number);
              if(number){
                  return true;
              }
              this.showError('请输入有效的年龄', form); 
              return false;            
            }else{
              this.showError('年龄不能为空', form);
              return false;
            }              
        },

        //校验手机号
        checkPhone : function(form) {
          if(this.checkNull(form)){
              var phone = $(form).val().trim();
              var flag = /^1[3|4|5|8|7][0-9]\d{4,8}$/.test(phone);
              if(!flag){
                  this.showError('手机号格式错误', form);
              }
              return flag;
          }else{
            return true;
          }
        },

        //校验QQ
        checkQQ : function(form) {
              var number = $(form).val().trim();
              number = number.replace(/^0*/g, '');
              $(form).val(number);
              return true;                    
        },

        //校验微信
        checkWeixin : function(form) {
              return true;                
        },

        //错误提示
        showError : function(message, form){
            $(form).focus();
            tourpal.alert.show(message);
        },

        flag : true
    }

    core.onrender('mycard',function(dom){
        var $form = $('#mycard_form');

         //初始化用户资料
         tourpal.getUserInfo(function(data){
            $form.find('[name=nick_name]').val(data.nick_name)
            $form.find('[name=sex]').val(data.sex)
            $form.find('[name=age]').val(data.age)
            $form.find('[name=weixin]').val(data.weixin)
            $form.find('[name=qq]').val(data.qq)
            $form.find('[name=phone]').val(data.phone)
         })
        
        //更新个人资料
        $(dom).find('.btn-save').on('click', function(){
           var $btn = $(this);
           if($btn.hasClass('disabled')){
              return false;
           }
           
           validate.flag = true;
           $form.find('[data-check]').each(function(){
               if(validate.flag){
                 var checkType = $(this).attr('data-check');
                 validate.flag &= validate[checkType](this);
                }
           })
           if(!validate.flag){
              return false;
           }  

           //校验至少有一个联系方式
           var allNull = true;
           $form.find('.needone').each(function(){
                allNull &= !validate.checkNull(this);
           })
           if(allNull){
              tourpal.alert.show('至少输入一个联系方式');
              return false;
           }

           //通过校验提交表单
           tourpal.alert.hide();
           var data = $form.serialize();
           $btn.addClass('disabled');
           $.ajax({
              url : path.userSave,
              data : data,
              dataType : 'json',
              type : 'POST',
              success: function(data){
                 if(data.code == 0){
                    $btn.removeClass('disabled');
                    var params = tourpal.getArgs();
                    var redirect = params['redirect'];
                    if(redirect){
                      delete params.redirect;
                      params = $.param(params);
                      core.addPager({
                          id: redirect,
                          url: params ? redirect + '?' + params : redirect,
                          active:true
                      });
                    }else{
                      tourpal.alert.show('保存成功');
                      setTimeout(function(){
                        tourpal.alert.hide();
                      }, 1000);
                    }
                    
                 }
              }
           })
        })
        //退出登录
        $(dom).find('.logout').on('click', function(){
          tourpal.loginOut();
        });
    });
});
/**
 *@overfileView 个人资料页
 *author Yoocky <mengyanzhou@gmail.com>
 */

define('entry/tourpal/js/card',['src/js/core', 'entry/tourpal/js/tourpal'], function(core, tourpal){
  
    core.onrender('card', function(dom){
        var $form = $('#card_form');
        var uid = tourpal.getArgs()['uid'];
         //初始化用户资料
         tourpal.getUserInfo(function(data){
            $form.find('[name=nick_name]').val(data.nick_name)
            $form.find('[name=sex]').val(data.sex)
            $form.find('[name=age]').val(data.age)
            $form.find('[name=weixin]').val(data.weixin || '未填写')
            $form.find('[name=qq]').val(data.qq || '未填写')
            $form.find('[name=phone]').val(data.phone || '未填写')
         }, uid)
    });
});
/**
 *@overfileView 消息中心
 *author Yoocky <mengyanzhou@gmail.com>
 */

define('entry/tourpal/js/message',['src/js/core', 'entry/tourpal/js/tourpal', 'entry/tourpal/js/scrollLoad', 'lib/artTemplate'], function(core, tourpal, dragload, template){
     //路径配置
    var path = {
        'myPostsCount' : '/index.php/Api/Posts/myPostsCount'                        //获取我的发帖 
    }

    core.onrender('message',function(dom){

        //获取帖子总数
        var getPostCount = function(){
            var $postCount = $(dom).find('.post-count');
            $.ajax({
              url : path.myPostsCount,
              dataType : 'json',
              type : 'GET',
              success : function(data){
                if(data.code == 0){
                   $postCount.text(data.data)
                }else if(data.code == 1){
                   $postCount.text(0)
                }
              }
            })
        }

        var init = function(){
            getPostCount();
            tourpal.getMessage();
            $('.page-content').scrollTop(0);
            tourpal.getUserInfo(function(data){
                var html = template('user_info_tpl', data);
                $(dom).find('.user-info').html(html);
            })
        }

        $(dom).on("beforeshow", function(eve) {
            if (eve.detail === 'message') {
                init();
            }
        });

        init();
    });
});
/**
 *@overfileView 向我求同行的人
 *author Yoocky <mengyanzhou@gmail.com>
 */

define('entry/tourpal/js/myjoy',['src/js/core', 'entry/tourpal/js/tourpal', 'entry/tourpal/js/scrollLoad'], function(core, tourpal, ScrollLoad){
     //路径配置
    var path = {
        'getNewsList'  : '/index.php/Api/Liked/getNewsList'                //获取点赞列表
    }

    core.onrender('myjoy',function(dom){

        var $list = $(dom).find('.page-myjoy');
        
        //滚动分页
        var sl = new ScrollLoad({
             scrollWrapSel : '.page-myjoy',
             templateId : 'my_joy_tpl',
             url : path.getNewsList,
             noDataText : '暂未收到请求同行的消息'
        })  

        //页面显示后初始化
        $(dom).on("beforeshow", function(eve) {
            if (eve.detail === 'myjoy') {
                sl.reload();
            }
        });
    });
});
/**
 *@overfileView 用户反馈
 *author Yoocky <mengyanzhou@gmail.com>
 */

define('entry/tourpal/js/feedback',['src/js/core', 'entry/tourpal/js/tourpal'], function(core, tourpal){
  
    //路径配置
    var path = {
        'feedback' : '/index.php/Api/Feedback/feedback'                                      //发帖接口   
    }
    
    //表单验证
    var validate = {

        //基本校验是不是为空值
        checkNull : function(form){
            return $(form).val().trim() != '';
        },

        //校验邮箱
        checkEmail : function(form){
          if(this.checkNull(form)){
              var email = $(form).val().trim();
              var flag = /^[A-Za-zd]+([-_.][A-Za-zd]+)*@([A-Za-zd]+[-.])+[A-Za-zd]{2,5}$/.test(email);
              if(!flag){
                  this.showError('邮箱格式错误', form);
              }
              return flag;
          }else{
            return true;
          }
        },

        //校验手机号
        checkPhone : function(form) {
          if(this.checkNull(form)){
              var phone = $(form).val().trim();
              var flag = /^1[3|4|5|8|7][0-9]\d{4,8}$/.test(phone);
              if(!flag){
                  this.showError('手机号格式错误', form);
              }
              return flag;
          }else{
            return true;
          }
        },
   
        //校验QQ
        checkQQ : function(form) {
              var number = $(form).val().trim();
              number = number.replace(/^0*/g, '');
              $(form).val(number);
              return true;                    
        },

        //校验内容
        checkContent : function(form) {
            if(this.checkNull(form)){
              return true;
            }
            this.showError('反馈内容不能为空', form);   
            return false;                    
        },

        //错误提示
        showError : function(message, form){
            $(form).focus();
            tourpal.alert.show(message);
        },

        flag : true
    }

    core.onrender('feedback',function(dom){

        var $form = $('#feedback_form');

        var init = function(){
            $(dom).find('.alert-bar').hide();
            var $btn = $(dom).find('.btn-save');
             //清空表单
            $btn.removeClass('disabled');
            $form[0].reset()
            //初始化用户信息
            tourpal.getUserInfo(function(data){
                $form.find('[name=qq]').val(data.qq)
                $form.find('[name=phone]').val(data.phone)
            });
       }
         
        //提交反馈信息
        $(dom).find('.btn-save').on('click', function(){
           var $btn = $(this);
           if($btn.hasClass('disabled')){
              return false;
           }
           
           validate.flag = true;
           $form.find('[data-check]').each(function(){
               if(validate.flag){
                 var checkType = $(this).attr('data-check');
                 validate.flag &= validate[checkType](this);
                }
           })
           if(!validate.flag){
              return false;
           }  

           //通过校验提交表单
           tourpal.alert.hide();
           var data = $form.serialize();
           $btn.addClass('disabled');
           $.ajax({
              url : path.feedback,
              data : data,
              dataType : 'json',
              type : 'POST',
              success: function(data){
                 if(data.code == 0){
                    $btn.removeClass('disabled');
                    var params = tourpal.getArgs();
                    var redirect = params['redirect'];
                    if(redirect){
                      delete params.redirect;
                      params = $.param(params);
                      core.addPager({
                          id: redirect,
                          url: params ? redirect + '?' + params : redirect,
                          active:true
                      });
                    }else{
                      tourpal.alert.show('提交成功');
                      history.back();
                    }
                    
                 }else{
                    $btn.removeClass('disabled');
                    tourpal.alert.show('重复提交');
                 }
              }
           })
        })
         $(dom).on("beforeshow", function(eve) {
            if (eve.detail === 'feedback') {
              init();
            }
        });

        init();
    });
});
/**
 *@overfileView 目的地页
 *author Yoocky <mengyanzhou@gmail.com>
 */

define('entry/tourpal/js/postdetail',['src/js/core', 'src/js/dialog', 'entry/tourpal/js/tourpal', 'entry/tourpal/js/picview', 'lib/artTemplate'], function(core, dialog, tourpal, picview, template){
   
    //路径配置
    var path = {
        'postDetail' : '/index.php/Api/Posts/postDetail',                   //获取帖子详情 
        'delPost'  : '/index.php/Api/Posts/delPostById',                    //删除我的发帖
        'closePost': '/index.php/Api/Posts/closePostById',                  //关闭帖子
        'like': '/index.php/Api/Liked/like',                                //求同行
        'report' : '/index.php/Api/Report/addReport'                        //举报
    }

    core.onrender('postdetail',function(dom){
        
        var postId = tourpal.getArgs()['post_id'];
        var shareInfo = {};
        var $footer = $(dom).find('footer');
        var $popover = $(dom).find('.popover');
        var $postDetail = $(dom).find('.post-detail-wrap');
        var accessWx = {
            debug: false, 
            jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage'] 
        };

        //获取帖子详情
        var getPostDetail = function(){
            $.ajax({
                url : path.postDetail,
                data : {post_id : postId , shareUrl : location.href.split('#')[0]},
                dataType : 'json',
                type : 'GET',
                success : function(data){
                    if(data.code == 0){
                        if(data.data.postInfo){
                            var detail = template('post_detail_tpl', data.data);
                            var menu = template('post_detail_menu_tpl', data.data);
                            var footer = template('post_detail_footer_tpl', data.data);
                            $('.post-detail-wrap').html(detail);
                            $(dom).find('.popover').html(menu);
                            $(dom).find('footer').html(footer);
                            shareInfo = data.data.shareInfo;
                            if(!accessWx.signature){
                                accessWx = $.extend(accessWx, data.data.shareInfo.accessWx);
                                wx.config(accessWx);
                            }
                        }else{
                            core.addPager({
                              id:'hotcity',
                              url:'hotcity',
                              active:true
                            });
                        }
                    }
                }
            });
        }

        //删除自己的发帖
        $popover.on('click', '.del', function(){
            dialog.confirm({
                content : '确定删除吗？',
                success : function(){
                    var params = { post_id : postId}
                    $.ajax({
                        url : path.delPost,
                        data : params,
                        dataType : 'json',
                        type : 'GET',
                        success : function(data){
                            if(data.code == 0){
                                if(data.data){
                                   History.back();
                                }
                            }
                        }
                    });
                }
            })
        });

        //关闭帖子
        $popover.on('click', '.close', function(){
            dialog.confirm({
                content : '确定关闭帖子吗？',
                success : function(){
                    var params = { post_id : postId}
                    $.ajax({
                        url : path.closePost,
                        data : params,
                        dataType : 'json',
                        type : 'GET',
                        success : function(data){
                            if(data.code == 0){
                                if(data.data){
                                    getPostDetail();
                                }
                            }
                        }
                    });
                }
            })
        });

        //举报帖子
        $popover.on('click', '.report', function(){
             var params = { post_id : postId}
             $.ajax({
                url : path.report,
                data : params,
                dataType : 'json',
                type : 'GET',
                success : function(data){
                    if(data.code == 0){
                        if(data.data){
                          tourpal.alert.show('举报已提交，等待审核');
                          setTimeout(function(){
                            tourpal.alert.hide();
                          }, 2000)
                        }
                    }
                }
            });
        });

        //求同行
        $footer.on('click', '.join', function(){
            if($(this).hasClass('disabled')){
                return false;
            }
            //state : 1-求同行 0-取消同行
            var together = function(state){
                var params = { post_id : postId, state : state }
                $.ajax({
                    url : path.like,
                    data : params,
                    dataType : 'json',
                    type : 'GET',
                    success : function(data){
                        if(data.code == 0){
                            if(data.data){
                                $(dom).find('.join-count em').text(data.data.likedNum);
                                if(data.data.state == 1){
                                    $(dom).find('.join .ico').addClass('active');
                                    $(dom).find('.join .text').html('已约行');
                                }else{
                                    $(dom).find('.join .ico').removeClass('active');
                                    $(dom).find('.join .text').html('求同行');
                                }
                                getPostDetail();
                            }
                        }else if(data.code == 2){
                            dialog.confirm({
                                content : '求同行前请完善用户信息！',
                                success : function(){
                                    core.addPager({
                                      id:'mycard',
                                      url:'mycard',
                                      active:true
                                    });
                                }
                            })
                        }
                    }
                });
            }   

            //检测是否登录
            if(!tourpal.isLogin()){
                tourpal.login();
                return false;
            } 
            //同行或取消同行
            if($(this).find('.active').length){
                dialog.confirm({
                    content : '真的不想一起同行了吗？',
                    success : function(){
                        together(0);
                    }
                })
            }else{
                if(localStorage.getItem('showSetting')){
                    together(1);
                }else{
                    var confirmOpt = {
                        content: '你的联系方式会展示给求同行的人',
                        btnArr: [
                        {
                            text: "确认",
                            color: "#E65749",
                            type: "button",
                            click: function(){
                                together(1);
                            }
                        },
                        {
                            text: "修改",
                            color: "#757575",
                            type: "button",
                            click: function(){
                                core.addPager({
                                  id:'setting',
                                  url:'setting',
                                  active:true
                                });
                            }
                        }]
                    }
                    dialog.show(confirmOpt);
                }
                
            }
            
        });
        
        //分享
        $footer.on('click', '.share', function(){
             $('#touchStyleWeixinShare').show();
        })
        $('#touchStyleWeixinShare').on('click',function(){
            $(this).hide();
        })
        wx.ready(function(){
            // 获取“分享到朋友圈”按钮点击状态及自定义分享内容接口
            wx.onMenuShareTimeline({
                title: shareInfo.title,
                link: shareInfo.link,
                imgUrl: shareInfo.img_url
            });
            // 获取“分享给朋友”按钮点击状态及自定义分享内容接口
            wx.onMenuShareAppMessage({
                title: shareInfo.title,
                desc:  shareInfo.desc, 
                link:  shareInfo.link,
                imgUrl: shareInfo.img_url, 
                type: 'link'
            });
        });

        //图片预览
        $postDetail.on('click', 'ul img', function(){
            var url = $(this).attr('preview');
            picview.show({
                url: url
            })
        });

        //点击求同行小组提示求同行后可见
        $postDetail.on('click', '.peer-group a', function(){
            if(!$(this).attr('data-rel')){
                tourpal.alert.show('同行小组成员可见');
                setTimeout(function(){
                    tourpal.alert.hide();
                }, 2000);
            }
        })

        getPostDetail();
    });
});
/**
 *@overfileView 隐私设置页面
 *author Yoocky <mengyanzhou@gmail.com>
 */

define('entry/tourpal/js/setting',['src/js/core', 'entry/tourpal/js/tourpal'], function(core, tourpal){
    //路径配置
    var path = {
        'editPrivacy'  : '/index.php/Api/User/editPrivacy',                    //隐私设置
    }
  
    core.onrender('setting', function(dom){
        var $form = $('#setting_form');
        
        $(dom).on('click', '.toggle', function(){
            $(this).toggleClass('active');
        });

         //初始化用户设置
         tourpal.getUserInfo(function(data){
            $form.find('.single-setting .toggle').each(function(){
                    var value = $(this).attr('data-value') & data.visible_item;
                    if(value){
                        $(this).addClass('active');
                    }else{
                        $(this).removeClass('active');
                    }
            })
            $groupSetting = $form.find('.group-setting .toggle');
            if(data.group_visible == 1){
                $groupSetting.addClass('active');
            }else{
                $groupSetting.removeClass('active');
            }
         })

         //保存设置
         $(dom).find('.btn-save').on('click', function(){
            var $btn = $(this);
            if($btn.hasClass('disabled')){
              return false;
            }
            var params = {
                visible_item : 0,
                group_visible : null,
            };
            $form.find('.single-setting .active').each(function(){
                params.visible_item += $(this).attr('data-value') * 1;
            });
            params.group_visible = $form.find('.group-setting .toggle').hasClass('active') * 1;
            $btn.addClass('disabled');
            $.ajax({
                    url : path.editPrivacy,
                    data : params,
                    dataType : 'json',
                    type : 'GET',
                    success : function(data){
                        if(data.code == 0){
                            $btn.removeClass('disabled');
                            History.back();
                         }
                    }
                });
         })
    });
});
/**
 *@overfileView 找驴友入口文件
 *author Yoocky <mengyanzhou@gmail.com>
 */
requirejs.config({
	baseUrl : '/Public/mobile/',
	waitSeconds: 10
});

require(
    [
        'src/js/core', 
         'entry/tourpal/js/tourpal', 
         'src/js/common', 
         'entry/tourpal/js/route', 
         'entry/tourpal/js/hotcity', 
         'entry/tourpal/js/postlist', 
         'entry/tourpal/js/mypost', 
         'entry/tourpal/js/post', 
         'entry/tourpal/js/joylist', 
         'entry/tourpal/js/mycard',
         'entry/tourpal/js/card', 
         'entry/tourpal/js/message', 
         'entry/tourpal/js/myjoy',
         'entry/tourpal/js/feedback',
         'entry/tourpal/js/postdetail',
         'entry/tourpal/js/setting'
    ], function(core, tourpal) {
    
    core.init(); //立刻onrender 当前页面

    //通用url跳转
    $(document).on("click", "[data-rel=link]", function(e){
        var url = $(this).attr("href");
        var page = $(this).parents(".page");
        var id = page.attr("data-blend-id");
        var layerid = core.router.getidFromUrl(url);

        if($(this).attr('needlogin')){
            if(!tourpal.isLogin()){
                var dest = location.href + '/../' + url;
                tourpal.login(dest);
                return false;
            }
        } 
        core.addPager({
            id:layerid,
            url: url,
            active:true
        });
        
        return false;
    });
    
    //轮训获取新消息
    setInterval(function(){
        tourpal.getMessage();
    }, 300000)

    //menu 浮层隐藏展示
    $(document).on("click", ".icon-more", function(){
        var $layer = $(core.getActiveLayer());
        $popover = $layer.find('.popover');
        $popover.toggleClass('active');
        $popover.on('click', 'li', function(){
            $popover.removeClass('active');
        })
    });
    
    //设置微信UA
    if(navigator.userAgent.indexOf('MicroMessenger') > -1){
        $('html').addClass('weixin');
    }
});

define("entry/tourpal/main", function(){});

}());