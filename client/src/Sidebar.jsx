import react from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'

export default function Sidebar(props){
    function closeSidebar(){
        props.closeSidebar();
    }

    return (
        <div id='sidebar-backdrop' onClick={closeSidebar}>
        <div id="sidebar" onClick={(e) => e.stopPropagation()}>
            <div className='close-icon-div'><FontAwesomeIcon icon={faXmark} className='close-icon' onClick={closeSidebar} /></div>
            {!props.loggedIn ? <button id='login'>Login/Signup</button> :
            <div id='profile'>
                <img src="/save.png" alt="" />
                <div id='details'>
                    <div>Abhisehk Chunduri</div>
                    <div>chunduriabhi@gmail.com</div>
                </div>
            </div>}
        </div>
        </div>
    )
}