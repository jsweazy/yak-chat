jQuery( function() {
    var socket = io.connect(),
        nickname = '',
        $nickname_box = $('#nickname'),
        $join_btn = $('#join'),
        $message_box = $('#message'),
        $nickname = $('#choose-nickname'),
        $chat = $('#chat'),
        $chat_box = $('#chat-box'),
        $users = $('#users');

    // Templates
    var message_tpl = _.template( $('#message-tpl').html() );
    var users_tpl = _.template( $('#users-tpl').html() );

    $join_btn.on( 'click', function(e) {
        e.preventDefault();

        nickname = $nickname_box.val();

        socket.emit( 'user connected', nickname );

        $nickname.addClass('off');
        $chat.addClass('on');
    });

    $message_box.on( 'keydown', function(e) {
        if ( e.keyCode != 13 || !$message_box.val().trim() ) return;

        socket.emit( 'send message', {
            'nickname': nickname,
            'message': $message_box.val(),
            'datetime': new Date()
        });

        $message_box.val('');
    });

    socket.on('set users', function( users ) {
        $users.html( users_tpl({ users: users }) );
    });

    socket.on('new user', function( user ) {
        $users.append( '<li data-id="' + user.id + '">' + user.name + '</li>' );
    });

    socket.on('remove user', function( id ) {
        $users.find('li[data-id="' + id + '"]').remove();
    });

    socket.on('new message', function( data ) {
        $chat_box.append( message_tpl( data ) );
        $chat_box.scrollTop( $chat[0].scrollHeight );
    });
});