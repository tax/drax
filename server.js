var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    events = require("events"),
    index = fs.readFileSync(__dirname + '/templates/index.html'),
    pubSub = new events.EventEmitter(),
    port = process.argv[2] || 8888;


var walk = function(dir, done) {
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    var i = 0;
    (function next() {
      var file = list[i++];
      if (!file) return done(null, results);
      file = dir + '/' + file;
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, resu) {
            results = results.concat(resu);
            return next();
          });
        } else {
          results.push(file);
          return next();
        }
      });
    })();
  });
};


var serveStatic = function(req, res){
  var uri = url.parse(req.url).pathname,
      filename = path.join(process.cwd(), uri);

  fs.exists(filename, function(exists) {
    if(!exists) {
      res.writeHead(404, {"Content-Type": "text/plain"});
      res.end("404 Not Found\n");
      return;
    }

    if (fs.statSync(filename).isDirectory()) filename += '/index.html';

    fs.readFile(filename, "binary", function(err, file) {
      if(err) {        
        res.writeHead(500, {"Content-Type": "text/plain"});
        res.end(err + "\n");
        return;
      }
      res.writeHead(200);
      res.end(file, "binary");
    });
  });
};


var serveJsx = function(req, res){
  var dir = __dirname + '/widgets/';
  walk(dir, function(err, result){

    if(err) {
      res.writeHead(500, {"Content-Type": "text/plain"});
      res.end(err + "\n");
      return;
    }

    res.writeHead(200);
    res.write('/** @jsx React.DOM */\n');
    result.forEach(function(file) {
      res.write('//\n');
      res.write(fs.readFileSync(file));
    });
    res.end();
  })
};


var subscribe = function(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  pubSub.on('message', function(msg){
    console.log('got message:' + msg);
    var id = (new Date()).toLocaleTimeString();
    return constructSSE(res, id, msg);
  });

};


var publish = function(req, res) {
  var body = '';
  req.on('data', function (data) {
      body += data;
  });
  req.on('end', function () {
    var msg = JSON.parse(body);
    //msg.auth_token == 
    pubSub.emit('message', JSON.stringify(msg));
  });

  res.writeHead(200, {"Content-Type": "text/plain"});
  res.end("Messge ok\n");  
  //res.writeHead(204);
  //res.end();
};

function constructSSE(res, id, data) {
  res.write('id: ' + id + '\n');
  res.write("data: " + data + '\n\n');
}

http.createServer(function(req, res) {
  if (req.url == '/'){
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(fs.readFileSync(__dirname + '/templates/index.html'));//index);
  }

  if(req.url == '/assets/application.js'){
    return serveJsx(req, res);
  }
  
  if(req.url.indexOf('/assets/') == 0){
    return serveStatic(req, res);
  }

  if (req.url == '/publish') {
    return publish(req, res);
  } 

  var enabled = req.headers.accept && req.headers.accept == 'text/event-stream';
  if (req.url == '/subscribe' && enabled) {
    return subscribe(req, res);
  } 

  res.writeHead(404, {"Content-Type": "text/plain"});
  res.end("404 Not Found\n");

}).listen(parseInt(port, 10));

console.log("Dashboard running at http://localhost:" + port + " -- CTRL + C to shutdown")