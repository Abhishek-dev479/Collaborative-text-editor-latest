const mongoose = require("mongoose")

const { Schema, model } = require("mongoose")

mongoose.connect("mongodb://localhost:27017/documentDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

const documentSchema = new Schema({
  _id: String,
  data: Object,
})

Document = mongoose.model('documents', documentSchema)

const io = require("socket.io")(3001, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
})

const defaultValue = ""

io.on("connection", socket => {
  socket.on("get-document", async documentId => {
    console.log('getting document from database using documentId');
    const document = await findOrCreateDocument(documentId)
    socket.join(documentId)
    socket.emit("load-document", document.data)

    socket.on("send-changes", delta => {
      socket.broadcast.to(documentId).emit("receive-changes", delta)
    })

    socket.on("save-document", async data => {
      console.log('saving document');
      await Document.findByIdAndUpdate(documentId, { data })
    })
  })
})

async function findOrCreateDocument(id) {
  if (id == null) return

  const document = await Document.findById(id)
  if (document) return document
  return await Document.create({ _id: id, data: defaultValue })
}
