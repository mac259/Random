var test       = require('tape')
  , excel      = require('../')
  , fs         = require('fs')
  , csvParser  = require('csv-parser')
  , concat     = require('concat-stream')
  , through2   = require('through2').obj
  , equal      = require('deep-equal')

test('functional', function(t){
  t.plan(1)

  var file = require.resolve('./air_pollution_nl.xlsx')
  var expected = require('./air_pollution_nl.json')

  fs.createReadStream(file)
    .pipe( excel() ).on('error', function(err){
      throw err
    })
    .pipe( csvParser() )

    // Ignore tiny rounding differences
    .pipe( through2(function(obj, _, next){
      for(var k in obj) {
        var val = obj[k]
        if (!isNaN(val)) obj[k] = (+val).toFixed(2)
      }

      next(null, obj)
    }))

    .pipe( concat(function(data){
      t.ok(equal(data, expected), 'equal')
    }))
})
