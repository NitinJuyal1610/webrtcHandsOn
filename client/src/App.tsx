// import { useState } from 'react';
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Sender from './components/Sender';
import Reciever from './components/Receiver';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/sender" element={<Sender />} />
          <Route path="/receiver" element={<Reciever />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
