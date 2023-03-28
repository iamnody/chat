import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import './App.scss'
import Chat from './pages/Chat'
import Home from './pages/Home'

function App() {
  const [user, setuser] = useState(
    JSON.parse(localStorage.getItem('chat')) || null
  )
  const [city, setcity] = useState('vancouver')

  return (
    <div className='App'>
      <BrowserRouter>
        <Routes>
          <Route
            path='/'
            element={
              <Home
                user={user}
                setuser={setuser}
                city={city}
                setcity={setcity}
              />
            }
          />
          <Route
            path='/chat'
            element={
              user ? (
                <Chat
                  user={user}
                  setuser={setuser}
                  city={city}
                  setcity={setcity}
                  // socket={socket}
                />
              ) : (
                <Navigate to='/' />
              )
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
