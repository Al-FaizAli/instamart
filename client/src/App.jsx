import React from 'react'
import './App.css'
import Navbar from "./components/Navbar/Navbar"
import Home from './pages/Home/Home'
import CategoryCards from './apitest'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
const App = () => {
  return (
    <Router>
      <div className='App'>
        <Navbar />
        <Routes>
          <Route path='/' element={<Home />} />
        </Routes>
        <CategoryCards />
      </div>
    </Router>
  )
}

export default App