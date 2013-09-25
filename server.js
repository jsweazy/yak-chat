var _ = require('underscore'),
    express = require('express'),
    app = express(),
    server = require('http').createServer( app ),
    io = require( 'socket.io' ).listen( server ),
    port = process.env.PORT || 5000,
    users = [];

if ( process.argv[2] == 'is_heroku' ) {
    io.configure( function() {
        io.set( 'transports', ['xhr-polling'] );
        io.set( 'polling duration', 10 );
    });
}

server.listen(port);

app.use( express.static( __dirname + '/public' ) );

app.get( '/', function( req, res ) {
    res.sendfile( __dirname + '/public/index.html' );
});

io.sockets.on( 'connection', function( socket ) {
    io.sockets.emit( 'set users', users );

    socket.on( 'send message', function( data ) {
        var message = data.message;

        if ( data.message.substring( 0, 1 ) == '/' ) {
            if ( message.substring( 1, 5 ) == 'nick' ) {
                var nick = message.substring(6);
                socket.set('nick', nick, function() {
                    socket.emit( 'set nick', nick );
                });
            }
            else if ( message.substring( 1, 5 ) == 'join' ) {
                var room = message.substring(6);

                if ( room.substring( 0, 1 ) != '#' ) {
                    room = '#' + room;
                }

                room = room.replace( / /g, '_' );

                socket.join( room );
                socket.emit( 'join room', room );
            }
        } else {
            io.sockets.emit( 'new message', data );
        }
    });

    // socket.on( 'set nick', function( nick ) {
    //     console.log('setting nick');
    //     socket.nick = nick;
    //     io.sockets.emit( 'nick set', nick );
    // });

    socket.on( 'join room', function( data ) {
        socket.join( data.room );
    });

    socket.on( 'leave room', function( data ) {
        socket.leave( data.room );
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

