'use strict'

const path = require('path')
const ChartedServer = require('chartedjs').default
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
      const meta = Object.keys(data).reduce((meta, key) => {
        meta.push({
          name: key,
          value: data[key],
          excludeFromIndexes: true
        })

        return meta
      }, [])

      datastore.upsert({key, data: meta})
        .then((entity) => resolve())
        .catch((err) => reject(err))
    })
  }
}

const server = new ChartedServer()
  .withPort(Number(process.env.PORT) || 5000)
  .withStaticRoot(path.join(__dirname, 'node_modules', 'chartedjs', 'out', 'client'))
  .withStore(db)
  .withForceSSL()
  .start()
  .then((server) => {
    let address = server.address
    console.log(`Running at ${address.address}:${address.port}`)
  })
