'use strict'

const path = require('path')
const ChartedServer = require('./charted/server/charted.js').default
const client = require('redis').createClient(process.env.REDIS_URL);

let db = {
  get: function (key) {
    return new Promise((resolve, reject) => {
      client.get(key, (err, reply) => {
        if (err) reject(err)
        if (!reply) resolve(null)
        resolve(JSON.parse(reply))
      })
    })
  },

  set: function (key, value) {
    return new Promise((resolve, reject) => {
      let data = JSON.stringify(value)
      client.set(key, data, function (err) {
        if (err) reject(err)
        resolve()
      })
    })
  }
}

ChartedServer.start(Number(process.env.PORT) || 5000, path.join(__dirname, 'charted', 'client'), db)
  .then((address) => console.log(`Running at ${address.address}:${address.port}`))
