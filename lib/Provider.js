'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Provider = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _BehaviorSubject = require('rxjs/subject/BehaviorSubject');

var _Subject = require('rxjs/Subject');

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _PropTypes = require('./PropTypes');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Provider = exports.Provider = function (_Component) {
  _inherits(Provider, _Component);

  function Provider(props, context) {
    _classCallCheck(this, Provider);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Provider).call(this, props, context));

    _this.model = props.model;

    // updates model's cache locally
    // usefull for haveing local changes
    _this.model.setLocal = function (obj) {
      _this.model.setCache(Object.assign(_this.model.getCache(), obj));
    };

    // changes to model should be broadcasted
    // TODO do I need getVersion?
    _this.model.$ = new _BehaviorSubject.BehaviorSubject(_this.model.getVersion()); // 1 here is a initial value
    var previousOnChange = _this.model._root.onChange;
    _this.model._root.onChange = function () {
      if (previousOnChange) {
        previousOnChange();
      }
      _this.model.$.next(_this.model.getVersion());
    };

    // create intents
    _this.intents = {};
    _this.intents.get = function (name) {
      (0, _invariant2["default"])(name, 'Invalid name for the intent collection.');
      if (!_this.intents[name]) {
        _this.intents[name] = new _Subject.Subject();
      }
      return _this.intents[name];
    };
    return _this;
  }

  _createClass(Provider, [{
    key: 'getChildContext',
    value: function getChildContext() {
      var model = this.model;
      var intents = this.intents;

      return { model: model, intents: intents };
    }
  }, {
    key: 'render',
    value: function render() {
      var children = this.props.children;

      return _react.Children.only(children);
    }
  }]);

  return Provider;
}(_react.Component);

Provider.propTypes = {
  model: _PropTypes.modelType.isRequired,
  children: _react.PropTypes.element.isRequired
};
Provider.childContextTypes = {
  model: _PropTypes.modelType.isRequired,
  intents: _react.PropTypes.object.isRequired
};