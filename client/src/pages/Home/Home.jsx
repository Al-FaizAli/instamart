import React from 'react'
import './Home.css'
import Departments from '../../components/Departments/Departments'
import HeroSection from '../../components/Hero/Hero'
import Recommendations from '../../components/Recommendations/Recommendations'

export default function Home() {
    return (
        <div className='home'>
            <HeroSection />
            <Departments />
            <Recommendations />
        </div>
    )
}