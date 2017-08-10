import json, datetime, gc
from flask import Flask, render_template, request, jsonify, redirect, url_for, session
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from flask_script import Manager
from flask_migrate import Migrate, MigrateCommand


app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:root@localhost/kyan'
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SECRET_KEY'] = 'super secret key'

db = SQLAlchemy(app)
migrate = Migrate(app, db)
manager = Manager(app)
manager.add_command('db', MigrateCommand)


class Person(db.Model):
    __tablename__ = "persons"
    id = db.Column(db.Integer, primary_key=True)
    firstname = db.Column(db.String(64))
    lastname = db.Column(db.String(64))
    dtadd = db.Column(db.DateTime)
    dtchange = db.Column(db.DateTime, nullable=True)
    fList = db.relationship("List", backref = 'owner', lazy = 'dynamic')

    def __init__(self, firstname, lastname, dtadd, dtchange):
    	self.firstname = firstname
    	self.lastname = lastname
    	self.dtadd = dtadd
    	self.dtchange = dtchange
    # def __repr__(self):
    #     return '<Username %r>' % self.username


class List(db.Model):
	__tablename__ = "lists"
	id = db.Column(db.Integer, primary_key=True)
	persId = db.Column(db.Integer, db.ForeignKey('persons.id'))
	listName = db.Column(db.String(20))
	listState = db.Column(db.String(20))
	dtadd = db.Column(db.DateTime)
	dtchange = db.Column(db.DateTime, nullable=True)
	fItem = db.relationship("Item")

	def __init__(self, persId, listName, listState, dtadd, dtchange):
		self.persId = persId
		self.listName = listName
		self.listState = listState
		self.dtadd = dtadd
		self.dtchange = dtchange


class Item(db.Model):
	__tablename__ = "items"
	id = db.Column(db.Integer, primary_key=True)
	itemName = db.Column(db.String(20))
	itemState = db.Column(db.String(20))
	itemComment = db.Column(db.String(100))
	dtadd = db.Column(db.DateTime)
	dtchange = db.Column(db.DateTime, nullable=True)
	listId = db.Column(db.Integer, db.ForeignKey('lists.id'))

	def __init__(self, itemName, itemState, itemComment, dtadd, dtchange, listId):
		self.itemName = itemName
		self.itemState = itemState
		self.itemComment = itemComment
		self.dtadd = dtadd
		self.dtchange = dtchange
		self.listId = listId


class Group(db.Model):
	__tablename__ = "groups"
	id = db.Column(db.Integer, primary_key=True)
	grpNm = db.Column(db.String(20))

	def __init__(self, grpNm):
		self.grpNm = grpNm


class Morph(db.Model):
	__tablename__ = "morphs"
	id = db.Column(db.Integer, primary_key=True)
	persId = db.Column(db.Integer)
	grpId = db.Column(db.Integer)

	def __init__(self, persId, grpId):
		self.persId = persId
		self.grpId = grpId


@app.route('/', methods = ['GET', 'POST'])
def whoami():
	try:
		if request.method == 'POST':
			firstname = request.form['firstNm']
			lastname = request.form['lastNm']

			now = datetime.datetime.now()
			dtadd = now.date()
			flag = db.session.query(Person).filter_by(firstname = firstname).filter_by(lastname = lastname).first()
			if flag == None:
				result = Person(firstname, lastname, dtadd, None)

				db.session.add(result)
				db.session.commit()
				gc.collect()

			persObj = db.session.query(Person).filter_by(firstname = firstname).filter_by(lastname = lastname).first()
			persId = persObj.id

			session['firstNm'] = firstname
			session['lastNm'] = lastname
			session['today'] = dtadd
			session['id'] = persId

			persId = session['id']

			getListAll = db.session.query(List).filter_by(persId = persId).all()
			jsonDataAll = []
			for every in getListAll:
				jsonDataAll.append({
					"persId" : every.persId,
					"listNm" : every.listName,
					"id" : every.id,
					"state" : every.listState
				})

			getLists = db.session.query(List).filter_by(persId = persId).filter_by(listState = 'A').all()

			jsonData = []
			for every in getLists:
				jsonData.append({
					"persId" : every.persId,
					"listNm" : every.listName,
					"id" : every.id,
					"state" : every.listState
				})

			getFstListObj = db.session.query(List).filter_by(persId = persId).first()

			if getFstListObj == None:
				fstListNm = None
				return render_template("formElement/mainForm.html", fstListNm = fstListNm)

			fstListId = getFstListObj.id
			fstListNm = getFstListObj.listName
			session['listId'] = fstListId
			fstLstItm = db.session.query(Item).filter_by(listId = fstListId).filter_by(itemState = 'A').all()

			jsonDataItm = []
			for everyItm in fstLstItm:
				jsonDataItm.append({
					"itmName" : everyItm.itemName,
					"itmState" : everyItm.itemState,
					"itmCmt" : everyItm.itemComment,
					"id" : everyItm.id	
				})

			grpObjs = db.session.query(Group).all()
			jsonGrp = []
			for grpObj in grpObjs:
				jsonGrp.append({
					'grpName' : grpObj.grpNm	
				})
			print(jsonGrp)
			return render_template("formElement/mainForm.html", session = session, jsonData = jsonData, jsonDataItm = jsonDataItm, fstListNm = fstListNm, jsonDataAll = jsonDataAll, jsonGrp = jsonGrp)
		return render_template('formElement/whoami.html')
	except Exception as e:
		return str(e)


