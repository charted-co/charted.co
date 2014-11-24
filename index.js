/*jshint node:true */

var request = require('request')
var express = require('express')
var app = express()

function fetchResource(req, res) {
  if (!req.query.url) {
    res.status(400).send('Bad Request: no url provided')
    return
  }

  request(decodeURIComponent(req.query.url), function (err, resp, body) {
    if (err) {
      res.status(400).send('Bad Request: ' + err)
      return
    }

    if (resp.statusCode != 200) {
      res.status(400).send('Bad Request: response status code was not 200')
      return
    }

    res.status(200).send(body)
  })  
}

app.set('port', (process.env.PORT || 5000))
app.get('/get', fetchResource)
app.use(express.static(__dirname + '/pub'))

app.listen(app.get('port'), function () {
  console.log('Running at localhost:', app.get('port'))
})
