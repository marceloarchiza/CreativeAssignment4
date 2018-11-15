var express = require('express');
var router = express.Router();
var mongoose = require('mongoose'); 

/* Set up mongoose */
mongoose.connect('mongodb://localhost/commentDB',{ useNewUrlParser: true }); //Connects to a mongo database called "commentDB"

var chatSchema = mongoose.Schema({ //Defines the Schema for this database
    Session: String,
    Name: String,
    Message: String,
    Color:String
});

var Chat = mongoose.model('Chat', chatSchema);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('Connected');
});

router.get("/distict",function(req, res, next) {
    var param=req.query.n;
    Chat.distinct(param,function(err,List){
        if (err)return console.error(err);
        else{
            console.log("sending",List);
            res.json(List);
        }
    });
});

/* POST send message. */
router.post('/chat', function(req, res, next) {
    console.log("POST add message on chat route.");
    console.log(req.body);
    var name=req.query.Name;
    console.log(req.query.Message);
    var color=req.query.Color;
    if (!color){
        Chat.find({Name:name},function(err, commentList) {
            if (err)return console.log(err);
            else{
                console.log('Similar',commentList);
                if(Object.keys(commentList).length==0){
                    color=getRandomColor();
                }
                else{
                    color=commentList[0].Color;
                }
                console.log("color",color);
                var newMessage = new Chat({
                    Name: req.query.Name,
                    Message: req.query.Message,
                    Session: req.query.Session,
                    Color: color
                }); 
                console.log(newMessage); 
                newMessage.save(function(err, post) { 
                    if (err) return console.error(err);
                    console.log("Save Worked. Post:", post);
                    res.sendStatus(200);
                });
            }
        });
        
    }
    else{
    var newMessage = new Chat({
        Name: req.query.Name,
        Message: req.query.Message,
        Session: req.query.Session,
        Color: color
        }); 
    console.log(newMessage); 
    newMessage.save(function(err, post) { 
      if (err) return console.error(err);
      console.log("Save Worked. Post:", post);
      res.sendStatus(200);
    });
    }
});

/* GET messages from all users if no user if given, else give just that user from database. */
router.get('/chat', function(req, res, next) {
    console.log("In the GET route");
    var name=req.query["n"];
    var session=req.query.Session;
    var obj;
    if(name){
        obj={Name:name,Session:session};
        console.log(obj);
    }
    else if(session){
        obj={Session:session};
    }
    console.log("finding",obj);
    Chat.find(obj,function(err,commentList) { //Calls the find() method on your database
        if (err) return console.error(err); //If there's an error, print it out
        else {
            res.json(commentList);
        }
    });
});

/* DELETE an specific message if a message is given as data. */
router.delete('/chat', function(req, res, next) {
    console.log("DELETE an specific message route.");
    var name = req.query.Name;
    var message = req.query.Message;
    var session=req.query.Session;
    var obj;
    if (name){
        obj={Name: name, Message: message, Session: session };
    }
    else if (session){
        obj={Session:session};
    }
    Chat.find().remove(obj, function(err){
        if(err) console.log("Unable to delete user comment. Error: ", err); 
        else res.sendStatus(200); 
    });
});



/* Set module exports to router */
module.exports = router;

function getRandomColor() {
    console.log("getting random color");
  var letters = '6789ABCD';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 7)];
  }
  console.log("color",color);
  return color;
}