@app.route('/createList/', methods = ['GET', 'POST'])
def createList():
	listName = request.json['lstName']
	persId = session['id']
	now = datetime.datetime.now()
	dtadd = now.date()
	flag = db.session.query(List).filter_by(persId = persId).filter_by(listName = listName).first()
	if flag == None:
		dfState = 'A'
		result = List(persId, listName, dfState, dtadd, None)
		db.session.add(result)
		db.session.commit()
		return jsonify(status = True, jsonData = {"id": result.id, "name": result.listName, "state": result.listState})
	else:
		return jsonify(status = False, message = "Something went wrong in SQL.")
	


@app.route('/showItm/', methods = ['GET', 'POST'])
def showItm():
	listId = request.json['listId']
	session['listId'] = listId
	jsonData = []
	items = db.session.query(Item).filter_by(listId = listId).all()
	listNameObj = db.session.query(List).filter_by(id = listId).first()
	listName = listNameObj.listName

	for item in items:
		jsonData.append({
			"itmName" : item.itemName,
			"itmState" : item.itemState,
			"itmCmt" : item.itemComment,
			"id" : item.id
		})
	return jsonify(status = True, jsonData = {"jsonData" : jsonData, "listName" : listName})


@app.route('/createItm/', methods = ['GET', 'POST'])
def createItm():
	listId = request.json['listId']
	print(listId)
	itmNm = request.json['name']
	comment = request.json['comment']
	now = datetime.datetime.now()
	dtadd = now.date()
	status = 'A'
	if comment == "":
		comment = None

	flag = db.session.query(Item).filter_by(listId = listId).filter_by(itemName = itmNm).first()

	if flag == None:	
		result = Item(itmNm, status, comment, dtadd, None, listId)
		db.session.add(result)
		db.session.commit()
		gc.collect()
	
	return jsonify(status = True, jsonData = {"id" : result.id, "name": result.itemName, "comment": result.itemComment, "state": result.itemState})


@app.route('/changeList/', methods = ['GET', 'POST'])
def changeList():
	changeLists = request.json['changeLists']
	for changeList in changeLists:
		listId = changeList['id']
		listName = changeList['lstName']
		listState = changeList['chgLstOpt']
		state = changeList['state']

		now = datetime.datetime.now()
		dtchange = now.date()

		if state == 'U':
			db.session.query(List).filter_by(id = listId).update({"listState" : listState, "listName" : listName, "dtchange" : dtchange})
			db.session.commit()

		updatedLists = db.session.query(List).filter_by(id = listId).first()
		
	return jsonify(status = True)


@app.route('/changeItem/', methods = ['GET', 'POST'])
def changeItem():
	changeItems = request.json['changeItems']
	now = datetime.datetime.now()
	dtchange = now.date()
	for changeItem in changeItems:
		itmId = changeItem['id']
		itmName = changeItem['itmName']
		comment = changeItem['comment']
		chgItmOpt = changeItem['chgItmOpt']
		state = changeItem['state']

		if state == 'U':
			db.session.query(Item).filter_by(id = itmId).update({"itemName" : itmName, "itemComment" : comment, "itemState" : chgItmOpt, "dtchange" : dtchange})
			db.session.commit()

	listId = session['listId']
	items = db.session.query(Item).filter_by(itemState = 'A').filter_by(listId = listId).all()
	jsonData = []
	for item in items:
		jsonData.append({
			"itmName" : item.itemName,
			"itmState" : item.itemState,
			"itmCmt" : item.itemComment,
			"id" : item.id
		})
	return jsonify(status = True, jsonData = jsonData)


@app.route('/changeName/', methods = ['GET', 'POST'])
def changeName():
	firstname = request.json['firstNm']
	lastname = request.json['lastNm']
	persId = session['id']
	now = datetime.datetime.now()
	dtchange = now.date()

	flag =  db.session.query(Person).filter_by(firstname = firstname).filter_by(lastname = lastname).first()
	if flag == None:
		db.session.query(Person).filter_by(id = persId).update({"firstname" : firstname, "lastname" : lastname, "dtchange" : dtchange})
		db.session.commit()
		msg = "This name has changed successfully!"
	else:
		msg = 'Sorry, The name has already existed.'
	jsonData = {"msg" : msg, "firstname" : firstname, "lastname" : lastname}
	print(jsonData)
	return jsonify(status = True, jsonData = jsonData)


@app.route('/createGroup/', methods = ['GET', 'POST'])
def createGroup():
	grpName = request.json['grpName']
	persId = session['id']
	flag = db.session.query(Group).filter_by(grpNm = grpName).first()
	if flag == None:
		result = Group(grpName)

		db.session.add(result)
		db.session.commit()
		gc.collect()

	return jsonify(status = True)


@app.route('/selectGroup/', methods = ['GET', 'POST'])
def selectGroup():
	selectGrp = request.json['selectGrp']
	persId = session['id']
	grpObj = db.session.query(Group).filter_by(grpNm = selectGrp).first()
	grpId = grpObj.id
	
	flag = db.session.query(Morph).filter_by(persId = persId).filter_by(grpId = grpId).first()
	if flag == None:
		result = Morph(persId, grpId)

		db.session.add(result)
		db.session.commit()
		gc.collect()
	return jsonify(status = True)	



if __name__ == '__main__':
	# manager.run()
	app.debug = True
	app.run()