const express = require('express');
const app = express();
const User = require('./index.js');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors({origin: '*'}));

function getDate(){
    const currentDate = new Date();
    const date = currentDate.getDate();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    const hours = currentDate.getHours();
    const minutes = currentDate.getMinutes();
    const seconds = currentDate.getSeconds();
    return `${hours}:${minutes} ${year}-${month}-${date}`;
}

let userdetails = null;

app.get('/hello', (req, res) => {
    res.send('hello');
})

app.post('/login', async (req, res, next) => {
    let email = req.body.email;
    let password = req.body.password;
    console.log('post request arrived');
    let doc = await User.findOne({email: email})
    console.log(email+' '+password);
    console.log('document: '+doc);
    if(doc == undefined) res.json({msg: 'no user', userId: undefined});
    else {
        if(doc.password == password){
            res.json({msg: '', userId: doc._id});
            userdetails = doc;
        } 
        else res.json({msg: 'incorrect password', userId: undefined});
    }
})

app.post('/signup', async (req, res) => {
    let email = req.body.email;
    let user = undefined;
        user = await User.find({email: email});
        console.log(user.length);
        if(user.length != 0) res.json({message: 'user exists'});
        else{
            let newUser = new User({
                _id: uuidv4(),
                email: email,
                name: req.body.username,
                password: req.body.password
            });
            let u = await newUser.save();
            console.log(u);
            if(u != undefined){
                res.json({message: 'success', userId: u._id});
                userdetails = newUser;
            } 
            else res.json({message: 'error'});
        }
    // console.log(user);
    // if(user != undefined) res.json({message: 'user exists'});
    // else{
    //     let newUser = new User({
    //         email: email,
    //         name: req.body.username,
    //         password: req.body.password
    //     });
    //     let u = await newUser.save();
    //     if(u != undefined) res.json({message: 'success'});
    //     else res.json({message: 'error'});
    // }
})

app.post('/save', async (req, res) => {
    let userId = req.body.userId;
    let name = req.body.name;
    let id = req.body.id;
    let content = req.body.contents;
    let save = req.body.save;
    let newFile = req.body.new;
    let userProfile = await User.findById(userId);
    console.log('user profile-----------'+userProfile);
    if(userProfile == undefined) res.json({message: 'error'});
    let flag = 0;
    if(save == false){
        userProfile.documents.map((e) => {
            if(e != null && e._id == id){
                flag = 1;
            }
        })
        if(flag == 0){
            res.json({message: 'false'})
        }
        else{
            res.json({message: 'true'});
        }
    }
    else{

        console.log('========'+userProfile.documents);
        let flag = 0;
        let docs = userProfile.documents.map((e) => {
            // console.log('***** '+e._id+'||'+id);
            if(e != null && e._id == id){
                console.log('====()(((((((((((((())'+req.body.contents);
                e.editedOn = getDate();
                e.data = content;
                // e.name = name;
                flag = 1;
            }
            return e;
        })
        console.log('flag: '+flag+' '+content);
        if(flag == 0 && newFile != false){
            let doc = {
                _id: id,
                name: name,
                data: content,
                createdOn: getDate(),
                editedOn: getDate()
            }
            console.log(doc);
            docs.push(doc);
        }
        console.log(docs);
        userProfile.documents = docs;
        userProfile.save();
        res.json({message: 'success'});
    }
    // else if(userProfile.documents == undefined)
    // else{
    //     let flag = 0;
    //     console.log('========'+userProfile.documents);
    //     let docs = userProfile.documents.map((e) => {
    //         if(e._id == id){
    //         e.data = content;
    //         e.name = name;
    //         flag = 1;
    //         }
    //     })
    //     if(flag != 0){
    //         userProfile.documents = docs;
    //         userProfile.save();
    //         res.json({message: 'success'});
    //     }
    //     else{
    //         res.json({message: 'newfile'});
    //     }
    // }
})

app.get('/documents/:userid', async (req, res) => {
    let userid = req.params.userid;
    let docs = await getUserDocuments(userid);
    res.json({docs: docs});
})

app.post('/getcreds', async (req, res) => {
    let userid = req.body.userId;
    let user = await User.findById(userid);
    if(user == undefined) res.json({message: 'error'});
    else {
        userdetails = user;
        res.json(user);
    }
})

app.post('/delete', async (req, res) => {
    let docId = req.body.docId;
    let userId = req.body.userId;
    let user = await User.findById(userId);
    if(user != null){
        console.log(docId);
        user.documents = user.documents.map((e) => {
            if(e != null && e._id != docId){
                return e;
            }
        })
        user.save();
    }
})


async function getUserDocuments(id){
    let user = await User.findById(id);
    console.log(user);
    return user.documents;
}

  
app.listen(3002, (err) => {
    if(!err) console.log('server listening on 3002...');
})
  
