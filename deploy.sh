#!/usr/bin/env bash

node node_modules/.bin/lessc less/charted.less pub/charted.css
node node_modules/.bin/uglifyjs "pub/scripts/lib/jquery.js" "pub/scripts/lib/d3.js" \
  "pub/scripts/lib/lodash.compat.js" "pub/scripts/Utils.js" "pub/scripts/PageData.js" \
  "pub/scripts/ChartLegend.js" "pub/scripts/ChartData.js" "pub/scripts/Chart.js" \
  "pub/scripts/PageController.js" "pub/scripts/charted.js" -o "pub/charted.js"
node index.js