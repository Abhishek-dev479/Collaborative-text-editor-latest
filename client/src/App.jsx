import React, { useEffect, useState } from 'react';
import Editor  from './Editor';
import './styles.css';
import './login.css';
import {BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate} from 'react-router-dom';
import {v4 as uuid} from 'uuid';
import Dialog from './Dialog';
import { io } from 'socket.io-client';
import cookies from 'js-cookie';

function App(){
    // function checkCookie(){
    //     cookies.get()
    // }
    return(
        <Router>
            <Routes>
                <Route path="/" exact element={<Navigate to="/login" replace={true}/>}>
                </Route>
                <Route path="/document/:userid/:docid" element={<Editor/>}></Route>
                <Route path="/login" element={<Login/>}></Route>
                <Route path="/signup" element={<Signup/>}></Route>
            </Routes>
        </Router>
    )
}


function Login(){
    let [message, setMessage] = useState();
    let [input, setInput] = useState({email: '', password: ''});
    function getLogin(){
        // console.log(username+" "+password);
        if(input.email.length <= 0 || input.password.length <= 0) {
            setMessage('Too Short');
            return;
        }
        console.log('fetching request...');
        fetch('http://localhost:3002/login', {method: 'POST',
            headers: {
                "Content-Type": "application/json",
            }, 
            body: JSON.stringify({email: input.email, password: input.password})
        })
        .then((res) => {
            return res.json();
        })
        .then((res) => {
            console.log(res);
            if(res.userId != undefined){
                cookies.set('username', input.email);
                cookies.set('password', input.password);
                window.location.replace("http://localhost:3000/document/"+res.userId+'/'+uuid(), {replace: true});
            }
            else setMessage('Wrong username or password');
        })
        .catch((err) => {
            console.log(err);
            setMessage('error');
        })
    }

    function changeInput(event){
        // console.log(event.target.value);
        setInput((prev) => {
            return {...prev, [event.target.name]: event.target.value}
        })
    }
    return (
        <div className='div1'>
            <input type="text" placeholder='Email' name='email' onChange={changeInput}/>
            <input type="password" placeholder='Password' name='password' onChange={changeInput}/>
            <button onClick={getLogin}>Login</button>
            <br />
            <div id='div5'><h4>Don't have an account? </h4><Link to={'http://localhost:3000/signup'}>Sign Up</Link></div>
            <p id='message'>{message}</p>
        </div>
    )
}

function Signup(){
    let [input, setInput] = useState({username: '', email: '', password: ''}    );
    let [message, setMessage] = useState();
    function signup(){
        console.log(input.username);
        if(input.username.length <= 0 || input.password.length <= 0) {
            setMessage('Too Short');
            return;
        }
        // console.log(username+" "+password);
        console.log('fetching request...');
        fetch('http://localhost:3002/signup', {method: 'POST',
            headers: {
                "Content-Type": "application/json",
            }, 
            body: JSON.stringify({email: input.email, password: input.password, username: input.username})
        })
        .then((res) => {
            return res.json();
        })
        .then((res) => {
            console.log(res);
            if(res.message == 'success'){
                cookies.set('username', input.email);
                cookies.set('password', input.password);
                window.location.replace("http://localhost:3000/document/"+res.userId+'/'+uuid(), {replace: true});
            }
            else setMessage(res.message);
        })
        .catch((err) => {
            console.log(err);
        })
    }
    function changeInput(event){
        // console.log(event.target.value);
        setInput((prev) => {
            return {...prev, [event.target.name]: event.target.value}
        })
    }
    return (
        <div className='div1'>
            <input type="text" placeholder='Username' name="username" onChange={changeInput} required/>
            <input type="email" placeholder='Email' name='email' onChange={changeInput} required/>
            <input type="password" placeholder='Password' name='password' onChange={changeInput} required/>
            <button onClick={signup}>Signup</button>
            <br />
            <div id='div5'><h4>Already have an account? </h4><Link to={'http://localhost:3000/login'}>Login</Link></div>
            <p id='message'>{message}</p>
        </div>
    )
}

export default App;