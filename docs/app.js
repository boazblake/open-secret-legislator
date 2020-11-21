(function() {
  'use strict';

  var globals = typeof global === 'undefined' ? self : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = {}.hasOwnProperty;

  var expRe = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (expRe.test(name) ? root + '/' + name : name).split('/');
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var hot = hmr && hmr.createHot(name);
    var module = {id: name, exports: {}, hot: hot};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var expandAlias = function(name) {
    var val = aliases[name];
    return (val && name !== val) ? expandAlias(val) : name;
  };

  var _resolve = function(name, dep) {
    return expandAlias(expand(dirname(name), dep));
  };

  var require = function(name, loaderPath) {
    if (loaderPath == null) loaderPath = '/';
    var path = expandAlias(name);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    throw new Error("Cannot find module '" + name + "' from '" + loaderPath + "'");
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  var extRe = /\.[^.\/]+$/;
  var indexRe = /\/index(\.[^\/]+)?$/;
  var addExtensions = function(bundle) {
    if (extRe.test(bundle)) {
      var alias = bundle.replace(extRe, '');
      if (!has.call(aliases, alias) || aliases[alias].replace(extRe, '') === alias + '/index') {
        aliases[alias] = bundle;
      }
    }

    if (indexRe.test(bundle)) {
      var iAlias = bundle.replace(indexRe, '');
      if (!has.call(aliases, iAlias)) {
        aliases[iAlias] = bundle;
      }
    }
  };

  require.register = require.define = function(bundle, fn) {
    if (bundle && typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          require.register(key, bundle[key]);
        }
      }
    } else {
      modules[bundle] = fn;
      delete cache[bundle];
      addExtensions(bundle);
    }
  };

  require.list = function() {
    var list = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        list.push(item);
      }
    }
    return list;
  };

  var hmr = globals._hmr && new globals._hmr(_resolve, require, modules, cache);
  require._cache = cache;
  require.hmr = hmr && hmr.wrap;
  require.brunch = true;
  globals.require = require;
})();

(function() {
var global = typeof window === 'undefined' ? this : window;
var process;
var __makeRelativeRequire = function(require, mappings, pref) {
  var none = {};
  var tryReq = function(name, pref) {
    var val;
    try {
      val = require(pref + '/node_modules/' + name);
      return val;
    } catch (e) {
      if (e.toString().indexOf('Cannot find module') === -1) {
        throw e;
      }

      if (pref.indexOf('node_modules') !== -1) {
        var s = pref.split('/');
        var i = s.lastIndexOf('node_modules');
        var newPref = s.slice(0, i).join('/');
        return tryReq(name, newPref);
      }
    }
    return none;
  };
  return function(name) {
    if (name in mappings) name = mappings[name];
    if (!name) return;
    if (name[0] !== '.' && pref) {
      var val = tryReq(name, pref);
      if (val !== none) return val;
    }
    return require(name);
  }
};
require.register("app.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _mithril = _interopRequireDefault(require("mithril"));

var _model = require("./model.js");

var _isLoading = _interopRequireDefault(require("./is-loading"));

var _ramda = require("ramda");

var _data = _interopRequireDefault(require("data.task"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var log = function log(m) {
  return function (v) {
    console.log(m, v);
    return v;
  };
};

var getLegislators = function getLegislators(mdl) {
  return function (state) {
    return mdl.HTTP((0, _model.legislatorsUrl)(state));
  };
};

var getMembers = function getMembers(mdl) {
  return function (cid) {
    return mdl.HTTP((0, _model.membersUrl)(cid)(mdl.data.year()));
  };
};

var saveLegislators = function saveLegislators(mdl) {
  return function (legislators) {
    mdl.data.legislators = legislators;
    return legislators;
  };
};

var loadLegislatorsData = function loadLegislatorsData(mdl) {
  return (0, _ramda.traverse)(_data["default"].of, getLegislators(mdl), mdl.states).map((0, _ramda.map)((0, _ramda.path)(['response', 'legislator']))).map(_ramda.flatten).map((0, _ramda.pluck)('@attributes')).map(saveLegislators(mdl));
};

var loadMemberProfile = function loadMemberProfile(mdl) {
  return function (legislators) {
    return (0, _ramda.traverse)(_data["default"].of, getMembers(mdl), (0, _ramda.pluck)('cid', legislators)).map((0, _ramda.map)((0, _ramda.path)(['response', 'member_profile']))).map(_ramda.flatten).map((0, _ramda.pluck)('@attributes'));
  };
};

var loadData = function loadData(mdl) {
  return function (state) {
    state.status = 'loading';

    var onSuccess = function onSuccess(members) {
      mdl.data.legislators.map(function (leg) {
        leg.data = (0, _ramda.head)(members.filter((0, _ramda.propEq)('member_id', leg.cid)));
      });
      state.status = 'loaded';
    };

    var onError = function onError(err) {
      console.error(err);
      state.status = 'failed';
    };

    loadLegislatorsData(mdl).chain(loadMemberProfile(mdl)).fork(onError, onSuccess);
  };
};

var PlotFinances = function PlotFinances() {
  return {
    oncreate: function oncreate(_ref) {
      var dom = _ref.dom,
          mdl = _ref.attrs.mdl;
      var data = {
        type: 'bar',
        x: mdl.data.legislators.map(function (l) {
          return l.firstlast;
        }),
        y: mdl.data.legislators.map(function (l) {
          return l.data.net_high;
        })
      };
      console.log('data', data);
      return mdl.data.legislators && Plotly.newPlot('chart', [data]);
    },
    view: function view(_ref2) {
      var mdl = _ref2.attrs.mdl;
      return (0, _mithril["default"])('.', {
        id: 'chart',
        style: {
          width: '100vw',
          height: '600px'
        }
      });
    }
  };
};

var Legislators = function Legislators(mdl) {
  var state = {
    status: 'loading'
  };
  return {
    oninit: function oninit() {
      return loadData(mdl)(state);
    },
    view: function view() {
      return (0, _mithril["default"])('.', state.status == 'loading' && _isLoading["default"], state.status == 'failed' && 'FAILED', state.status == 'loaded' && [(0, _mithril["default"])(PlotFinances, {
        mdl: mdl
      }), (0, _mithril["default"])('input[type="range"]', {
        min: 2008,
        max: 2016,
        step: 1,
        value: mdl.data.year(),
        onchange: function onchange(e) {
          mdl.data.year(e.target.value);
          loadData(mdl)(state);
        }
      }), (0, _mithril["default"])('h1', mdl.data.year())]);
    }
  };
};

var _default = Legislators;
exports["default"] = _default;
});

;require.register("index.js", function(exports, require, module) {
"use strict";

var _app = _interopRequireDefault(require("./app.js"));

var _model = _interopRequireDefault(require("./model.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var root = document.body;
var winW = window.innerWidth;

if (module.hot) {
  module.hot.accept();
}

if ('development' !== "production") {
  console.log("Looks like we are in development mode!");
} else {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("./service-worker.js").then(function (registration) {
        console.log("⚙️ SW registered: ", registration);
      })["catch"](function (registrationError) {
        console.log("🧟 SW registration failed: ", registrationError);
      });
    });
  }
} // set display profiles


var getProfile = function getProfile(w) {
  if (w < 668) return "phone";
  if (w < 920) return "tablet";
  return "desktop";
};

var checkWidth = function checkWidth(winW) {
  var w = window.innerWidth;

  if (winW !== w) {
    winW = w;
    var lastProfile = _model["default"].settings.profile;
    _model["default"].settings.profile = getProfile(w);
    if (lastProfile != _model["default"].settings.profile) m.redraw();
  }

  return requestAnimationFrame(checkWidth);
};

_model["default"].settings.profile = getProfile(winW);
checkWidth(winW);
m.mount(root, (0, _app["default"])(_model["default"]));
});

;require.register("initialize.js", function(exports, require, module) {
"use strict";

document.addEventListener("DOMContentLoaded", function () {
  require("./index.js");
});
});

;require.register("is-loading.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var IsLoading = m("svg[xmlns='http://www.w3.org/2000/svg'][xmlns:xlink='http://www.w3.org/1999/xlink'][width='200px'][height='200px'][viewBox='0 0 100 100'][preserveAspectRatio='xMidYMid']", {
  style: {
    margin: "auto",
    background: "rgb(241, 242, 243)",
    display: "block",
    "shape-rendering": "auto"
  }
}, m("path[d='M10 50A40 40 0 0 0 90 50A40 42 0 0 1 10 50'][fill='#85a2b6'][stroke='none'][transform='rotate(17.5738 50 51)']", m("animateTransform[attributeName='transform'][type='rotate'][dur='1s'][repeatCount='indefinite'][keyTimes='0;1'][values='0 50 51;360 50 51']")));
var _default = IsLoading;
exports["default"] = _default;
});

