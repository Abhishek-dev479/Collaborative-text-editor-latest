const mongoose = require("mongoose")


const { Schema, model } = require("mongoose")

const GLOBAL_URI = 'mongodb+srv://newUser_203:thisisapassword@cluster0.j51fwrw.mongodb.net/db-name?retryWrites=true&w=majority';
const LOCAL_URI = 'mongodb://localhost:27017/documentDB';
mongoose.connect(LOCAL_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

const documentSchema = new Schema({
  _id: String,
  name: String,
  data: Object,
  createdOn: String,
  editedOn: String
})

const userSchema = new Schema({
  _id: String,
  name: String,
  email: String,
  password: String,
  documents: [documentSchema]
})

const Document = mongoose.model('documents', documentSchema);
const User = mongoose.model('users', userSchema);

const io = require("socket.io")(3001, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
})

const defaultValue = ""

// let user = {_id: 'cc863148-e40a-4185-9f28-aa1aef98424d', name:'abhi', email:'abhi@gmail.com', password: 'ddddd', documents: []}
// User.create(user);

let loggedIn = false;

io.on("connection", socket => {
  socket.on("get-document", async (userId, documentId) => {
    const userProfile = await getUser(userId);
    console.log(userProfile);
    if(userProfile != undefined){
      console.log(userProfile.email);
      console.log('getting document from database using documentId');
      const document = await findOrCreateDocument(userProfile, documentId);
      await userProfile.save();
      console.log(userProfile);
      // console.log('doc id: '+document._id);
      // const doc = await find
      socket.join(documentId)
      if(document != undefined) socket.emit("load-document", document.data)

      socket.on("send-changes", delta => {
        socket.broadcast.to(documentId).emit("receive-changes", delta)
      })

      // socket.on("save-document", async (data, name) => {
      //   console.log('saving document');
      //   let docs = userProfile.documents.map((e) => {
      //     if(e._id == documentId){
      //       e.data = data;
      //       e.name = name;
      //     }
      //     return e;
      //   })
      //   userProfile.documents = docs;
      //   await userProfile.save();
      //   // await Document.findByIdAndUpdate(documentId, { data })
      // })
    }
    else{
      console.log('user-profile not found');
      console.log('404 page not found');
    }
  })
})

async function getUser(id){
  let user = await User.findById(id);
  return user;
}

async function findOrCreateDocument(userProfile, id) {
  if (id == null) return
  if(userProfile.documents == null) console.log('no saved documents');
  else{
    let doc = await userProfile.documents.find((e) => e != null && e._id == id);
    console.log('document: '+doc);
    if(doc) return doc;
    else return undefined;
  }
  // else {
  //   let newDoc = {_id: id, name: id, data: defaultValue};
  //   userProfile.documents.push(newDoc);
  //   return newDoc;
  // }
  // const document = await Document.findById(id)
  // if (document) return document
  // else return await Document.create({ _id: id, data: defaultValue })
}

module.exports = User;
