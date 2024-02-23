import react, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import './file.css';

export default function Document({name, userId, docId, createdOn, editedOn, getDocuments}){
    let [display, setDisplay] = useState();
    
    function redirect(){
        window.location.replace('http://localhost:3000/document/'+userId+'/'+docId);
    }

    function deleteFile(){
        fetch('http://localhost:3002/delete', {method: 'POST',
            headers: {
                "Content-Type": "application/json",
            }, 
            body: JSON.stringify({userId: userId, docId: docId})
        })
        .then((res) => {
            return res.json();
        })
        .then((res) => {
            console.log(res);
            getDocuments();
        })
        .catch((err) => {
            console.log(err);
        })
    }

    function showDelete(){
        setDisplay(true);
    }
    function removeDelete(){
        setDisplay(false);
    }

    return (
        <div className='box' onClick={redirect}>
            <div id='image' onMouseOver={showDelete} onMouseLeave={removeDelete}>
                <div id='delete-backdrop' style={{'display': display ? 'flex' : 'none'}}>
                    <FontAwesomeIcon icon={faTrash} id='delete' onClick={deleteFile} />
                </div>
                {/* hello world! */}
            </div>
            <div id='link'>
                <p>Name: {name}</p>
                <p>Created: {createdOn}</p>
                <p>Edited: {editedOn}</p>
            </div>
            
        </div>
    )
}