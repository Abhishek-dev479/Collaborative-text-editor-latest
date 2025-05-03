// server.js

const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");
const { Schema, model } = require("mongoose");

// MongoDB Connection
const LOCAL_URI = "mongodb://localhost:27017/documentDB";
mongoose.connect(LOCAL_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define schemas
const documentSchema = new Schema({
  _id: String,
  name: String,
  data: Object,
  createdOn: String,
  editedOn: String,
});

const userSchema = new Schema({
  _id: String,
  name: String,
  email: String,
  password: String,
  documents: [documentSchema],
});

const User = mongoose.model("users", userSchema);
const Document = mongoose.model("documents", documentSchema);

// Initialize Express app
const app = express();

// Create HTTP server for both REST API and WebSocket
const server = http.createServer(app);

// Initialize Socket.IO for WebSocket communication
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "*" }));

// WebSocket setup (real-time editing)
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("get-document", async (userId, documentId) => {
    const userProfile = await getUser(userId);
    if (userProfile) {
      const document = await findOrCreateDocument(userProfile, documentId);
      socket.join(documentId);

      if (document) socket.emit("load-document", document.data);

      socket.on("send-changes", (delta) => {
        socket.broadcast.to(documentId).emit("receive-changes", delta);
      });
    } else {
      console.log("User not found");
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// HTTP Routes

// Route to say hello
app.get("/hello", (req, res) => {
  res.send("hello");
});

// User login route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && user.password === password) {
    res.json({ msg: "", userId: user._id });
  } else {
    res.json({ msg: "Incorrect credentials", userId: undefined });
  }
});

// User signup route
app.post("/signup", async (req, res) => {
  const { email, username, password } = req.body;
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.json({ message: "User exists" });
  } else {
    const newUser = new User({
      _id: uuidv4(),
      email,
      name: username,
      password,
    });
    await newUser.save();
    res.json({ message: "success", userId: newUser._id });
  }
});

// Save document route
app.post('/save', async (req, res) => {
    console.log('saving the file...')
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

// Get documents for a user
app.get("/documents/:userid", async (req, res) => {
  const userId = req.params.userid;
  const user = await User.findById(userId);
  res.json({ docs: user ? user.documents : [] });
});

// Delete document route
app.post("/delete", async (req, res) => {
  const { docId, userId } = req.body;
  const user = await User.findById(userId);
  if (user) {
    user.documents = user.documents.filter((doc) => doc._id !== docId);
    await user.save();
    res.json({ message: "Document deleted" });
  } else {
    res.json({ message: "User not found" });
  }
});

// Helper functions
async function getUser(id) {
  return await User.findById(id);
}

async function findOrCreateDocument(userProfile, id) {
  if (!id) return;
  let doc = userProfile.documents.find((doc) => doc._id === id);
  if (doc) return doc;
  return undefined;
}

function getDate() {
  const currentDate = new Date();
  return `${currentDate.getHours()}:${currentDate.getMinutes()} ${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`;
}

// Start server
server.listen(3001, () => {
  console.log("Server (HTTP + WebSocket) running on port 3001");
});
