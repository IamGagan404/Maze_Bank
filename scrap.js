const express = require('express');
const app = express();
const fs=require('fs');
const bodyParser=require('body-parser');
const userDB=require("C:/Users/Gagan Deshmukh/Desktop/MazeBank/userDB.json")
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended :true}));
app.set('view engine',"ejs");
app.use( express.static( "views" ) );
var notFoundMsg='.';
var currentUser=-1;
var noTransfer='.'
var exist='.';
var found=-1;
function checker(fUser,fPass){
  var userBool=0
  var passBool=0
  for(var i=0; i < userDB.length;i++){
      if (fUser==userDB[i].name){
          // console.log('user found');
          userBool=1;
          currentUser=i
          break;
         
      }
      if (i==userDB.length-1 && fUser != userDB[i].name){
          // console.log('user not found')
          return 0;
      }
  }
  if (userBool=1){
      if (fPass==userDB[currentUser].password){
          // console.log('pass matched')
          passBool=1
      }
      else if (fPass!=userDB[currentUser].password){
          // console.log('pass not matched')
      }
  }
  if (userBool==1 && passBool==1){
      return 1
  }
  else{
      return 0
  }
};

function userCheck(DB,check){
    //return 1 if user NOT present else 0
    for(var i=0;i<DB.length;i++){
        if(check==DB[i].name){
            found=i;
            return 0;
        }
    }
    return 1
};

function historyMaker(DB,amt,userNumber){
    var hisArray=DB[userNumber].history;
    hisArray.unshift(amt);
    DB[userNumber].history=hisArray
};

app.get('/',(req,res)=>{
    res.render('home',{notFoundMsg});
    
});

app.post('/',(req,res)=>{
    res.render('home',{notFoundMsg});
});

app.post('/user', (req, res) => {
    var u=req.body.try
    var p=req.body.try2
    var auth=checker(u,p)
    if(auth==1){
      console.log(auth)
      res.render('user',{user:userDB[currentUser]});
    }
    if(auth==0){
      console.log('foundnot');
      var notFoundMsg='Username and password doesn,t match';
      res.render('home',{notFoundMsg});
      notFoundMsg='.'
    };
    res.end();
});

app.post('/user/withdraw',(req,res)=>{
    res.render('withdrawPage',{user:userDB[currentUser]})
});

app.post('/user/withdraw1',(req,res)=>{
    var value=req.body.withdrawValue;
    value=Number(value);
    if(value >=userDB[currentUser].balance){
        userDB[currentUser].balance =0;
    }else{
        userDB[currentUser].balance -= value;
    };
    historyMaker(userDB,-value,currentUser)
    var withdate=Date()
    userDB[currentUser].date.unshift(withdate)
    fs.writeFile('C:/Users/Gagan Deshmukh/Desktop/MazeBank/UserDB.json',JSON.stringify(userDB),err=>{
        if (err) throw err;
    });
    res.render('user',{user:userDB[currentUser]});
});

app.post('/user/deposit',(req,res)=>{
    res.render('depositPage',{user:userDB[currentUser]})
});

app.post('/user/deposit1',(req,res)=>{
    value=req.body.depositValue;
    value=Number(value);
    
    userDB[currentUser].balance += value;
    historyMaker(userDB,value,currentUser)
    var depdate=Date();
    userDB[currentUser].date.unshift(depdate);
    fs.writeFile('C:/Users/Gagan Deshmukh/Desktop/MazeBank/userDB.json',JSON.stringify(userDB),err=>{
        if (err) throw err;
    });
    res.render('user',{user:userDB[currentUser]});
});

app.post('/newUser',(req,res)=>{
    res.render('newUser',{exist});
});

