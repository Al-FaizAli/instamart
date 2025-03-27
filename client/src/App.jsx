import React from 'react'
import './App.css'
import Navbar from "./components/Navbar/Navbar"
import Home from './pages/Home/Home'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ProductsPage from './pages/Products/Products'
import MyCart from './pages/Cart/Cart'
import SearchResults from './pages/SearchResults/SearchResults'
const App = () => {
  return (
    <Router>
      <div className='App'>
        <Navbar />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/cart' element={<MyCart />} />
          <Route path='/department/:departmentId' element={<ProductsPage />} />
          <Route path='/search' element={<SearchResults />} />
        </Routes>
        {/* <CategoryCards /> */}
      </div>
    </Router>
  )
}

export default App