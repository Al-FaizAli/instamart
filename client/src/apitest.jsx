import React, { useEffect, useState } from 'react';
import axios from 'axios';
const CategoryCards = () => {
    const [categories, setCategories] = useState([
        "Dairy, Bread & Eggs",
        "Fruits & Vegetables",
        "Cold Drinks & Juices",
        "Snacks & Munchies",
        "Breakfast & Instant Food",
        "Sweet Tooth",
        "Bakery & Biscuits",
        "Tea, Coffee & Health Drink",
        "Atta, Rice & Dal",
        "Masala, Oil & More",
        "Sauces & Spreads",
        "Chicken, Meat & Fish",
        "Organic & Healthy Living",
        "Baby Care",
        "Pharma & Wellness",
        "Cleaning Essentials",
        "Home & Office",
        "Personal Care",
        "Pet Care"
    ]);

    const [images, setImages] = useState({});
    const [loading, setLoading] = useState(false);

    const ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

    const fetchImages = async () => {
        setLoading(true);
        const imageData = {};

        for (const category of categories) {
            try {
                const response = await axios.get(
                    `https://api.unsplash.com/search/photos?query=${category}&client_id=${ACCESS_KEY}&per_page=1`
                );

                if (response.data.results.length > 0) {
                    imageData[category] = response.data.results[0].urls.regular;
                } else {
                    imageData[category] = null;
                }
            } catch (error) {
                console.error(`Error fetching image for ${category}:`, error);
                imageData[category] = null;
            }
        }

        setImages(imageData);
        setLoading(false);
    };

    useEffect(() => {
        fetchImages();
    }, []);

    return (
        <div style={{ padding: '20px' }}>
            <h1>Paan Corner</h1>
            {loading ? (
                <p>Loading ...</p>
            ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                    {categories.map((category, index) => (
                        <div key={index} style={{ border: '1px solid #ddd', borderRadius: '10px', padding: '10px', width: '200px', textAlign: 'center' }}>
                            {images[category] ? (
                                <img
                                    src={images[category]}
                                    alt={category}
                                    style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '10px' }}
                                />
                            ) : (
                                <div style={{ width: '100%', height: '150px', backgroundColor: '#f0f0f0', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    No Image
                                </div>
                            )}
                            <h3>{category}</h3>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CategoryCards;