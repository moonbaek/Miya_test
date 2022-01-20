from flask import Flask, render_template, json, request, redirect, session
from flask_cors import CORS, cross_origin
from flask_restx import Resource, Api, reqparse
from flaskext.mysql import MySQL
from flask import jsonify
from auth import SHA256
import sys
import os

mysql = MySQL()
app = Flask(__name__)
api = Api(app, doc=False)
CORS(app)
app.secret_key = 'back to the idea'

session_user = 'none'

app.config.from_envvar('MIYA_FLASK_SETTINGS')
app.flaskIP = app.config['MIYA_FLASK_IP']
app.flaskPort = app.config['MIYA_FLASK_PORT']
app.creatorIP = app.config['MIYA_CREATOR_IP']
app.creatorPort = app.config['MIYA_CREATOR_PORT']
# app.port = os.environ['MIYA_FLASK_SERVER_PORT']
print('Flask Server IP:' + str(app.flaskIP))
print('Flask Server PORT:' + str(app.flaskPort))
print('Creator Server IP:' + str(app.creatorIP))
print('Creator Server PORT:' + str(app.creatorPort))

mysql.init_app(app)

json_swap ={}


# Todo: route '/' is failed due to reset api feature.
# W/A : use '/main' instead of '/' temporary.
@app.route('/main')
def main():
    print('enterMain')
    return render_template('index.html')

@app.route('/voxelPost')
def showVoxelPost():
    return render_template('voxelPost.html',user = session.get('username'))

@app.route('/showSignUp')
def showSignUp():
    return render_template('signup.html')

@app.route('/users/signin')
def showSignin():
    return render_template('signin.html')

@app.route('/dbSave',methods=['POST'])
def dbSave():
    print('calldbSave')
    dataFromCreator = json.loads(request.get_data(), encoding='utf-8')
    try:
        _username = dataFromCreator['username']
        _cmd = dataFromCreator['cmd']
        _itemJsonData = json.dumps(dataFromCreator['data'], sort_keys=False)
        # print(_itemJsonData)
        # validate the received values
        conn = mysql.connect()
        cursor = conn.cursor()
        print('_username='+_username)
        print('_cmd='+_cmd)
        if _username and _cmd == 'dbItemInsert':
            print('dbItemInsert')

            _userDBname = 'itemDB_' + _username

            #_itemName = dataFromCreator['itemname']
            _itemName = "NO_NAME"

            sql_command = "INSERT INTO " + _userDBname  + """( obj_name, obj_json ) VALUES ( %s, %s )"""
            # print(sql_command, _itemName, _itemJsonData)
            cursor.execute (sql_command, (_itemName, _itemJsonData))
            dbResult = cursor.fetchall()
            print(dbResult)

            sql_command = "SELECT obj_id from " +_userDBname + " order by obj_id desc limit 1;"
            cursor.execute (sql_command)
            dbResult = cursor.fetchall()
            print(dbResult[0][0])

            itemID = dbResult[0][0]
            print("saved Item ID: " + str(itemID))
            if itemID != 0:
                conn.commit()
                print('New Item saved into DB successfully !')
                response = {'result':'success', 'itemID': itemID}
                return jsonify(response)
            else:
                print(dbResult)
                response = {'result':'fail', 'itemID': itemID}
                return jsonify(response)
        #ToDo Item update when itemID is same.
        elif _username and _cmd == 'dbItemUpdate':
            _userDBname = 'itemDB_' + _username
            _itemID = dataFromCreator['itemid']
            print('dbItemUpdate ID: '+_itemID)
            sql_command = "UPDATE " + _userDBname  + """ SET obj_json = %s WHERE obj_id = """ + _itemID + ";"
            print(sql_command, _itemJsonData)
            cursor.execute (sql_command, (_itemJsonData))
            dbResult = cursor.fetchall()
            print(dbResult)
            if len(dbResult) == 0:
                conn.commit()
                print('User created successfully !')
                response = {'result':'success', 'itemID': _itemID}
                return jsonify(response)
            else:
                print(dbResult)
                response = {'result':'fail', 'itemID': 0}
                return jsonify(response)
        else:
            return render_template('error.html',error = 'Save Item DB error.' )

    except Exception as e:
        return json.dumps({'result':'fail', 'itemID': 0})
    finally:
        cursor.close() 
        conn.close()

@app.route('/dbList',methods=['POST'])
def dbList():

    dataFromCreator = json.loads(request.get_data(), encoding='utf-8')
    _username = dataFromCreator['username']
    _cmd = dataFromCreator['cmd']

    conn = mysql.connect()
    cursor = conn.cursor()
    print('_username='+_username)
    print('_cmd='+_cmd)
    if _username != 'none' and _cmd == 'dbItemListLoad':

        _userDBname = 'itemDB_' + _username
        # select * from miya_item where obj_id = p_itemID;
        sql_command = "SELECT  * FROM " + _userDBname  + " ;"
        cursor.execute (sql_command)

        dbResult = cursor.fetchall()
        print(dbResult)
        dbList = []
        for item in dbResult:
            dbList.append({'user_id':_username, 'item_name':item[1], 'item_id':item[0]})
        print(dbList)
        data = {"result": 'success', "data" : dbList, "itemcnt": len(dbList)}

        return json.dumps(data, sort_keys=False)
    else:
        print('no user info')
        data = {"result": 'fail', "data" : 'no_user_name'};

        return json.dumps(data, sort_keys=False)

