import cropperTemplate from './htmlTemplate';

let CropBox = function (options) {
    this.options = Object.assign({}, this.defaultConfig, options);
    this.init()
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
    cropperTemplate,
    init: function () {
        this.initStyle();
        this.initListener();
    },
    initListener: function () {
        this.listenCropper();
        this.listenCropperItem();
    },
    listenCropper: function () {
        let startX = 0;
        let startY = 0;
        let startLeft = 0;
        let startTop = 0;

        this.cropper.addEventListener('mousedown', (e) => {
            startX = e.clientX;
            startY = e.clientY;
            startLeft = this.left;
            startTop = this.top;
            this.updateWrapData();

            let cropMove = (e) => {
                let x = e.clientX;
                let y = e.clientY;
                this.move(startX - x, startY - y);
                startX = x;
                startY = y;
                e.preventDefault();
            };

            let mouseUp = () => {
                document.body.removeEventListener('mousemove', cropMove);
                document.body.removeEventListener('mouseup', mouseUp)
            };

            document.body.addEventListener('mousemove', cropMove);
            document.body.addEventListener('mouseup', mouseUp);
        });
    },
    listenCropperItem: function () {
        let startX = 0;
        let startY = 0;
        let startLeft = 0;
        let startTop = 0;
        Array.from(this.cropper.querySelectorAll('.square')).forEach((item) => {
            item.addEventListener('mousedown', (e) => {
                e.stopPropagation();
                startX = e.clientX;
                startY = e.clientY;
                startLeft = this.left;
                startTop = this.top;
                this.updateWrapData();

                let mouseMove = (e) => {
                    cropUpdate(e, item.dataset)
                    e.preventDefault();
                };

                let mouseUp = () => {
                    document.body.removeEventListener('mousemove', mouseMove)
                    document.body.removeEventListener('mouseup', mouseUp)
                };

                document.body.addEventListener('mousemove', mouseMove);
                document.body.addEventListener('mouseup', mouseUp);
            });
        });

        let cropUpdate = (e, data) => {
            let x = e.clientX;
            let y = e.clientY;
            let offsetX = x - startX;
            let offsetY = y - startY;
            if (data.left) {
                this.setLeft(this.left + offsetX);
            }
            if (data.top) {
                this.setTop(this.top + offsetY);
            }
            if (data.width) {
                this.setWidth(this.width + offsetX)
            }
            if (data.height) {
                this.setHeight(this.height + offsetY)
            }
            this.updateCropperPosition();
            startX = x;
            startY = y;
        };
    },
    initStyle: function () {
        this.initWrap();
        this.initCropperStyle();
    },
    initWrap: function () {
        this.elem = this.options.elem;

        let wrap = this.wrap =  document.createElement('div');
        wrap.className = 'cropper-wrap';
        wrap.innerHTML = this.cropperTemplate;
        this.cropper = wrap.querySelector('.cropper');
        if (this.options.hide) {
            this.hide();
        }
        this.elem.appendChild(wrap);
    },
    initCropperStyle: function () {
        this.updateWrapData();
        let width = Math.min(this.wrapWidth, this.wrapHeight) / 4;

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
    hide: function () {
        this.wrap.classList.add('hide');
        this.hidden = true;
    },
    show: function () {
        this.hidden = false;
        this.wrap.classList.remove('hide')
    },
    updateWrapData: function () {
        this.wrapWidth = this.elem.clientWidth;
        this.wrapHeight = this.elem.clientHeight;
    },
    updateCropperPosition: function () {
        this.cropper.style.cssText = `
            left: ${this.left}px;
            width: ${this.width}px;
            top: ${this.top}px;
            height: ${this.height}px;
            `;
    },
    move: function (x, y) {
        this.setLeft(this.left - x, false);
        this.setTop(this.top - y, false);
        this.updateCropperPosition();
    },

    setLeft: function (left, fixed = true, update = false) {
        let max = fixed ? (this.left + this.width - this.options.minWidth) : (this.wrapWidth - this.width);
        let prevLeft = this.left;
        this.left = Math.max(Math.min(max, left), 0);
        if (fixed) {
            this.setWidth(this.width + (prevLeft - this.left))
        }

        if (update) {
            this.updateCropperPosition()
        }
    },

    setTop: function (top, fixed = true, update = false) {
        let max = fixed ? (this.top + this.height - this.options.minHeight) : (this.wrapHeight - this.height);
        let prevTop = this.top;
        this.top = Math.max(Math.min(max, top), 0);
        if (fixed) {
            this.setHeight(this.height + (prevTop - this.top));
        }
        if (update) {
            this.updateCropperPosition()
        }
    },

    setWidth: function (width, update = false, byHeight = false) {
        let _width = Math.max(this.options.minWidth, Math.min(width, this.getMaxWidth()));
        if (this.options.ratio && !byHeight) {
            let height = _width / this.options.ratio;
            let maxHeight = this.getMaxHeight();
            if (height > maxHeight) {
                height = maxHeight;
                _width = height * this.options.ratio;
            }
            this.setHeight(height, false, true);
        }
        this.width = _width;
        if (update) {
            this.updateCropperPosition()
        }
    },

    getMaxWidth: function () {
        return this.wrapWidth - this.left;
    },

    setHeight: function (height, update = false, byWidth = false) {
        let _height = Math.max(this.options.minHeight, Math.min(height, this.getMaxHeight()));
        if (this.options.ratio && !byWidth) {
            let width = _height * this.options.ratio;
            let maxWidth = this.getMaxWidth();
            if (width > maxWidth) {
                width = maxWidth;
                _height = width / this.options.ratio;
            }
            this.setWidth(width, false, true);
        }
        this.height = _height;
        if (update) {
            this.updateCropperPosition()
        }
    },

    getMaxHeight: function () {
        return this.wrapHeight - this.top;
    },

    getData: function () {
        return {
            left: this.left,
            top: this.top,
            width: this.width,
            height: this.height
        }
    }
};

export default CropBox;