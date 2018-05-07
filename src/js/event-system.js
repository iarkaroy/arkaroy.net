
class EventSystem {
    
    constructor() {
        this.queue = {};
    }

    /**
     * Publish to an event
     * @param {string} event 
     * @param {any} data 
     */
    publish(event, data) {
        let queue = this.queue[event];

        if (typeof queue === 'undefined') {
            return false;
        }

        while (queue.length > 0) {
            (queue.shift())(data);
        }

        return true;
    }

    /**
     * Subscribe to event with callback
     * @param {string} event 
     * @param {function} callback 
     */
    subscribe(event, callback) {
        if (typeof this.queue[event] === 'undefined') {
            this.queue[event] = [];
        }

        this.queue[event].push(callback);
    }

    /**
     * Unsubscribe from event
     * @param {string} event 
     * @param {function} callback 
     */
    unsubscribe(event, callback) {
        let queue = this.queue;

        if (typeof queue[event] !== 'undefined') {
            if (typeof callback === 'undefined') {
                delete queue[event];
            } else {
                this.queue[event] = queue[event].filter(function (sub) {
                    return sub !== callback;
                })
            }
        }
    }
}

const events = new EventSystem();
export default events;