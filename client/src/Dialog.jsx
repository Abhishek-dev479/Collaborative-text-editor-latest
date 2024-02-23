import react, {useState, useRef} from 'react';

export default function Dialog({share, removeDialog, currentUrl, content, userId, documentId}){
    let [url, setUrl] = useState(() => share ? currentUrl : '');
    let [input, setInput] = useState('');
    let inputURL = useRef();
    function copyLink(){
        navigator.clipboard.writeText(url);
        inputURL.current.select();
    }

    function removDialog(){
        removeDialog();
    }


    // useEffect(() => {
    //     if (socket == null || quill == null) return
    //     console.log('save button clicked again');
    //     // const interval = setInterval(() => {
    //     socket.emit("save-document", quill.getContents());
    //     // }, SAVE_INTERVAL_MS)
    
    //     return () => {
    //       // clearInterval(interval)
    //     }
    // }, [save])

    function saveDocument(){
        // socket.emit("save-document", quill.getContents(), inputURL.value);
        if(input.length <= 0) return;
        fetch('http://localhost:3002/save', {method: 'POST',
            headers: {
                "Content-Type": "application/json",
            }, 
            body: JSON.stringify({name: input, id: documentId, contents: content, userId: userId, save: true})
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
        removeDialog();
    }

    return(
        <div id='dialog-backdrop' onClick={removDialog}>
            <div id='dialog' onClick={(e) => {e.stopPropagation()}}>
                <p>{share ? 'Anyone with the link can edit this document' : 'Enter the name of the file:'}</p>
                <input ref={inputURL} value={share ? url: input} type='text' onChange={(event) => {share ? setUrl(event.target.value) : setInput(event.target.value)}}/><br />
                <button onClick={share ? copyLink: saveDocument}>{share ? 'Copy Link' : 'Save Document'}</button>
            </div>
        </div>
    )
}