app.post('/confirm',(req,res)=>{
    var exist='.';
    var user=req.body.username;
    var pass=req.body.pass;
    var balance =req.body.balance;
   
    balance=Number(balance);
    if(userCheck(userDB,user)==1){
        userDB.push({'name':user,'password':pass,'balance':balance,'history':[0,0,0,0,0],'date':[]});
        fs.writeFile('C:/Users/Gagan Deshmukh/Desktop/MazeBank/userDB.json',JSON.stringify(userDB),err=>{
            if (err) throw err;
        })
        res.render('home',{notFoundMsg});
    }
    else if(userCheck(userDB,user)==0){
        exist='UserName Exist'
        res.render('newUser',{exist})
    }
    
});

app.post('/user/transfer',(req,res)=>{
    res.render('transferPage',{user:userDB[currentUser]})
});

app.post('/user/transfer1',(req,res)=>{
    var value=req.body.transferValue
    var toUser=req.body.toUser
    value=Number(value)
    if(userCheck(userDB,toUser)==0 ){
        if(value <= userDB[currentUser].balance){
            userDB[found].balance += value;
            userDB[currentUser].balance -= value
        }
        else if(value > userDB[currentUser].balance){
            //display msg  transfer beyond balance
            value=userDB[currentUser].balance
            userDB[found].balance += value;
            userDB[currentUser].balance=0;
        }
        historyMaker(userDB,-value,currentUser);
        historyMaker(userDB,value,found);
        var transdate='!'+Date();
        userDB[currentUser].date.unshift(transdate);
        userDB[found].date.unshift(transdate);
        fs.writeFile('C:/Users/Gagan Deshmukh/Desktop/MazeBank/userDB.json',JSON.stringify(userDB),err=>{
            if (err) throw err;
        });
        res.render('user',{user:userDB[currentUser]});
    }
    else if(userCheck(userDB,toUser)==1){
        //msg transfer not done
        noTransfer='Sorry, User not found.'
        res.render('transferPage',{noTransfer:noTransfer})
    }
});

app.post('/user/details',(req,res)=>{
    var detail
    var line
    var hii=[]
    var cdate= 'Acoount created on '+ userDB[currentUser].createDate.slice(0,3)+'day, '+userDB[currentUser].createDate.slice(4,15) +' at '+userDB[currentUser].createDate.slice(16,24)
    for(var i=0;i<userDB[currentUser].history.length;i++){
        if(userDB[currentUser].history[i]>=0 && userDB[currentUser].date[i][0] =='!'){
            line=userDB[currentUser].history[i]+' rs. was transferd to you on '+ userDB[currentUser].date[i].slice(1,4)+'day, '+userDB[currentUser].date[i].slice(5,16) +' at '+userDB[currentUser].date[i].slice(17,25)
            hii.unshift(line)
            line=''
        }
        if(userDB[currentUser].history[i]>=0 && userDB[currentUser].date[i][0] != '!'){
            line=userDB[currentUser].history[i] +' rs. was deposited on '+ userDB[currentUser].date[i].slice(0,3)+'day, '+userDB[currentUser].date[i].slice(4,15) +' at '+userDB[currentUser].date[i].slice(16,24)
            hii.unshift(line)
            line=''
        }
        else if(userDB[currentUser].history[i]<0 && userDB[currentUser].date[i][0]=='!' ){
            line=-1*userDB[currentUser].history[i]+' rs. was transferd by you on '+ userDB[currentUser].date[i].slice(1,4)+'day, '+userDB[currentUser].date[i].slice(5,16) +' at '+userDB[currentUser].date[i].slice(17,25)
            hii.unshift(line)
            line=''
        }
        else if(userDB[currentUser].history[i]<0 && userDB[currentUser].date[i][0] !='!' ){
            line=-1*userDB[currentUser].history[i] +' rs. was withdrawn on '+ userDB[currentUser].date[i].slice(0,3)+'day, '+userDB[currentUser].date[i].slice(4,15) +' at '+userDB[currentUser].date[i].slice(16,24)
            hii.unshift(line)
            line=''
        }
    }
    res.render('detailsPage',{hii:hii,cdate:cdate})
});

console.log(userDB)
app.listen(6004, () => {
    console.log(`Server running on port`);
  });