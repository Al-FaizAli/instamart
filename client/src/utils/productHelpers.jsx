export const PRODUCT_PLACEHOLDER_IMAGE = '/images/placeholder.jpg';

export const normalizeProduct = (product = {}) => {
    const numericPrice = Number(product.price);
    const price = Number.isFinite(numericPrice) ? numericPrice : 0;
    const image = product.image_link || product.image || PRODUCT_PLACEHOLDER_IMAGE;
    const ratingValue = Number(product.rating);
    const rating = Number.isFinite(ratingValue) ? ratingValue : 4.2;

    return {
        ...product,
        price,
        rating,
        image,
        image_link: product.image_link || image,
        description: product.catalog_content || product.description || '',
    };
};

export const normalizeProducts = (products = []) => products.map(normalizeProduct);
