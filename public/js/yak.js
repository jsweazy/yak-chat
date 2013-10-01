jQuery( function() {
    var socket = io.connect(),
        nick = '',
        $message_box = $('#message'),
        $rooms = $('#chat-rooms'),
        $rooms_list = $('#room-list').find('ul');

    // Templates
    var message_tpl = _.template( $('#message-tpl').html() ),
        users_tpl = _.template( $('#users-tpl').html() ),
        single_user_tpl = _.template( $('#single-user-tpl').html() ),
        room_tpl = _.template( $('#room-tpl').html() ),
        room_tab_tpl = _.template( $('#room-tab-tpl').html() );

    $rooms_list.on( 'click', 'li a', function( e ) {
        var $el = $(this),
            room = $el.data('room');

        $rooms_list.find('.current').removeClass('current');
        $el.addClass('current');

        $rooms.find('.current').removeClass('current');
        $('.room[data-room="' + room + '"]').addClass('current');

        e.preventDefault();
    });

    $rooms_list.find('li').first().find('a').trigger('click');

    $message_box.on( 'keydown', function(e) {
        if ( e.keyCode != 13 || !$message_box.val().trim() ) return;

        socket.emit( 'send message', {
            room: $('#room-list').find('.current').data('room'),
            message: $message_box.val(),
            datetime: new Date()
        });

        $message_box.val('');
    });

    socket.on('remove user', function( id ) {
        $('#chat-rooms').find('li[data-id="' + id + '"]').remove();
    });

    socket.on('new message', function( data ) {
        var $open_chat = $rooms.find('.room[data-room="' + data.room + '"]').find('.chat'),
            at_bottom = false;

        console.log($open_chat[0].scrollHeight - $open_chat.scrollTop(), $open_chat.outerHeight());
        if ( $open_chat[0].scrollHeight - $open_chat.scrollTop() - 10 <= $open_chat.outerHeight() ) {
            at_bottom = true;
        }

        $open_chat.append( message_tpl( data ) );

        if ( at_bottom )
            $open_chat.scrollTop( $open_chat[0].scrollHeight );
    });

    socket.on( 'set nick', function( _nick ) {
        var target = $('#room-list').find('.current').data('room');

        nick = _nick;

        var $open_room = $('.room[data-room="' + target +'"]').find('.chat');

        $open_room.append( message_tpl({
            nick: 'SERVER',
            message: 'Your nick is now ' + nick,
            datetime: new Date()
        }));
    });

    socket.on( 'join room', function( room_data ) {
        $rooms.append( room_tpl( room_data ) )
        $rooms_list.append( room_tab_tpl( room_data ) );

        $rooms = $('#chat-rooms');
        $rooms_list = $('#room-list').find('ul');

        $rooms_list.find('li').last().find('a').trigger('click');

        $('.room.current').find('.users ul').html( users_tpl( room_data ) );

        socket.emit( 'send server message', {
            room: room_data.room,
            message: nick + ' joined the room'
        });
    });

    socket.on( 'user joined room', function( user ) {
        console.log( 'user joined' );
        var $user_list = $rooms.find('.room[data-room="#room-' + user.room.replace( '#', '' ) + '"]').find('.users ul');
        console.log($user_list);
        $user_list.append( single_user_tpl( user ) );
    });
});