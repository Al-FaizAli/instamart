import React from 'react';
import './App.css';
import Navbar from "./components/Navbar/Navbar";
import Home from './pages/Home/Home';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProductsPage from './pages/Products/Products';
import MyCart from './pages/Cart/Cart';
import SearchResults from './pages/SearchResults/SearchResults';
import { AuthProvider } from './context/AuthContext';
import LoginSignup from './components/LoginSignup/LoginSignup';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className='App'>
          <Navbar />
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/login' element={<LoginSignup />} />
            <Route path='/cart' element={<MyCart />} />
            <Route path='/aisle/:aisleId' element={<ProductsPage />} />
            <Route path='/search' element={<SearchResults />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;