@app.route('/dbLoad',methods=['POST'])
def dbLoad():
    print('dbLoad call')
    dataFromCreator = json.loads(request.get_data(), encoding='utf-8')
    print(dataFromCreator)
    _username = dataFromCreator['username']
    _cmd = dataFromCreator['cmd']
    _itemID = dataFromCreator['data']

    conn = mysql.connect()
    cursor = conn.cursor()
    print('_username='+_username)
    print('_cmd='+_cmd)
    if _username and _cmd == 'dbItemLoad':
        _userDBname = 'itemDB_' + _username
        # select * from miya_item where obj_id = p_itemID;
        sql_command = "SELECT  * FROM " + _userDBname  + " WHERE obj_id = %s ;"
        # print(sql_command, _itemName, _itemJsonData)
        cursor.execute (sql_command, (_itemID))

        dbResult = cursor.fetchall()
        print(dbResult)
        loadItem = json.loads(dbResult[-1][6])
        print(dbResult[-1][0])
        loadItemId = dbResult[-1][0]
        data = {"result": 'success', "data" : loadItem, "itemid": loadItemId};

        return json.dumps(data, sort_keys=False)

@app.route('/userMain')
def userHome():
    global session_user
    print('app user ' + session_user)
    mainData = {
        'user': session_user,
        'creatorUrl': 'http://' + app.creatorIP + ':' + str(app.creatorPort)
    }
    if session.get('user'):
        return render_template('userMain.html',data = mainData)
    else:
        return render_template('error.html',error = 'Unauthorized Access')
 
@app.route('/signupok')
def signok():
    print('sign up ok render signok.html')
    return render_template('signok.html')

@app.route('/logout')
def logout():
    session.pop('user', None)
    session.pop('username', None)
    session_user = 'none'
    return redirect('/main')


@api.route('/commAPI_flask')
class commAPI(Resource):
    print('commAPI FLASK')
    #test get
    global session_user
    def get(self):
        data = {'get': 'ok'}
        return jsonify(data)
   
    def post(self):
        parsed_request = request.json.get('content')
        print('content: ' + parsed_request)

        if parsed_request == 'username':
            #_session_user = session.get('username')
            _session_user = session_user
            print('session user: ' + _session_user)
            if _session_user != 'none':
                data = {"result": 'success', "data" :_session_user}
            else:
                data = {"result": 'fail', "data" :_session_user}
        else:
             data = {"result": 'fail', "data" :'unsupported user'}

        return jsonify(data)


@app.route('/validateLogin',methods=['POST'])
def validateLogin():
    print('enterValidateLogin')
    global session_user
    try:
        _username = request.form['inputUser']
        _password = request.form['inputPassword']
               
        # connect to mysql
        con = mysql.connect()
        cursor = con.cursor()
        cursor.callproc('sp_validateLogin',(_username,))
        data = cursor.fetchall()

        if len(data) > 0:
            if SHA256.encrypt(_password) == str(data[0][3]):
                session['user'] = data[0][0]
                session['username'] = data[0][1]
                session_user = data[0][1]
                return redirect('/userMain')
            else:
                return render_template('error.html',error = 'Wrong User Name or Password.')
        else:
            return render_template('error.html',error = 'Wrong User Name or Password.')          

    except Exception as e:
        return render_template('error.html',error = str(e))
    finally:
        cursor.close()
        con.close()

@app.route('/signup',methods=['POST','GET'])
def signUp():
    try:
        _name = request.form['inputName']
        _email = request.form['inputEmail']
        _password = request.form['inputPassword']

        # validate the received values
        if _name and _email and _password:
            
            conn = mysql.connect()
            cursor = conn.cursor()
            _hashed_password = SHA256.encrypt(_password)
            print('input pw='+_password)
            print('hashed_PW='+_hashed_password)
            cursor.callproc('sp_createUser',(_name,_email,_hashed_password))
            data = cursor.fetchall()

            if len(data) == 0:
                userDBname = str("itemDB_" + _name)
                sql_command = "CREATE TABLE MIYA_DB." + userDBname +" ( " \
                            + "obj_id BIGINT NOT NULL AUTO_INCREMENT, " \
                            + "obj_name VARCHAR(255), obj_price VARCHAR(45), " \
                            + "obj_category VARCHAR(45), obj_location VARCHAR(90), " \
                            + "obj_filepath VARCHAR(255), obj_json TEXT, " \
                            + "PRIMARY KEY (obj_id)); "
                cursor.execute (sql_command)
                dbResult = cursor.fetchall()
                print(dbResult)
                conn.commit()
                print('User created successfully !')
                # return json.dumps({'message':'User created successfully !'})
                return redirect('/signupok')
            else:
                # return json.dumps({'error':str(data[0])})
                return render_template('error.html',error = str(data[0]) )
        else:
            # return json.dumps({'html':'<span>Enter the required fields</span>'})
            return render_template('error.html',error = 'Enter the required fields.' )

    except Exception as e:
        return json.dumps({'error':str(e)})
    finally:
        cursor.close() 
        conn.close()
        

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=app.flaskPort, debug=True)
