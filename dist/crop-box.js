(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.CropBox = factory());
}(this, function () { 'use strict';

  var html = "\n  <div class=\"cropper\">\n            <div class=\"square s-lt\" data-left=\"1\" data-top=\"1\"></div>\n            <div class=\"square s-t\" data-top=\"1\"></div>\n            <div class=\"square s-rt\" data-width=\"1\" data-top=\"1\"></div>\n            <div class=\"square s-l\" data-left=\"1\"></div>\n            <div class=\"square s-r\" data-width=\"1\"></div>\n            <div class=\"square s-lb\" data-left=\"1\" data-height=\"1\"></div>\n            <div class=\"square s-rb\" data-width=\"1\" data-height=\"1\"></div>\n            <div class=\"square s-b\" data-height=\"1\"></div>\n        </div>\n";

  var CropBox = function CropBox(options) {
    this.options = Object.assign({}, this.defaultConfig, options);
    this.init();
  };

  CropBox.prototype = {
    constructor: CropBox,
    hidden: false,
    defaultConfig: {
      minWidth: 5,
      minHeight: 5,
      // 固定比例 width / height
      ratio: null
    },
    cropperTemplate: html,
    init: function init() {
      this.initStyle();
      this.initListener();
    },
    initListener: function initListener() {
      this.listenCropper();
      this.listenCropperItem();
    },
    listenCropper: function listenCropper() {
      var _this = this;

      var startX = 0;
      var startY = 0;
      var startLeft = 0;
      var startTop = 0;
      this.cropper.addEventListener('mousedown', function (e) {
        startX = e.clientX;
        startY = e.clientY;
        startLeft = _this.left;
        startTop = _this.top;

        _this.updateWrapData();

        var cropMove = function cropMove(e) {
          var x = e.clientX;
          var y = e.clientY;

          _this.move(startX - x, startY - y);

          startX = x;
          startY = y;
          e.preventDefault();
        };

        var mouseUp = function mouseUp() {
          document.body.removeEventListener('mousemove', cropMove);
          document.body.removeEventListener('mouseup', mouseUp);
        };

        document.body.addEventListener('mousemove', cropMove);
        document.body.addEventListener('mouseup', mouseUp);
      });
    },
    listenCropperItem: function listenCropperItem() {
      var _this2 = this;

      var startX = 0;
      var startY = 0;
      var startLeft = 0;
      var startTop = 0;
      Array.from(this.cropper.querySelectorAll('.square')).forEach(function (item) {
        item.addEventListener('mousedown', function (e) {
          e.stopPropagation();
          startX = e.clientX;
          startY = e.clientY;
          startLeft = _this2.left;
          startTop = _this2.top;

          _this2.updateWrapData();

          var mouseMove = function mouseMove(e) {
            cropUpdate(e, item.dataset);
            e.preventDefault();
          };

          var mouseUp = function mouseUp() {
            document.body.removeEventListener('mousemove', mouseMove);
            document.body.removeEventListener('mouseup', mouseUp);
          };

          document.body.addEventListener('mousemove', mouseMove);
          document.body.addEventListener('mouseup', mouseUp);
        });
      });

      var cropUpdate = function cropUpdate(e, data) {
        var x = e.clientX;
        var y = e.clientY;
        var offsetX = x - startX;
        var offsetY = y - startY;

        if (data.left) {
          _this2.setLeft(_this2.left + offsetX);
        }

        if (data.top) {
          _this2.setTop(_this2.top + offsetY);
        }

        if (data.width) {
          _this2.setWidth(_this2.width + offsetX);
        }

        if (data.height) {
          _this2.setHeight(_this2.height + offsetY);
        }

        _this2.updateCropperPosition();

        startX = x;
        startY = y;
      };
    },
    initStyle: function initStyle() {
      this.initWrap();
      this.initCropperStyle();
    },
    initWrap: function initWrap() {
      this.elem = this.options.elem;
      var wrap = this.wrap = document.createElement('div');
      wrap.className = 'cropper-wrap';
      wrap.innerHTML = this.cropperTemplate;
      this.cropper = wrap.querySelector('.cropper');

      if (this.options.hide) {
        this.hide();
      }

      this.elem.appendChild(wrap);
    },
    initCropperStyle: function initCropperStyle() {
      this.updateWrapData();
      var width = Math.min(this.wrapWidth, this.wrapHeight) / 4;
      this.left = ~~((this.wrapWidth - width) / 2);
      this.top = ~~((this.wrapHeight - width) / 2);
      this.width = width;

      if (this.options.ratio) {
        this.height = this.width / this.options.ratio;
      } else {
        this.height = width;
      }

      this.updateCropperPosition();
    },
    hide: function hide() {
      this.wrap.classList.add('hide');
      this.hidden = true;
    },
    show: function show() {
      this.hidden = false;
      this.wrap.classList.remove('hide');
    },
    updateWrapData: function updateWrapData() {
      this.wrapWidth = this.elem.clientWidth;
      this.wrapHeight = this.elem.clientHeight;
    },
    updateCropperPosition: function updateCropperPosition() {
      this.cropper.style.cssText = "\n            left: " + this.left + "px;\n            width: " + this.width + "px;\n            top: " + this.top + "px;\n            height: " + this.height + "px;\n            ";
    },
    move: function move(x, y) {
      this.setLeft(this.left - x, false);
      this.setTop(this.top - y, false);
      this.updateCropperPosition();
    },
    setLeft: function setLeft(left, fixed, update) {
      if (fixed === void 0) {
        fixed = true;
      }

      if (update === void 0) {
        update = false;
      }

      var max = fixed ? this.left + this.width - this.options.minWidth : this.wrapWidth - this.width;
      var prevLeft = this.left;
      this.left = Math.max(Math.min(max, left), 0);

      if (fixed) {
        this.setWidth(this.width + (prevLeft - this.left));
      }

      if (update) {
        this.updateCropperPosition();
      }
    },
    setTop: function setTop(top, fixed, update) {
      if (fixed === void 0) {
        fixed = true;
      }

      if (update === void 0) {
        update = false;
      }

      var max = fixed ? this.top + this.height - this.options.minHeight : this.wrapHeight - this.height;
      var prevTop = this.top;
      this.top = Math.max(Math.min(max, top), 0);

      if (fixed) {
        this.setHeight(this.height + (prevTop - this.top));
      }

      if (update) {
        this.updateCropperPosition();
      }
    },
    setWidth: function setWidth(width, update, byHeight) {
      if (update === void 0) {
        update = false;
      }

      if (byHeight === void 0) {
        byHeight = false;
      }

      var _width = Math.max(this.options.minWidth, Math.min(width, this.getMaxWidth()));

      if (this.options.ratio && !byHeight) {
        var height = _width / this.options.ratio;
        var maxHeight = this.getMaxHeight();

        if (height > maxHeight) {
          height = maxHeight;
          _width = height * this.options.ratio;
        }

        this.setHeight(height, false, true);
      }

      this.width = _width;

      if (update) {
        this.updateCropperPosition();
      }
    },
    getMaxWidth: function getMaxWidth() {
      return this.wrapWidth - this.left;
    },
    setHeight: function setHeight(height, update, byWidth) {
      if (update === void 0) {
        update = false;
      }

      if (byWidth === void 0) {
        byWidth = false;
      }

      var _height = Math.max(this.options.minHeight, Math.min(height, this.getMaxHeight()));

      if (this.options.ratio && !byWidth) {
        var width = _height * this.options.ratio;
        var maxWidth = this.getMaxWidth();

        if (width > maxWidth) {
          width = maxWidth;
          _height = width / this.options.ratio;
        }

        this.setWidth(width, false, true);
      }

      this.height = _height;

      if (update) {
        this.updateCropperPosition();
      }
    },
    getMaxHeight: function getMaxHeight() {
      return this.wrapHeight - this.top;
    },
    getData: function getData() {
      return {
        left: this.left,
        top: this.top,
        width: this.width,
        height: this.height
      };
    }
  };

  return CropBox;

}));
