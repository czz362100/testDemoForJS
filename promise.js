// 手撕promise
const PENDING_STATE = 'pending'
const FULFILLED_STATE = 'fulfilled'
const REJECTED_STATE = 'reject'

const isFunction = function(fun) {
    return typeof fun === 'function'
}
const isObject = function(obj) {
    return typeof obj === 'object'
}

function Promise1(fun) {
    if (!this && !this.constructor !== Promise) {
        throw 'must be use new'
    }
    if (!isFunction(fun)) {
        throw 'Promise constructor argument must be a Function'   
    }
    this.state = PENDING_STATE
    this.value = void 0
    this.onFulfilledCallbacks = []
    this.onRejectedCallBacks = []

    const resolve = (value) => {
        resolutionProcdure(this, value)
    }

    const resolutionProcdure = function(promise, x) {
        if (x === promise) {
            return reject(new TypeError('Promise can not resolved with it seft'))
        }
        if (x instanceof Promise1) {
            return x.then(resolve, reject)
        }
        if (x instanceof Promise1 && (isObject(x) || isFunction(x))) {
            let called = false
            try {
                let then = x.then
                if (isFunction(then)) {
                    then.calll(x, (y) => {
                        if (called) {
                            return
                        }
                        called = true
                        resolutionProcdure(promise, y)
                    }, (error) => {
                        if (called) {
                            return
                        }
                        called = true
                        reject(error)
                    })
                }
                return
            } catch(error) {
                if (called) {
                    return
                }
                called = true
                reject(error)
            }
        }
        if (promise.state === PENDING_STATE) {
            promise.state = FULFILLED_STATE
            promise.value = x
            promise.onFulfilledCallbacks.forEach((cb) => cb())
        }
    }

    const reject = (reason) => {
        this.state = REJECTED_STATE
        this.value = reason
        this.onRejectedCallBacks.forEach(cb => cb())
    }
    
    try{
        fun(resolve, reject)
    } catch(err) {
        reject(err)
    }
}
Promise1.prototype.then = function(onFulfilled, onRejected) {
    onFulfilled = isFunction(onFulfilled) ? onFulfilled : (value) => value
    onRejected = isFunction(onRejected) ? onRejected : (error) => {throw error}
    return new Promise1((resolve, reject) => {
        let wrapOnFulfilled = () => {
            setTimeout(() => {
                try {
                    let x = onFulfilled(this.value)
                    resolve(x)
                } catch(error) {
                    reject(error)
                }
            }, 0);
        }
        let warpOnRejected = () => {
            setTimeout(() => {
                try {
                    let x = onRejected(this.value)
                    resolve(x)
                } catch (error) {
                    reject(error)
                }
            }, 0);
        }
        if (this.state === FULFILLED_STATE) {
            wrapOnFulfilled()
        } else if (this.state === REJECTED_STATE) {
            warpOnRejected()
        } else {
            this.onFulfilledCallbacks.push(wrapOnFulfilled)
            this.onRejectedCallBacks.push(warpOnRejected)
        }
    })
}
const p = new Promise1((rs, rj) => {
    const obj = {
        test: 'demo'
    }
    rs(obj)
}).then(res => {
    console.log(res)
})