var _ = require('underscore'),
    express = require('express'),
    app = express(),
    server = require('http').createServer( app ),
    io = require( 'socket.io' ).listen( server )
    users = [];

server.listen(443);

app.use( express.static( __dirname + '/public' ) );

app.get( '/', function( req, res ) {
    res.sendfile( __dirname + '/public/index.html' );
});

io.sockets.on( 'connection', function( socket ) {
    io.sockets.emit( 'set users', users );

    socket.on( 'send message', function( data ) {
        io.sockets.emit( 'new message', data );
    });

    socket.on( 'user connected', function( data ) {
        var user = {
            'id': socket.id,
            'name': data
        }
        users.push( user );
        io.sockets.emit( 'new user', user );
    });

    socket.on( 'disconnect', function( data ) {
        users = _.reject( users, function( user ) {
            return user.id == socket.id;
        });

        io.sockets.emit( 'remove user', socket.id );
    });
});

