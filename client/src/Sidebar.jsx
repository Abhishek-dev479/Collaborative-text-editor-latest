import react from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark, faUser } from '@fortawesome/free-solid-svg-icons'
import Document from './Document';
import {Link} from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import './scrollbar.css';

// import {faUser} from 

export default function Sidebar(props){
    console.log(props.userDocs);
    function closeSidebar(){
        props.closeSidebar();
    }

    function createNewFile(){
        window.location.replace(`http://localhost:3000/document/${props.userId}/${uuidv4()}`)
    }

    return (
        <div id='sidebar-backdrop' onClick={closeSidebar}>
        <div id="sidebar" onClick={(e) => e.stopPropagation()} className='custom-scrollbar'>
            <div className='close-icon-div'><FontAwesomeIcon icon={faXmark} className='close-icon' onClick={closeSidebar} /></div>
            {!props.login ? <Link to="http://localhost:3000/login"><button id='login'>Login/Signup</button></Link> :
            <div id='profile'>
                {/* <img src="/save.png" alt="" /> */}
                <FontAwesomeIcon id='user-icon' icon={faUser} />
                <div id='details'>
                    <div>{props.user.name}</div>
                    <div>{props.user.email}</div>
                </div>
            </div>}
            <div id='create-new' onClick={createNewFile}>
                <p id='new'>+</p>
                <p id='new-tagline'>Create New File</p>
            </div>
            {Array.from(props.userDocs).map((e) => {
                return e != null && <Document getDocuments={props.getDocuments} createdOn={e != null && e.createdOn} editedOn={e != null && e.editedOn} userId={props.userId} docId={e != null && e._id}  name={e != null && e.name}></Document>
            })}
        </div>
        </div>
    )
}