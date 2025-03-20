import React from 'react'
import './App.css'
import Navbar from "./components/Navbar/Navbar"
import Home from './pages/Home/Home'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ProductsPage from './pages/Products/Products'
const App = () => {
  return (
    <Router>
      <div className='App'>
        <Navbar />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/department/:department' element={<ProductsPage />} />
        </Routes>
        {/* <CategoryCards /> */}
      </div>
    </Router>
  )
}

export default App