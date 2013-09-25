jQuery( function() {
    var socket = io.connect(),
        nick = '',
        $message_box = $('#message'),
        $rooms = $('#chat-rooms'),
        $rooms_list = $('#room-list').find('ul');

    // Templates
    var message_tpl = _.template( $('#message-tpl').html() ),
        users_tpl = _.template( $('#users-tpl').html() ),
        room_tpl = _.template( $('#room-tpl').html() ),
        room_tab_tpl = _.template( $('#room-tab-tpl').html() );

    $rooms_list.on( 'click', 'li a', function( e ) {
        var $el = $(this),
            room = $el.data('room');

        $rooms_list.find('.current').removeClass('current');
        $el.addClass('current');

        $rooms.find('.current').removeClass('current');
        $('.room[data-room=' + room + ']').addClass('current');

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

    // socket.on('set users', function( users ) {
    //     $users.html( users_tpl({ users: users }) );
    // });

    // socket.on('new user', function( user ) {
    //     $users.append( '<li data-id="' + user.id + '">' + user.name + '</li>' );
    // });

    // socket.on('remove user', function( id ) {
    //     $users.find('li[data-id="' + id + '"]').remove();
    // });

    socket.on('new message', function( data ) {
        console.log(data);
        var $open_chat = $rooms.find('.room[data-room=' + data.room + ']').find('.chat');
        $open_chat.append( message_tpl( data ) );
        $open_chat.scrollTop( $open_chat[0].scrollHeight );
    });

    socket.on( 'set nick', function( nick ) {
        var target = $('#room-list').find('.current').data('room');
        nick = nick;

        var $open_room = $('.room[data-room=' + target +']').find('.chat');

        $open_room.append( message_tpl({
            nick: 'SERVER',
            message: 'Your nick is now ' + nick,
            datetime: new Date()
        }))
    });

    socket.on( 'join room', function( room ) {
        $rooms.append( room_tpl({ room: room }) )
        $rooms_list.append( room_tab_tpl({ room: room }) );

        $rooms = $('#chat-rooms');
        $rooms_list = $('#room-list').find('ul');

        $rooms_list.find('li').last().find('a').trigger('click');
    });
});