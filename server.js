var _ = require('underscore'),
    express = require('express'),
    app = express(),
    server = require('http').createServer( app ),
    io = require( 'socket.io' ).listen( server ),
    port = process.env.PORT || 5000,
    main_room = '#main',
    rooms = [];

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
    socket.on( 'send message', function( data ) {
        var message = data.message;

        if ( data.message.substring( 0, 1 ) == '/' ) {
            if ( message.substring( 1, 5 ) == 'nick' ) {
                var nick = message.substring(6);
                socket.nick = nick;
                console.log(socket);
                // socket.set('nick', nick, function() {
                    socket.emit( 'set nick', nick );
                // });
            }
            else if ( message.substring( 1, 5 ) == 'join' ) {
                var room = message.substring(6);

                if ( room.substring( 0, 1 ) != '#' ) {
                    room = '#' + room;
                }

                room = room.replace( / /g, '_' );

                socket.join( room );
                var users = [];

                io.sockets.clients( room ).forEach( function ( user ) {
                    users.push({
                        id: user.id,
                        nick: user.nick
                    });
                });

                var room_data = {
                    room: room,
                    users: users
                }
                socket.emit( 'join room', room_data );

                var user = {
                    room: room,
                    id: socket.id,
                    nick: socket.nick
                }
                socket.broadcast.to( room ).emit( 'user joined room', user );
            }
        } else {
            var room = data.room.replace( '#room-', '#' );

            if ( room == main_room ) return;

            // socket.get('nick', function( err, nick ) {
                data.nick = socket.nick;
                io.sockets.in( room ).emit( 'new message', data );
            // });
        }
    });

    socket.on( 'send server message', function( data ) {
        var room = data.room;

        if (
            room.substring( 0, 5 ) != '#main' &&
            room.substring( 0, 6 ) != '#room-'
        ) {
            room = '#room-' + room.replace( '#', '' );
        }

        var message = {
            room: room,
            nick: 'SERVER',
            message: data.message,
            datetime: new Date()
        }

        io.sockets.in( data.room ).emit( 'new message', message );
    });

    socket.on( 'leave room', function( data ) {
        socket.leave( data.room );
    });

    socket.on( 'user connected', function( nick ) {
        var user = {
            'id': socket.id,
            'name': nick
        }

        io.sockets.emit( 'new user', user );
    });

    socket.on( 'disconnect', function( data ) {
        io.sockets.emit( 'remove user', socket.id );
    });
});

