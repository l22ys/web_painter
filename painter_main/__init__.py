# from flask import Flask, render_template
# from flask_socketio import SocketIO, send
# # def create_app():
# #     app = Flask(__name__)
# #
# #     from .views import main_views
# #     app.register_blueprint(main_views.bp)
# #
# #     return app
#
# app = Flask(__name__)
# app.secret_key = 'mysecret'
#
# socket_io = SocketIO(app)
#
# @app.route('/painter')
# def painter():
#     return render_template('painter.html')
#
# if __name__ == '__main__':
#     socket_io.run(app, debug=True, port=5000) # 여기서 포트번호 설정 가능


from flask import Flask, render_template, request
from flask_socketio import SocketIO

app = Flask(__name__)
app.config['SECRET_KEY'] = 'vnkdjnfjknfl1232#'
socketio = SocketIO(app)
latest_data = {'no_data': True} # 전송받은게 있으면 최근에 전송받은 데이터로 바뀜

@app.route('/')
def sessions():
    return render_template('painter_main.html')
    # return render_template('painter.html')

# @app.before_request
# def print_log():
#     print(request.remote_addr)
#     print('!!!!!!!!!!!!!!!!!!!!!1')

def messageReceived(methods=['GET', 'POST']):
    print('message was received!!!')

@socketio.on('my event')
def handle_my_custom_event(json, methods=['GET', 'POST']):
    print('received my event: ' + str(json))
    socketio.emit('my response', json, callback=messageReceived)


@socketio.on('recover')
def handle_recover(data):
    print(latest_data)
    socketio.emit('recover command',latest_data)

@socketio.on('reset')
def handle_reset(data):
    socketio.emit('reset command',{})

@socketio.on('data submit')
def handle_data_submit(data_for_submit):
    global latest_data
    latest_data = data_for_submit
    socketio.emit('data from server',data_for_submit)

@socketio.on('custom event')
def handle_custom_event(data):
    print(type(data))
    print('---')
    print(data)
    socketio.emit('server custom event',data)

if __name__ == '__main__':
    # socketio.run(app, host='0.0.0.0',port=5000)
    socketio.run(app)
    # app.run(host='0.0.0.0',port=5000)