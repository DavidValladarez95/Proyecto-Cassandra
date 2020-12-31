var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');

const { title } = require('process');


var app = express();
app.set('views' , path.join (__dirname , 'views'));
app.set('view engine' , 'ejs');

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('viewss', __dirname);

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended : false }));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname , 'public')));




const cassandra = require('cassandra-driver');
 
const client = new cassandra.Client({
  contactPoints: ['127.0.0.1'],
  localDataCenter: 'datacenter1',
  keyspace: 'bdejemplo'
});
 

app.get('/' , function( req , res ){
    const query = 'SELECT id, name FROM persona';
 
    client.execute(query)
    .then(function(result) {
        var nameArr = [];
        var cont = -1;
        result.rows.forEach(function(record){
            cont = cont +1;
            nameArr.push({
                id:  result.rows[cont].id,
                name:  result.rows[cont].name
            })
        });
        res.render('index' , {
            names: nameArr
        });
        //console.log('User with email %s', result.rows[0].name);
    })
    .catch(function(err){
        console.log(err)
    });
});

app.post( '/person/add', function ( req , res ){
    var id = req.body.person_id;
    var name = req.body.person_name;

    const query = 'INSERT INTO persona (id, name) VALUES (?, ?)';
    const params = [id, name];

    client.execute(query, params, { prepare: true }, function (err) {
        res.redirect('/');
        //Inserted in the cluster
      }) ;
});


app.post( '/person/delete', function ( req , res ){
    var id = req.body.delete_person_id;

    const query = 'DELETE FROM persona WHERE id=?';
    const params = [id];

    client.execute(query, params, { prepare: true }, function (err) {
        res.redirect('/');
      }) ;
})


app.listen(3000);
console.log('El servidor se ha iniciado en el puerto 3000');

module.exports = app;