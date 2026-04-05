import React from 'react'
import './Home.css'
import Aisles from '../../components/Aisles/Aisles'
import HeroSection from '../../components/Hero/Hero'
import PersonalizedSections from '../../components/Recommendations/PersonalizedSections'
import Footer from '../../components/Footer/Footer'

import PopularProducts from '../../components/PopularProducts/PopularProducts'

export default function Home() {
    return (
        <div className='home'>
            <HeroSection />
            <Aisles />
            <PopularProducts />
            <PersonalizedSections />
            <Footer />
        </div>
    )
}
