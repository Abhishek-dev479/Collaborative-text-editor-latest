import React, { useEffect, useState } from 'react';
import Editor  from './Editor';
import './styles.css';
import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import {v4 as uuid} from 'uuid';
import Dialog from './Dialog';
import { io } from 'socket.io-client';
import cookies from 'js-cookie';

function App(){
    return(
        <Router>
            <Routes>
                <Route path="/" exact element={<Navigate to={"/documents/"+uuid()} replace={true}/>}>
                </Route>
                <Route path="/documents/:id" element={<Editor/>}></Route>
            </Routes>
        </Router>
    )
}

export default App;