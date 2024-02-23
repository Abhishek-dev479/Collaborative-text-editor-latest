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
import Cookies from 'js-cookie';

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
  const { docid: documentId, userid: userId } = useParams();
  const [socket, setSocket] = useState()
  const [quill, setQuill] = useState()
  let [dialog, setDialog] = useState([false, true]);
  let [url, setUrl] = useState('http://localhost:3000'+useLocation().pathname);
  let [save, setSave] = useState(true);
  let [sidebar, setSidebar] = useState(false);
  let [login, setLogin] = useState(false);
  let [userDocs, setUserDocs] = useState({});
  let [content, setContent] = useState();
  let [user, setUser] = useState();

  function getDocuments(){
    fetch('http://localhost:3002/documents/'+userId, {method: 'GET'})
    .then((res) => res.json())
    .then((res) => {
      console.log(res);
      if(res.docs == null) console.log('no saved documents');
      else setUserDocs(res.docs);
    })
  }

  function saveExistingDocument(){
    console.log(content);
    // socket.emit("save-document", quill.getContents(), inputURL.value);
    fetch('http://localhost:3002/save', {method: 'POST',
        headers: {
            "Content-Type": "application/json",
        }, 
        body: JSON.stringify({id: documentId, contents: content, userId: userId, save: true})
    })
    .then((res) => {
        return res.json();
    })
    .then((res) => {
        console.log(res);
        
    })
    .catch((err) => {
        console.log(err);
    })
}

// useEffect(() => {
//   if (socket == null || quill == null) return;
//   console.log('saving......');
//   fetch('http://localhost:3002/save', {method: 'POST',
//         headers: {
//             "Content-Type": "application/json",
//         }, 
//         body: JSON.stringify({id: documentId, contents: quill.getContents(), userId: userId, save: true, new: false})
//     })
//     .then((res) => {
//         return res.json();
//     })
//     .then((res) => {
//         console.log(res);
        
//     })
//     .catch((err) => {
//         console.log(err);
//     })
// }, [socket, quill])

  function saveDocument(){
    fetch('http://localhost:3002/save', {method: 'POST',
            headers: {
                "Content-Type": "application/json",
            }, 
            body: JSON.stringify({name: 'file', id: documentId, contents: content, userId: userId, save: false})
        })
        .then((res) => {
            return res.json();
        })
        .then((res) => {
            console.log(res);
            if(res.message == 'false'){
              setDialog([true, false]);
            }
            else{
              // saveExistingDocument();
            }
        })
        .catch((err) => {
            console.log(err);
        })
  }


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

    socket.emit("get-document", userId, documentId)
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
      console.log(quill.getContents());
      // console.log(content);
      setContent(quill.getContents());
    }
    quill.on("text-change", handler)

    return () => {
      quill.off("text-change", handler)
    }
  }, [socket, quill])

  useEffect(() => {
    if (socket == null || quill == null) return;
    function handle(){
      console.log('saving......'+documentId);
      fetch('http://localhost:3002/save', {method: 'POST',
          headers: {
              "Content-Type": "application/json",
          }, 
          body: JSON.stringify({id: documentId, contents: quill.getContents(), userId: userId, save: true, new: false})
      })
      .then((res) => {
          return res.json();
      })
      .then((res) => {
          console.log(res);
          
      })
      .catch((err) => {
          console.log(err);
      })
    }

    quill.on("text-change", handle)

    return () => {
      quill.off("text-change", handle)
    }
  }, [socket, quill, documentId, userId])

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
        // saveDocument();
    })
    return div;
  }

  // function saveDocument(){
  //     // if(socket == null) console.log('still null');
  //     console.log('saving docs.....');
  //     // let content = quill.getContents();
  //     // socket.emit('save-document', content);
  //     // socket.on('save-new-document', () => {
  //     //     setDialog([true, false]);
  //     // })
  //     setSave((prev)=>{
  //       return !prev;
  //     })
  //     setDialog([true, false]);
  //     // console.log(save);
  // }

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
    if(login) getDocuments();
    setSidebar(true);
  }

  useEffect(() => {
    console.log(save);
  }, [save]);

  useEffect(() => {
    fetch('http://localhost:3002/getcreds', {method: 'POST',
          headers: {
              "Content-Type": "application/json",
          }, 
          body: JSON.stringify({userId: userId})
      })
      .then((res) => {
          return res.json();
      })
      .then((res) => {
          console.log(res);
          let username = Cookies.get('username');
          let password = Cookies.get('password');
          if(res.email == username && res.password == password){
            setUser(res);
            setLogin(true);
          }
          else setLogin(false);
          // else{
          //   window.location.replace("http://localhost:3000/login", {replace: true});
          // }
      })
      .catch((err) => {
          console.log(err);
      })
  }, [])

  return (
    <div>
      <div id="container" ref={wrapperRef}>
        {dialog[0] && <Dialog saveExistingDocument={saveExistingDocument} share={dialog[1]} content={content} userId={userId} documentId={documentId} currentUrl={url} removeDialog={removeDialog} socket={socket} quill={quill}></Dialog>}
      </div>
      {sidebar ? <Sidebar getDocuments={getDocuments} userId={userId} docId={documentId} userDocs = {userDocs} closeSidebar={closeSidebar} login = {login} user={user}></Sidebar> : <FontAwesomeIcon icon={faBars} className='open-icon' onClick={openSidebar} />}
    </div>
  )
}
