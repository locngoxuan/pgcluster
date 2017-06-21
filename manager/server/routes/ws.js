var express = require('express')
var wsrouter = express.Router();


/*
wsrouter.ws('/', function(ws, req) {
  let interval;

  ws.on('message', (msg)=>{
    console.log(msg);
    ws.send(new Date().toString());
  })

  interval = setInterval(()=>{
    ws.send(new Date().toString());
  }, 2000);

  ws.on('close', function(msg) {
  	console.log('close with ' + msg);
    if (interval){
      clearInterval(interval);
    } else {
      console.log('no interval to clear ??');
    }
  });
  

});
*/

wsrouter.ws('/repl_nodes', function(ws, req) {
  let interval ;
  let pollInterval = require('../config/config.js').pollInterval;
  let pg = require('../DAO/pg.js');

	let getData = () => {
    pg.getReplNodes()
			.then((data)=>{
				let response = {'result': data.rows, 'timestamp': new Date()};		
				ws.send(JSON.stringify(response));
			})
			.catch((err)=>{
        let msg = err.detail ? err.detail : null;
        if (! msg){
          msg = 'server error ' + (err.code ? err.code + ' - ' : ' - ' ) + (err.errno ? err.errno : '');
        }
				ws.send(JSON.stringify({'message': msg,'error': err } ));
			})
  }


  ws.on('message', (msg)=>{
    //console.log('message %s',msg);
    //ws.send(new Date().toString());
  })
  getData();
  interval = setInterval(getData, pollInterval);

  ws.on('close', function(msg) {
  	console.log('close with ' + msg);
    if (interval){
      clearInterval(interval);
    } else {
      console.log('no interval to clear ??');
    }
  });
  

});

wsrouter.ws('/pool_nodes', function(ws, req) {
  let interval ;
  let pollInterval = require('../config/config.js').pollInterval;
  let pg = require('../DAO/pg.js');

	let getData = () => {
    pg.getPoolNodes()
			.then((data)=>{
				let response = {'result': data.rows, 'timestamp': new Date()};		
				ws.send(JSON.stringify(response));
			})
			.catch((err)=>{
        console.log('catched from from getPoolNodes');
        let msg = err.detail ? err.detail : null;
        if (! msg){
          msg = 'server error' + (err.code ? err.code + ' - ' : ' - ' ) + (err.errno ? err.errno : '');
        }
				ws.send(JSON.stringify({'message': msg,'error': err } ));
			})
  }


  ws.on('message', (msg)=>{
    console.log('message %s',msg);
    //ws.send(new Date().toString());
  })
  getData();
  interval = setInterval(getData, pollInterval);

  ws.on('close', function(msg) {
  	console.log('close with ' + msg);
    if (interval){
      clearInterval(interval);
    } else {
      console.log('no interval to clear ??');
    }
  });
  

});

wsrouter.ws('/bus_health', function(ws, req) {
  let interval ;
  let pollInterval = require('../config/config.js').pollInterval;
  let bus_health = require('../services/index.js').bus_health;

  ws.on('message', (msg)=>{
    console.log('message %s',msg);
    //ws.send(new Date().toString());
  })

  interval = setInterval(()=>{
    let service=req.query.service;
    bus_health(service)
     .then((data)=>{
				let response = {'result': data, 'timestamp': new Date()};
				ws.send(JSON.stringify(response));
     })
		.catch((err)=>{
				console.log(err);
				ws.send(JSON.stringify(err));
			})
	}, pollInterval);

  ws.on('close', function(msg) {
  	console.log('close with ' + msg);
    if (interval){
      clearInterval(interval);
    } else {
      console.log('no interval to clear ??');
    }
  });
  

});

wsrouter.ws('/backup', function(ws, req) {

  const spawn = require('child_process').spawn;

  ws.on('message', (msg)=>{
    console.log('message %s',msg);
    let bu = spawn('ls', ['-alrt','/']);
    bu.stdout.on('data', (data)=>{
      console.log('on data',data.toString());
      ws.send(data.toString());
    })    
    bu.stderr.on('data', (data) => {
      console.log('on data on stderr',data.toString());
      ws.send(data.toString());
    });

    bu.on('close',()=>{
      console.log('close');
      ws.close();
    })
  });

  ws.on('close', function(msg) {
    console.log('close with ' + msg);
  });
  

});


module.exports = wsrouter