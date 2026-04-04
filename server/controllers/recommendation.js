import mongoose from 'mongoose';

const resolveCandidateUserIds = (req) => {
    const rawValues = [
        req.user?.userId,
        req.query?.userId,
        req.query?.user_id,
        req.body?.userId,
        req.body?.user_id,
    ];

    const uniqueValues = [...new Set(
        rawValues.filter((value) => value !== undefined && value !== null && value !== '')
    )];

    return uniqueValues.flatMap((value) => {
        const numericValue = Number(value);

        if (Number.isFinite(numericValue)) {
            return [numericValue, String(numericValue)];
        }

        return [String(value)];
    });
};

// @desc    Get past products for the authenticated user
// @route   GET /api/recommendations/past
// @access  Private
export const getPastProducts = async (req, res) => {
    try {
        const candidateUserIds = resolveCandidateUserIds(req);

        if (candidateUserIds.length === 0) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        const db = mongoose.connection.db;
        const ordersCollection = db.collection('orders');
        const priorCollection = db.collection('order_products__prior');
        const trainCollection = db.collection('order_products__train');
        const productsCollection = db.collection('products');

        const matchedOrders = await ordersCollection.find(
            { user_id: { $in: candidateUserIds } },
            { projection: { _id: 0, order_id: 1, order_number: 1 } }
        ).sort({ order_number: -1 }).toArray();

        if (matchedOrders.length === 0) {
            return res.json([]);
        }

        const orderIds = matchedOrders.map((order) => order.order_id);

        const [priorItems, trainItems] = await Promise.all([
            priorCollection.find(
                { order_id: { $in: orderIds } },
                { projection: { _id: 0, order_id: 1, product_id: 1, reordered: 1 } }
            ).toArray(),
            trainCollection.find(
                { order_id: { $in: orderIds } },
                { projection: { _id: 0, order_id: 1, product_id: 1, reordered: 1 } }
            ).toArray(),
        ]);

        const allItems = [...priorItems, ...trainItems];

        if (allItems.length === 0) {
            return res.json([]);
        }

        const uniqueProductIds = [...new Set(allItems.map((item) => item.product_id))];
        const products = await productsCollection.find(
            { product_id: { $in: uniqueProductIds } }
        ).toArray();

        const latestOrderNumberByProductId = new Map();
        const orderNumberByOrderId = new Map(
            matchedOrders.map((order) => [order.order_id, order.order_number ?? 0])
        );
        const orderCountByProductId = new Map();
        const reorderCountByProductId = new Map();

        allItems.forEach((item) => {
            const orderNumber = orderNumberByOrderId.get(item.order_id) ?? 0;
            const previousLatest = latestOrderNumberByProductId.get(item.product_id) ?? -1;

            if (orderNumber > previousLatest) {
                latestOrderNumberByProductId.set(item.product_id, orderNumber);
            }

            orderCountByProductId.set(
                item.product_id,
                (orderCountByProductId.get(item.product_id) ?? 0) + 1
            );

            if (item.reordered === 1) {
                reorderCountByProductId.set(
                    item.product_id,
                    (reorderCountByProductId.get(item.product_id) ?? 0) + 1
                );
            }
        });

        const enrichedProducts = products
            .map((product) => ({
                ...product,
                latest_order_number: latestOrderNumberByProductId.get(product.product_id) ?? 0,
                past_order_count: orderCountByProductId.get(product.product_id) ?? 0,
                past_reorder_count: reorderCountByProductId.get(product.product_id) ?? 0,
            }))
            .sort((a, b) => {
                if (b.latest_order_number !== a.latest_order_number) {
                    return b.latest_order_number - a.latest_order_number;
                }

                return b.past_order_count - a.past_order_count;
            })
            .slice(0, 20);

        res.json(enrichedProducts);
    } catch (error) {
        console.error('Failed to fetch past products:', error);
        res.status(500).json({ message: 'Failed to fetch past products' });
    }
};
