var fs        = require('fs')
  , path      = require('path')
  , osenv     = require('osenv')
  , concat    = require('concat-stream')
  , spawn     = require('cross-spawn')
  , duplexify = require('duplexify')

// Assert PHP is available
var result = spawn.sync('php', ['-r', 'echo ini_get("extension_dir");'])
if (result.status!==0) throw new Error('Could not find PHP');

// Get the extension dir from default php.ini
var ext = result.stdout.toString().trim()
  , config = __dirname + path.sep + 'build'
  , phar = config + path.sep + 'stream.phar'

// Use custom php.ini with an additional configuration directive
var args = ['-c', config, '-d', 'extension_dir='+ext, phar]

module.exports = function (opts) {
  var tmp = path.join(osenv.tmpdir(), '_'+Date.now())

  if (opts && opts.format) tmp+= '.'+opts.format

  var writer = fs.createWriteStream(tmp)
  
  writer.on('close', function () {
    var child = spawn('php', args.concat(tmp))

    duplex.setReadable(child.stdout)

    child.on('exit', function(code, sig) {
      fs.unlink(tmp, function(){});

      if(code === null || code !== 0) {
        child.stderr.pipe(concat(function(errstr) {
          duplex.emit('error', new Error(errstr))
        }))
      }
    })
  })

  var duplex = duplexify(writer)
  return duplex;
}

if(!module.parent) {
  process.stdin.pipe(module.exports()).pipe(process.stdout)
}
