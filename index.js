'use strict'

const path = require('path')
const ChartedServer = require('./charted/server/charted.js').default
const Datastore = require('@google-cloud/datastore')
const datastore = new Datastore({projectId: 'charted-181601'})

let db = {
  get: function (key) {
    return new Promise((resolve, reject) => {
      key = datastore.key(['Chart', key])

      datastore.get(key)
        .then((results) => resolve(results[0]))
        .catch((err) => reject(err))
    })
  },

  set: function (key, data) {
    return new Promise((resolve, reject) => {
      key = datastore.key(['Chart', key])

      datastore.upsert({key, data})
        .then((entity) => resolve())
        .catch((err) => reject(err))
    })
  }
}

ChartedServer.start(Number(process.env.PORT) || 5000, path.join(__dirname, 'charted', 'client'), db)
  .then((server) => {
    let address = server.address
    console.log(`Running at ${address.address}:${address.port}`)
  })
