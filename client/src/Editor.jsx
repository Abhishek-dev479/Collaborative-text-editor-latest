import react,{useCallback, useEffect, useRef, useState} from 'react';
import Quill from 'quill';
import "quill/dist/quill.snow.css";
import { io } from 'socket.io-client';
import {useParams, useLocation} from 'react-router-dom';
import Dialog from './Dialog';
import save from './save.png';
import Sidebar from './Sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars } from '@fortawesome/free-solid-svg-icons'
import cookies from 'js-cookie';

const SAVE_INTERVAL_MS = 2000
const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ font: [] }],
  [{ list: "ordered" }, { list: "bullet" }],
  ["bold", "italic", "underline"],
  [{ color: [] }, { background: [] }],
  [{ script: "sub" }, { script: "super" }],
  [{ align: [] }],
  ["image", "blockquote", "code-block"],
  ["clean"],
]

export default function Editor() {
  const { id: documentId } = useParams()
  const [socket, setSocket] = useState()
  const [quill, setQuill] = useState()
  let [dialog, setDialog] = useState([false, true]);
  let [url, setUrl] = useState('http://localhost:3000'+useLocation().pathname);
  let [save, setSave] = useState(true);
  let [sidebar, setSidebar] = useState(false);
  let [logIn, setLogin] = useState(false);

  useEffect(() => {
    const s = io("http://localhost:3001")
    setSocket(s)
    return () => {
      s.disconnect()
    }
  }, [])

//   console.log(socket.id);

  useEffect(() => {
    if (socket == null || quill == null) return

    socket.once("load-document", document => {
      quill.setContents(document)
      // quill.enable()
    })

    socket.emit("get-document", documentId)
  }, [socket, quill, documentId])

  useEffect(() => {
    if (socket == null || quill == null) return
    console.log('save button clicked again');
    // const interval = setInterval(() => {
    socket.emit("save-document", quill.getContents());
    // }, SAVE_INTERVAL_MS)

    return () => {
      // clearInterval(interval)
    }
  }, [save])

  useEffect(() => {
    if (socket == null || quill == null) return

    // console.log('hello connected....');
    const handler = delta => {
      quill.updateContents(delta)
    }
    socket.on("receive-changes", handler)

    return () => {
      socket.off("receive-changes", handler)
    }
  }, [socket, quill])

  useEffect(() => {
    if (socket == null || quill == null) return

    const handler = (delta, oldDelta, source) => {
      if (source !== "user") return
      socket.emit("send-changes", delta)
    }
    quill.on("text-change", handler)

    return () => {
      quill.off("text-change", handler)
    }
  }, [socket, quill])

  const wrapperRef = useCallback(wrapper => {
    if (wrapper == null) return
    wrapper.innerHTML = ""
    const editor = document.createElement("div")
    wrapper.append(editor)
    const q = new Quill(editor, {
      theme: "snow",
      modules: { toolbar: TOOLBAR_OPTIONS },
    })
    // q.disable()
    // q.setText("Loading...")
    setQuill(q)
    let k = document.getElementsByClassName('ql-toolbar')[0]; 
    let img = createImage();
    k.append(img);
    let button = createButton();
    k.append(button)
  }, [])

  function createButton(){
    let div =  document.createElement('button');
    div.classList.add('ql-formats');
    div.textContent = 'Share'
    div.setAttribute('id', 'but');
    div.addEventListener('click', () => {
        console.log('save clicked');
        setDialog([true, true]);
        saveDocument();
    })
    return div;
  }

  function saveDocument(){
      // if(socket == null) console.log('still null');
      console.log('saving docs.....');
      // let content = quill.getContents();
      // socket.emit('save-document', content);
      // socket.on('save-new-document', () => {
      //     setDialog([true, false]);
      // })
      setSave((prev)=>{
        return !prev;
      })
      // console.log(save);
  }

  function createImage(){
      console.log('save image created');
      let img = document.createElement('img');
      img.setAttribute('src', '/save.png');
      img.setAttribute('id', 'img-save');
      img.classList.add('ql-formats'); 
      img.addEventListener('click', () => {
          console.log('save image clicked');
          saveDocument();
      })
      return img;
  }

  function removeDialog(){
    setDialog([false, true]);
  }

  function closeSidebar(){
    setSidebar(false);
  }

  function openSidebar(){
    setSidebar(true);
  }

  useEffect(() => {
    console.log(save);
  }, [save]);

  return (
    <div>
      <div id="container" ref={wrapperRef}>
        {dialog[0] && <Dialog share={dialog[1]} url={url} removeDialog={removeDialog}></Dialog>}
      </div>
      {sidebar ? <Sidebar closeSidebar={closeSidebar}></Sidebar> : <FontAwesomeIcon icon={faBars} className='open-icon' onClick={openSidebar} />}
    </div>
  )
}
