'use strict'

const path = require('path')
const express = require('express')
const ChartedServer = require('chartedjs').default
const Datastore = require('@google-cloud/datastore')
const datastore = new Datastore({projectId: 'charted-181601'})

const db = {
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

const privacy = express()
privacy.use(express.static(path.join(__dirname, 'privacy')))

const server = new ChartedServer()
  .withPort(Number(process.env.PORT) || 5000)
  .withStaticRoot(path.join(__dirname, 'node_modules', 'chartedjs', 'out', 'client'))
  .withStore(db)
  .withForceSSL()
  .withApp('/privacy', privacy)
  .withLinks([
    {text: 'GitHub', href: 'https://github.com/charted-co/charted'},
    {text: 'How it works', href: 'https://medium.com/p/2149df6bb0bd'},
    {text: 'Try an example', href: '/c/46e0cd2'},
    {text: 'Privacy', href: '/privacy'},
  ])
  .start()
  .then((server) => {
    let address = server.address
    console.log(`Running at ${address.address}:${address.port}`)
  })