;require.register("model.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.membersUrl = exports.legislatorsUrl = void 0;

var _data = _interopRequireDefault(require("data.task"));

var _mithril = _interopRequireDefault(require("mithril"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var api = '4fbc39be8c00b4af07a6f182c64d5c1a';
var baseUrl = 'http://www.opensecrets.org/api/?method=';
var apiKey = "&output=json&apikey=".concat(api);

var legislatorUrl = function legislatorUrl(state) {
  return "getLegislators&id=".concat(state);
};

var memberUrl = function memberUrl(cid) {
  return function (year) {
    return "memPFDprofile&year=".concat(year, "&cid=").concat(cid);
  };
};

var HTTP = function HTTP(url) {
  return new _data["default"](function (rej, res) {
    return _mithril["default"].request(url).then(res, rej);
  });
};

var legislatorsUrl = function legislatorsUrl(state) {
  return "".concat(baseUrl).concat(legislatorUrl(state)).concat(apiKey);
};

exports.legislatorsUrl = legislatorsUrl;

var membersUrl = function membersUrl(cid) {
  return function (year) {
    return "".concat(baseUrl).concat(memberUrl(cid)(year)).concat(apiKey);
  };
};

exports.membersUrl = membersUrl;
var states = ['AL', 'MT', 'AK', 'NE', 'AZ', 'NV', 'AR', 'NH', 'CA', 'NJ', 'CO', 'NM', 'CT', 'NY', 'DE', 'NC', 'FL', 'ND', 'GA', 'OH', 'HI', 'OK', 'ID', 'OR', 'IL', 'PA', 'IN', 'RI', 'IA', 'SC', 'KS', 'SD', 'KY', 'TN', 'LA', 'TX', 'ME', 'UT', 'MD', 'VT', 'MA', 'VA', 'MI', 'WA', 'MN', 'WV', 'MS', 'WI', 'MO', 'WY'];
var model = {
  HTTP: HTTP,
  states: states,
  data: {
    legislators: null,
    details: null,
    year: Stream(2016)
  },
  err: null,
  state: null,
  settings: {}
};
var _default = model;
exports["default"] = _default;
});

;require.alias("process/browser.js", "process");process = require('process');require.register("___globals___", function(exports, require, module) {
  

// Auto-loaded modules from config.npm.globals.
window.m = require("mithril");
window.Stream = require("mithril-stream");


});})();require('___globals___');


//# sourceMappingURL=app.js.map