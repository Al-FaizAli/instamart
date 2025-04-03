import React from 'react'
import './Home.css'
import Aisles from '../../components/Aisles/Aisles'
import HeroSection from '../../components/Hero/Hero'
import Recommendations from '../../components/Recommendations/Recommendations'
import Footer from '../../components/Footer/Footer'

export default function Home() {
    return (
        <div className='home'>
            <HeroSection />
            <Aisles />
            <Recommendations />
            <Footer />
        </div>
    )
}