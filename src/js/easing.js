export default class Easing {

    /**
     * No acceleration
     * @param {Number} t Current time 0 <= t <= 1
     */
    static Linear(t) {
        return t;
    }

    /**
     * Accelerating from zero velocity
     * @param {Number} t Current time 0 <= t <= 1
     */
    static EaseInQuad(t) {
        return t * t;
    }

    /**
     * decelerating to zero velocity
     * @param {Number} t Current time 0 <= t <= 1
     */
    static EaseOutQuad(t) {
        return t * (2 - t);
    }

    /**
     * acceleration until halfway, then deceleration
     * @param {Number} t Current time 0 <= t <= 1
     */
    static EaseInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    /**
     * accelerating from zero velocity
     * @param {Number} t Current time 0 <= t <= 1
     */
    static EaseInCubic(t) {
        return t * t * t;
    }

    /**
     * decelerating to zero velocity
     * @param {Number} t Current time 0 <= t <= 1
     */
    static EaseOutCubic(t) {
        return --t * t * t + 1;
    }

    /**
     * acceleration until halfway, then deceleration
     * @param {Number} t Current time 0 <= t <= 1
     */
    static EaseInOutCubic(t) {
        return t < 0.5
            ? 4 * t * t * t
            : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    }

    /**
     * accelerating from zero velocity
     * @param {Number} t Current time 0 <= t <= 1
     */
    static EaseInQuart(t) {
        return t * t * t * t;
    }

    /**
     * decelerating to zero velocity
     * @param {Number} t Current time 0 <= t <= 1
     */
    static EaseOutQuart(t) {
        return 1 - --t * t * t * t;
    }

    /**
     * acceleration until halfway, then deceleration
     * @param {Number} t Current time 0 <= t <= 1
     */
    static EaseInOutQuart(t) {
        return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t;
    }

    /**
     * accelerating from zero velocity
     * @param {Number} t Current time 0 <= t <= 1
     */
    static EaseInQuint(t) {
        return t * t * t * t * t;
    }

    /**
     * decelerating to zero velocity
     * @param {Number} t Current time 0 <= t <= 1
     */
    static EaseOutQuint(t) {
        return 1 + --t * t * t * t * t;
    }

    /**
     * acceleration until halfway, then deceleration
     * @param {Number} t Current time 0 <= t <= 1
     */
    static EaseInOutQuint(t) {
        return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t;
    }

    /**
     * Slow movement backwards then fast snap to finish
     * @param {Number} t Current time 0 <= t <= 1
     * @param {*} magnitude 
     */
    static EaseInBack(t, magnitude = 1.70158) {
        return t * t * ((magnitude + 1) * t - magnitude);
    }

    /**
     * Fast snap to backwards point then slow resolve to finish
     * @param {Number} t Current time 0 <= t <= 1
     * @param {*} magnitude 
     */
    static EaseOutBack(t, magnitude = 1.70158) {
        const scaledTime = (t / 1) - 1;
        return (
            scaledTime * scaledTime * ((magnitude + 1) * scaledTime + magnitude)
        ) + 1;
    }
}