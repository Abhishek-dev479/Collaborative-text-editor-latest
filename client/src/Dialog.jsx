import react, {useState, useRef} from 'react';

export default function Dialog(props){
    let [url, setUrl] = useState(() => props.share ? props.url : '');
    let inputURL = useRef();
    function copyLink(){
        navigator.clipboard.writeText(url);
        inputURL.current.select();
    }

    function removeDialog(){
        props.removeDialog();
    }
    return(
        <div id='dialog-backdrop' onClick={removeDialog}>
            <div id='dialog' onClick={(e) => {e.stopPropagation()}}>
                <p>{props.share ? 'Anyone with the link can edit this document' : 'Enter the name of the file:'}</p>
                <input ref={inputURL} value={url} type='text' onChange={(event) => {setUrl(event.target.value)}}/><br />
                <button onClick={copyLink}>{props.share ? 'Copy Link' : 'Save Document'}</button>
            </div>
        </div>
    )
}