import Easing from "./easing";

export default class Tween {
    /**
     * Create new tween
     * @param {object} startValue Object representing starting values
     */
    constructor(startValue) {
        this._object = {};
        this._valueStart = this.clone(startValue || {});
        this._valueEnd = this.clone(this._valueStart);
        this._duration = 1000;
        this._easingFunction = Easing.Linear;
        this._startTime = 0;
        this._delay = 0;
        this._onUpdateCallback = null;
        this._onCompleteCallback = null;
    }

    /**
     * Set ending values and duration of tween
     * @param {object} endValue Object representing ending values
     * @param {number} duration Duration of the tween
     * @returns {Tween}
     */
    to(endValue, duration) {
        this._valueEnd = this.clone(endValue || this._valueStart);
        this._duration = duration || 1000;
        return this;
    }

    /**
     * Set easing function
     * @param {Easing} easingFunction
     * @returns {Tween}
     */
    easing(easingFunction) {
        this._easingFunction = easingFunction || Easing.Linear;
        return this;
    }

    onUpdate(callback) {
        this._onUpdateCallback = callback || null;
        return this;
    }

    onComplete(callback) {
        this._onCompleteCallback = callback || null;
        return this;
    }

    start() {
        this._object = this.clone(this._valueStart);
        this._startTime = this.now();
        return this;
    }

    isStarted() {
        return this._startTime > 0;
    }

    /**
     * Add delay to tween
     * @param {number} ms
     * @returns {Tween}
     */
    delay(ms) {
        this._delay = ms || 0;
        return this;
    }

    now() {
        return new Date().getTime();
    }

    clone(object) {
        var clone = {};
        for (var property in object) {
            if (object.hasOwnProperty(property))
                clone[property] = object[property];
        }
        return clone;
    }

    update(iteration) {
        if (this._startTime) {

            // Calculation for delay

            var now = this.now();
            var elapsed = now - this._startTime;
            elapsed = elapsed / (this._duration + this._delay);
            elapsed = elapsed > 1 ? 1 : elapsed;
            if (iteration !== null && iteration !== undefined) {
                elapsed = iteration;
            }
            var d = this._delay / (this._duration + this._delay);
            if (elapsed <= d) {
                elapsed = 0;
            } else {
                elapsed -= d;
                elapsed = elapsed / (1 - d);
            }

            /* var now = this.now();
            var elapsed = now - this._startTime;
            if (iteration !== null && iteration !== undefined) {
                elapsed = iteration;
            } else if (this._delay > 0) {
                if (elapsed >= this._delay) {
                    this._startTime = this.now();
                    this._delay = 0;
                }
                elapsed = 0;
            } else {
                elapsed = elapsed / this._duration;
                elapsed = elapsed > 1 ? 1 : elapsed;
            } */
            var value = this._easingFunction(elapsed);
            for (var property in this._valueEnd) {
                if (this._valueStart[property] === undefined) {
                    continue;
                }
                var start = this._valueStart[property];
                var end = this._valueEnd[property];
                this._object[property] = start + (end - start) * value;
            }
            if (this._onUpdateCallback !== null) {
                this._onUpdateCallback(this._object);
            }
            if (elapsed === 1) {
                if (this._onCompleteCallback !== null) {
                    this._onCompleteCallback(this._object);
                    this._startTime = 0;
                }
            }
        }
    }
}