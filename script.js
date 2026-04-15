
(function() {
                var on = addEventListener,
                    off = removeEventListener,
                    $ = function(q) {
                        return document.querySelector(q)
                    },
                    $$ = function(q) {
                        return document.querySelectorAll(q)
                    },
                    $body = document.body,
                    $inner = $('.inner'),
                    client = (function() {
                        var o = {
                                browser: 'other',
                                browserVersion: 0,
                                os: 'other',
                                osVersion: 0,
                                mobile: false,
                                canUse: null,
                                flags: {
                                    lsdUnits: false,
                                },
                            },
                            ua = navigator.userAgent,
                            a, i;
                        a = [
                            ['firefox', /Firefox\/([0-9\.]+)/],
                            ['edge', /Edge\/([0-9\.]+)/],
                            ['safari', /Version\/([0-9\.]+).+Safari/],
                            ['chrome', /Chrome\/([0-9\.]+)/],
                            ['chrome', /CriOS\/([0-9\.]+)/],
                            ['ie', /Trident\/.+rv:([0-9]+)/]
                        ];
                        for (i = 0; i < a.length; i++) {
                            if (ua.match(a[i][1])) {
                                o.browser = a[i][0];
                                o.browserVersion = parseFloat(RegExp.$1);
                                break;
                            }
                        }
                        a = [
                            ['ios', /([0-9_]+) like Mac OS X/, function(v) {
                                return v.replace('_', '.').replace('_', '');
                            }],
                            ['ios', /CPU like Mac OS X/, function(v) {
                                return 0
                            }],
                            ['ios', /iPad; CPU/, function(v) {
                                return 0
                            }],
                            ['android', /Android ([0-9\.]+)/, null],
                            ['mac', /Macintosh.+Mac OS X ([0-9_]+)/, function(v) {
                                return v.replace('_', '.').replace('_', '');
                            }],
                            ['windows', /Windows NT ([0-9\.]+)/, null],
                            ['undefined', /Undefined/, null]
                        ];
                        for (i = 0; i < a.length; i++) {
                            if (ua.match(a[i][1])) {
                                o.os = a[i][0];
                                o.osVersion = parseFloat(a[i][2] ? (a[i][2])(RegExp.$1) : RegExp.$1);
                                break;
                            }
                        }
                        if (o.os == 'mac' && ('ontouchstart' in window) && ((screen.width == 1024 && screen.height == 1366) || (screen.width == 834 && screen.height == 1112) || (screen.width == 810 && screen.height == 1080) || (screen.width == 768 && screen.height == 1024))) o.os = 'ios';
                        o.mobile = (o.os == 'android' || o.os == 'ios');
                        var _canUse = document.createElement('div');
                        o.canUse = function(property, value) {
                            var style;
                            style = _canUse.style;
                            if (!(property in style)) return false;
                            if (typeof value !== 'undefined') {
                                style[property] = value;
                                if (style[property] == '') return false;
                            }
                            return true;
                        };
                        o.flags.lsdUnits = o.canUse('width', '100dvw');
                        return o;
                    }()),
                    trigger = function(t) {
                        dispatchEvent(new Event(t));
                    },
                    cssRules = function(selectorText) {
                        var ss = document.styleSheets,
                            a = [],
                            f = function(s) {
                                var r = s.cssRules,
                                    i;
                                for (i = 0; i < r.length; i++) {
                                    if (r[i] instanceof CSSMediaRule && matchMedia(r[i].conditionText).matches)(f)(r[i]);
                                    else if (r[i] instanceof CSSStyleRule && r[i].selectorText == selectorText) a.push(r[i]);
                                }
                            },
                            x, i;
                        for (i = 0; i < ss.length; i++) f(ss[i]);
                        return a;
                    },
                    thisHash = function() {
                        var h = location.hash ? location.hash.substring(1) : null,
                            a;
                        if (!h) return null;
                        if (h.match(/\?/)) {
                            a = h.split('?');
                            h = a[0];
                            history.replaceState(undefined, undefined, '#' + h);
                            window.location.search = a[1];
                        }
                        if (h.length > 0 && !h.match(/^[a-zA-Z]/)) h = 'x' + h;
                        if (typeof h == 'string') h = h.toLowerCase();
                        return h;
                    },
                    scrollToElement = function(e, style, duration) {
                        var y, cy, dy, start, easing, offset, f;
                        if (!e) y = 0;
                        else {
                            offset = (e.dataset.scrollOffset ? parseInt(e.dataset.scrollOffset) : 0) * parseFloat(getComputedStyle(document.documentElement).fontSize);
                            switch (e.dataset.scrollBehavior ? e.dataset.scrollBehavior : 'default') {
                                case 'default':
                                default:
                                    y = e.offsetTop + offset;
                                    break;
                                case 'center':
                                    if (e.offsetHeight < window.innerHeight) y = e.offsetTop - ((window.innerHeight - e.offsetHeight) / 2) + offset;
                                    else y = e.offsetTop - offset;
                                    break;
                                case 'previous':
                                    if (e.previousElementSibling) y = e.previousElementSibling.offsetTop + e.previousElementSibling.offsetHeight + offset;
                                    else y = e.offsetTop + offset;
                                    break;
                            }
                        }
                        if (!style) style = 'smooth';
                        if (!duration) duration = 750;
                        if (style == 'instant') {
                            window.scrollTo(0, y);
                            return;
                        }
                        start = Date.now();
                        cy = window.scrollY;
                        dy = y - cy;
                        switch (style) {
                            case 'linear':
                                easing = function(t) {
                                    return t
                                };
                                break;
                            case 'smooth':
                                easing = function(t) {
                                    return t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
                                };
                                break;
                        }
                        f = function() {
                            var t = Date.now() - start;
                            if (t >= duration) window.scroll(0, y);
                            else {
                                window.scroll(0, cy + (dy * easing(t / duration)));
                                requestAnimationFrame(f);
                            }
                        };
                        f();
                    },
                    scrollToTop = function() {
                        scrollToElement(null);
                    },
                    loadElements = function(parent) {
                        var a, e, x, i;
                        a = parent.querySelectorAll('iframe[data-src]:not([data-src=""])');
                        for (i = 0; i < a.length; i++) {
                            a[i].contentWindow.location.replace(a[i].dataset.src);
                            a[i].dataset.initialSrc = a[i].dataset.src;
                            a[i].dataset.src = '';
                        }
                        a = parent.querySelectorAll('video[autoplay]');
                        for (i = 0; i < a.length; i++) {
                            if (a[i].paused) a[i].play();
                        }
                        e = parent.querySelector('[data-autofocus="1"]');
                        x = e ? e.tagName : null;
                        switch (x) {
                            case 'FORM':
                                e = e.querySelector('.field input, .field select, .field textarea');
                                if (e) e.focus();
                                break;
                            default:
                                break;
                        }
                        a = parent.querySelectorAll('deferred-script');
                        for (i = 0; i < a.length; i++) {
                            x = document.createElement('script');
                            x.setAttribute('data-deferred', '');
                            if (a[i].getAttribute('src')) x.setAttribute('src', a[i].getAttribute('src'));
                            if (a[i].textContent) x.textContent = a[i].textContent;
                            a[i].replaceWith(x);
                        }
                    },
                    unloadElements = function(parent) {
                        var a, e, x, i;
                        a = parent.querySelectorAll('iframe[data-src=""]');
                        for (i = 0; i < a.length; i++) {
                            if (a[i].dataset.srcUnload === '0') continue;
                            if ('initialSrc' in a[i].dataset) a[i].dataset.src = a[i].dataset.initialSrc;
                            else a[i].dataset.src = a[i].src;
                            a[i].contentWindow.location.replace('about:blank');
                        }
                        a = parent.querySelectorAll('video');
                        for (i = 0; i < a.length; i++) {
                            if (!a[i].paused) a[i].pause();
                        }
                        e = $(':focus');
                        if (e) e.blur();
                    };
                window._scrollToTop = scrollToTop;
                var thisUrl = function() {
                    return window.location.href.replace(window.location.search, '').replace(/#$/, '');
                };
                var getVar = function(name) {
                    var a = window.location.search.substring(1).split('&'),
                        b, k;
                    for (k in a) {
                        b = a[k].split('=');
                        if (b[0] == name) return b[1];
                    }
                    return null;
                };
                var errors = {
                    handle: function(handler) {
                        window.onerror = function(message, url, line, column, error) {
                            (handler)(error.message);
                            return true;
                        };
                    },
                    unhandle: function() {
                        window.onerror = null;
                    }
                };
                var loadHandler = function() {
                    setTimeout(function() {
                        $body.classList.remove('is-loading');
                        $body.classList.add('is-playing');
                        setTimeout(function() {
                            $body.classList.remove('is-playing');
                            $body.classList.add('is-ready');
                        }, 2750);
                    }, 100);
                };
                on('load', loadHandler);
                loadElements(document.body);
                var style, sheet, rule;
                style = document.createElement('style');
                style.appendChild(document.createTextNode(''));
                document.head.appendChild(style);
                sheet = style.sheet;
                if (client.mobile) {
                    (function() {
                        if (client.flags.lsdUnits) {
                            document.documentElement.style.setProperty('--viewport-height', '100svh');
                            document.documentElement.style.setProperty('--background-height', '100lvh');
                        } else {
                            var f = function() {
                                document.documentElement.style.setProperty('--viewport-height', window.innerHeight + 'px');
                                document.documentElement.style.setProperty('--background-height', (window.innerHeight + 250) + 'px');
                            };
                            on('load', f);
                            on('orientationchange', function() {
                                setTimeout(function() {
                                    (f)();
                                }, 100);
                            });
                        }
                    })();
                }
                if (client.os == 'android') {
                    (function() {
                        sheet.insertRule('body::after { }', 0);
                        rule = sheet.cssRules[0];
                        var f = function() {
                            rule.style.cssText = 'height: ' + (Math.max(screen.width, screen.height)) + 'px';
                        };
                        on('load', f);
                        on('orientationchange', f);
                        on('touchmove', f);
                    })();
                    $body.classList.add('is-touch');
                } else if (client.os == 'ios') {
                    if (client.osVersion <= 11)(function() {
                        sheet.insertRule('body::after { }', 0);
                        rule = sheet.cssRules[0];
                        rule.style.cssText = '-webkit-transform: scale(1.0)';
                    })();
                    if (client.osVersion <= 11)(function() {
                        sheet.insertRule('body.ios-focus-fix::before { }', 0);
                        rule = sheet.cssRules[0];
                        rule.style.cssText = 'height: calc(100% + 60px)';
                        on('focus', function(event) {
                            $body.classList.add('ios-focus-fix');
                        }, true);
                        on('blur', function(event) {
                            $body.classList.remove('ios-focus-fix');
                        }, true);
                    })();
                    $body.classList.add('is-touch');
                }

                function slideshowBackground(id, settings) {
                    var _this = this;
                    if (!('images' in settings) || !('target' in settings)) return;
                    this.id = id;
                    this.wait = ('wait' in settings ? settings.wait : 0);
                    this.defer = ('defer' in settings ? settings.defer : false);
                    this.navigation = ('navigation' in settings ? settings.navigation : false);
                    this.order = ('order' in settings ? settings.order : 'default');
                    this.preserveImageAspectRatio = ('preserveImageAspectRatio' in settings ? settings.preserveImageAspectRatio : false);
                    this.transition = ('transition' in settings ? settings.transition : {
                        style: 'crossfade',
                        speed: 1000,
                        delay: 6000,
                        resume: 12000
                    });
                    this.images = settings.images;
                    this.preload = true;
                    this.locked = false;
                    this.$target = $(settings.target);
                    this.$wrapper = ('wrapper' in settings ? $(settings.wrapper) : null);
                    this.pos = 0;
                    this.lastPos = 0;
                    this.$slides = [];
                    this.img = document.createElement('img');
                    this.preloadTimeout = null;
                    this.resumeTimeout = null;
                    this.transitionInterval = null;
                    if ('CARRD_DISABLE_DEFER' in window) {
                        this.defer = false;
                        this.preload = false;
                    }
                    if (this.preserveImageAspectRatio && this.transition.style == 'crossfade') this.transition.style = 'fade';
                    if (this.transition.delay !== false) switch (this.transition.style) {
                        case 'crossfade':
                            this.transition.delay = Math.max(this.transition.delay, this.transition.speed * 2);
                            break;
                        case 'fade':
                            this.transition.delay = Math.max(this.transition.delay, this.transition.speed * 3);
                            break;
                        case 'instant':
                        default:
                            break;
                    }
                    if (!this.$wrapper || this.order == 'random') this.navigation = false;
                    if (this.defer) {
                        scrollEvents.add({
                            element: this.$target,
                            enter: function() {
                                _this.preinit();
                            }
                        });
                    } else {
                        this.preinit();
                    }
                };
                slideshowBackground.prototype.speedClassName = function(speed) {
                    switch (speed) {
                        case 1:
                            return 'slow';
                        default:
                        case 2:
                            return 'normal';
                        case 3:
                            return 'fast';
                    }
                };
                slideshowBackground.prototype.preinit = function() {
                    var _this = this;
                    if (this.preload) {
                        this.preloadTimeout = setTimeout(function() {
                            _this.$target.classList.add('is-loading');
                        }, this.transition.speed);
                        setTimeout(function() {
                            _this.init();
                        }, 0);
                    } else {
                        this.init();
                    }
                };
                slideshowBackground.prototype.init = function() {
                    var _this = this,
                        loaded = 0,
                        hasLinks = false,
                        dragStart = null,
                        dragEnd = null,
                        $slide, intervalId, i;
                    this.$target.classList.add('slideshow-background');
                    this.$target.classList.add(this.transition.style);
                    if (this.navigation) {
                        this.$next = document.createElement('div');
                        this.$next.classList.add('nav', 'next');
                        this.$next.addEventListener('click', function(event) {
                            _this.stopTransitioning();
                            _this.next();
                        });
                        this.$wrapper.appendChild(this.$next);
                        this.$previous = document.createElement('div');
                        this.$previous.classList.add('nav', 'previous');
                        this.$previous.addEventListener('click', function(event) {
                            _this.stopTransitioning();
                            _this.previous();
                        });
                        this.$wrapper.appendChild(this.$previous);
                        this.$wrapper.addEventListener('touchstart', function(event) {
                            if (event.touches.length > 1) return;
                            dragStart = {
                                x: event.touches[0].clientX,
                                y: event.touches[0].clientY
                            };
                        });
                        this.$wrapper.addEventListener('touchmove', function(event) {
                            var dx, dy;
                            if (!dragStart || event.touches.length > 1) return;
                            dragEnd = {
                                x: event.touches[0].clientX,
                                y: event.touches[0].clientY
                            };
                            dx = dragStart.x - dragEnd.x;
                            dy = dragStart.y - dragEnd.y;
                            if (Math.abs(dx) < 50) return;
                            event.preventDefault();
                            if (dx > 0) {
                                _this.stopTransitioning();
                                _this.next();
                            } else if (dx < 0) {
                                _this.stopTransitioning();
                                _this.previous();
                            }
                        });
                        this.$wrapper.addEventListener('touchend', function(event) {
                            dragStart = null;
                            dragEnd = null;
                        });
                    }
                    for (i = 0; i < this.images.length; i++) {
                        if (this.preload) {
                            this.$img = document.createElement('img');
                            this.$img.src = this.images[i].src;
                            this.$img.addEventListener('load', function(event) {
                                loaded++;
                            });
                        }
                        $slide = document.createElement('div');
                        $slide.style.backgroundImage = 'url(\'' + this.images[i].src + '\')';
                        $slide.style.backgroundPosition = this.images[i].position;
                        $slide.style.backgroundRepeat = 'no-repeat';
                        $slide.style.backgroundSize = (this.preserveImageAspectRatio ? 'contain' : 'cover');
                        $slide.setAttribute('role', 'img');
                        $slide.setAttribute('aria-label', this.images[i].caption);
                        this.$target.appendChild($slide);
                        if (this.images[i].motion != 'none') {
                            $slide.classList.add(this.images[i].motion);
                            $slide.classList.add(this.speedClassName(this.images[i].speed));
                        }
                        if ('linkUrl' in this.images[i]) {
                            $slide.style.cursor = 'pointer';
                            $slide._linkUrl = this.images[i].linkUrl;
                            hasLinks = true;
                        }
                        this.$slides.push($slide);
                    }
                    if (hasLinks) this.$target.addEventListener('click', function(event) {
                        var slide;
                        if (!('_linkUrl' in event.target)) return;
                        slide = event.target;
                        if ('onclick' in slide._linkUrl) {
                            (slide._linkUrl.onclick)(event);
                            return;
                        }
                        if ('href' in slide._linkUrl) {
                            if (slide._linkUrl.href.charAt(0) == '#') {
                                window.location.href = slide._linkUrl.href;
                                return;
                            }
                            if ('target' in slide._linkUrl && slide._linkUrl.target == '_blank') window.open(slide._linkUrl.href);
                            else window.location.href = slide._linkUrl.href;
                        }
                    });
                    switch (this.order) {
                        case 'random':
                            this.pos = (Math.ceil(Math.random() * this.$slides.length) - 1);
                            break;
                        case 'reverse':
                            this.pos = this.$slides.length - 1;
                            break;
                        case 'default':
                        default:
                            this.pos = 0;
                            break;
                    }
                    this.lastPos = this.pos;
                    if (this.preload) intervalId = setInterval(function() {
                        if (loaded >= _this.images.length) {
                            clearInterval(intervalId);
                            clearTimeout(_this.preloadTimeout);
                            _this.$target.classList.remove('is-loading');
                            _this.start();
                        }
                    }, 250);
                    else {
                        this.start();
                    }
                };
                slideshowBackground.prototype.move = function(direction) {
                    var pos, order;
                    switch (direction) {
                        case 1:
                            order = this.order;
                            break;
                        case -1:
                            switch (this.order) {
                                case 'random':
                                    order = 'random';
                                    break;
                                case 'reverse':
                                    order = 'default';
                                    break;
                                case 'default':
                                default:
                                    order = 'reverse';
                                    break;
                            }
                            break;
                        default:
                            return;
                    }
                    switch (order) {
                        case 'random':
                            for (;;) {
                                pos = (Math.ceil(Math.random() * this.$slides.length) - 1);
                                if (pos != this.pos) break;
                            }
                            break;
                        case 'reverse':
                            pos = this.pos - 1;
                            if (pos < 0) pos = this.$slides.length - 1;
                            break;
                        case 'default':
                        default:
                            pos = this.pos + 1;
                            if (pos >= this.$slides.length) pos = 0;
                            break;
                    }
                    this.show(pos);
                };
                slideshowBackground.prototype.next = function() {
                    this.move(1);
                };
                slideshowBackground.prototype.previous = function() {
                    this.move(-1);
                };
                slideshowBackground.prototype.show = function(pos) {
                    var _this = this;
                    if (this.locked) return;
                    this.lastPos = this.pos;
                    this.pos = pos;
                    switch (this.transition.style) {
                        case 'instant':
                            this.$slides[this.lastPos].classList.remove('top');
                            this.$slides[this.pos].classList.add('top');
                            this.$slides[this.pos].classList.add('visible');
                            this.$slides[this.pos].classList.add('is-playing');
                            this.$slides[this.lastPos].classList.remove('visible');
                            this.$slides[this.lastPos].classList.remove('initial');
                            this.$slides[this.lastPos].classList.remove('is-playing');
                            break;
                        case 'crossfade':
                            this.locked = true;
                            this.$slides[this.lastPos].classList.remove('top');
                            this.$slides[this.pos].classList.add('top');
                            this.$slides[this.pos].classList.add('visible');
                            this.$slides[this.pos].classList.add('is-playing');
                            setTimeout(function() {
                                _this.$slides[_this.lastPos].classList.remove('visible');
                                _this.$slides[_this.lastPos].classList.remove('initial');
                                _this.$slides[_this.lastPos].classList.remove('is-playing');
                                _this.locked = false;
                            }, this.transition.speed);
                            break;
                        case 'fade':
                            this.locked = true;
                            this.$slides[this.lastPos].classList.remove('visible');
                            setTimeout(function() {
                                _this.$slides[_this.lastPos].classList.remove('is-playing');
                                _this.$slides[_this.lastPos].classList.remove('top');
                                _this.$slides[_this.pos].classList.add('top');
                                _this.$slides[_this.pos].classList.add('is-playing');
                                _this.$slides[_this.pos].classList.add('visible');
                                _this.locked = false;
                            }, this.transition.speed);
                            break;
                        default:
                            break;
                    }
                };
                slideshowBackground.prototype.start = function() {
                    var _this = this;
                    this.$slides[_this.pos].classList.add('visible');
                    this.$slides[_this.pos].classList.add('top');
                    this.$slides[_this.pos].classList.add('initial');
                    this.$slides[_this.pos].classList.add('is-playing');
                    if (this.$slides.length == 1) return;
                    setTimeout(function() {
                        _this.startTransitioning();
                    }, this.wait);
                };
                slideshowBackground.prototype.startTransitioning = function() {
                    var _this = this;
                    if (this.transition.delay === false) return;
                    this.transitionInterval = setInterval(function() {
                        _this.next();
                    }, this.transition.delay);
                };
                slideshowBackground.prototype.stopTransitioning = function() {
                    var _this = this;
                    clearInterval(this.transitionInterval);
                    if (this.transition.resume !== false) {
                        clearTimeout(this.resumeTimeout);
                        this.resumeTimeout = setTimeout(function() {
                            _this.startTransitioning();
                        }, this.transition.resume);
                    }
                };
                (function() {
                    var $bg = document.createElement('div');
                    $bg.id = 'bg';
                    $body.insertBefore($bg, $body.firstChild);
                    new slideshowBackground('bg', {
                        target: '#bg',
                        wait: 2750,
                        order: 'default',
                        transition: {
                            style: 'crossfade',
                            speed: 2000,
                            delay: 7000,
                        },
                        images: [{
                            src: '1.jpg',
                            position: 'center',
                            motion: 'down',
                            speed: 2,
                            caption: 'Untitled',
                        }, {
                            src: '2.jpg',
                            position: 'center',
                            motion: 'right',
                            speed: 2,
                            caption: 'Untitled',
                        }, {
                            src: '3.jpg',
                            position: 'center',
                            motion: 'left',
                            speed: 2,
                            caption: 'Untitled',
                        }, ]
                    });
                })();
            })();
