import { is, min } from '@iarkaroy/utils';

const reserved = ['targets', 'duration', 'easing', 'update', 'complete', 'delay'];
const defaults = {
    targets: null,
    duration: 1000,
    delay: 0,
    easing: 'linear',
    update: null,
    complete: null
};

const easing = {
    linear: t => t,
    quadIn: t => t * t,
    quadOut: t => t * (2 - t),
    quadInOut: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    cubicIn: t => t * t * t,
    cubicOut: t => --t * t * t + 1,
    cubicInOut: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
    quartIn: t => t * t * t * t,
    quartOut: t => 1 - --t * t * t * t,
    quartInOut: t => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t,
    quintIn: t => t * t * t * t * t,
    quintOut: t => 1 + --t * t * t * t * t,
    quintInOut: t => t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t,
    backIn: (t, m = 1.70158) => {
        return t * t * ((m + 1) * t - m)
    },
    backOut: (t, m = 1.70158) => {
        const scaledTime = (t / 1) - 1;
        return (
            scaledTime * scaledTime * ((m + 1) * scaledTime + m)
        ) + 1;
    }
};

function forEach(arr, cb) {
    var len = arr.length;
    for (var i = 0; i < len; ++i) {
        if (cb) cb(arr[i], i);
    }
}

var animations = [];

function createAnimation(params) {
    var animation = clone(params);

    animation.forward = function () {
        var seek = new Date().getTime() - this.startTime;
        var totalElapsed = null;
        forEach(this.endValues, (end, i) => {
            var elapsed = 0;
            if (seek > this.delays[i]) {
                elapsed = (seek - this.delays[i]) / this.durations[i];
            }
            if (elapsed > 1) elapsed = 1;
            this.elapsed[i] = elapsed;
            var value = easing[this.easing](elapsed);
            for (var k in end) {
                if (is.und(this.startValues[i][k])) continue;
                var s = this.startValues[i][k];
                var e = end[k];
                this.targets[i][k] = s + (e - s) * value;
            }
        });

        if (this.update) this.update();
        totalElapsed = min(this.elapsed);
        if (totalElapsed === 1) {
            this.completed = true;
            if (this.complete) this.complete();
        }
    };
    animation.setProgress = function () { };
    animation.pause = function () {
        console.log(this);
    };
    animation.resume = function () { };
    animation.reverse = function () {
        var temp = this.startValues;
        this.startValues = this.endValues;
        this.endValues = temp;
        this.completed = false;
        this.startTime = new Date().getTime();
        this.elapsed.fill(0);
        requestAnimationFrame(tick);
    };
    animation.set = function (obj) {
        for (var k in obj) {
            if (obj.hasOwnProperty(k)) {
                this[k] = obj[k];
            }
        }
        return this;
    };
    animation.seek = function (t) {

    };
    return animation;
}

function getProperties(options = {}) {
    var properties = [];
    for (var k in options) {
        if (reserved.indexOf(k) < 0) {
            properties.push(k);
        }
    }
    return properties;
}

function getStartValues(options = {}, props = []) {
    var values = [];
    forEach(options.targets, target => {
        var v = {};
        forEach(props, p => {
            v[p] = target[p];
        });
        values.push(v);
    });
    return values;
}

function getEndValues(options = {}, props = []) {
    var values = {};
    forEach(props, p => {
        values[p] = options[p];
    });
    if (!is.arr(values)) values = Array(options.targets.length).fill(values);
    return values;
}

function getDurations(options = {}) {
    if (is.fnc(options.duration)) {
        var values = [];
        forEach(options.targets, target => {
            values.push(options.duration(target));
        });
        return values;
    }
    if (is.arr(options.duration)) return options.duration;
    if (is.num(options.duration)) {
        return Array(options.targets.length).fill(options.duration);
    }
}

function getDelays(options = {}) {
    if (is.fnc(options.delay)) {
        var values = [];
        forEach(options.targets, target => {
            values.push(options.delay(target));
        });
        return values;
    }
    if (is.arr(options.delay)) return options.delay;
    if (is.num(options.delay)) {
        return Array(options.targets.length).fill(options.delay);
    }
}

function getElapsed(options) {
    return Array(options.targets.length).fill(0);
}

function animate(options = {}) {
    options = Object.assign({}, defaults, options);
    if (options.targets && !is.arr(options.targets)) options.targets = [options.targets];

    var props = getProperties(options);

    var now = new Date().getTime();

    var params = {
        targets: options.targets,
        startValues: getStartValues(options, props),
        endValues: getEndValues(options, props),
        durations: getDurations(options),
        delays: getDelays(options),
        elapsed: getElapsed(options),
        easing: options.easing,
        update: options.update,
        complete: options.complete,
        completed: false,
        startTime: now,
        lastTime: now
    };

    var animation = createAnimation(params);
    animations.push(animation)

    if (animations.length > 0) {
        requestAnimationFrame(tick);
    }

    return animation;
}

function tick() {
    forEach(animations, anim => {
        anim.forward();
    });

    var runningAnimations = animations.filter(anim => !anim.completed);
    if (runningAnimations.length > 0) requestAnimationFrame(tick);
}

function clone(obj) {
    return Object.assign({}, obj);
}

export default animate;