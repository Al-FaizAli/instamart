import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

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

        // 1. Fetch user's orders, selecting only product_id array and order_number
        const matchedOrders = await Order.find(
            { user_id: { $in: candidateUserIds } },
            { _id: 0, order_id: 1, order_number: 1, product_id: 1 }
        ).sort({ order_number: -1 }).lean();

        if (!matchedOrders || matchedOrders.length === 0) {
            return res.json([]);
        }

        // 2. Track metadata: latest order number, order frequency
        const latestOrderNumberByProductId = new Map();
        const orderCountByProductId = new Map();
        const uniqueProductIds = new Set();

        matchedOrders.forEach((order) => {
            const currentOrderNum = order.order_number ?? 0;
            const productIds = order.product_id || [];

            productIds.forEach((pid) => {
                const numericPid = Number(pid);
                if (isNaN(numericPid)) return;

                uniqueProductIds.add(numericPid);

                // Track the latest order number the product appeared in
                const previousLatest = latestOrderNumberByProductId.get(numericPid) ?? -1;
                if (currentOrderNum > previousLatest) {
                    latestOrderNumberByProductId.set(numericPid, currentOrderNum);
                }

                // Increment total appearance frequency
                orderCountByProductId.set(
                    numericPid,
                    (orderCountByProductId.get(numericPid) ?? 0) + 1
                );
            });
        });

        if (uniqueProductIds.size === 0) {
            return res.json([]);
        }

        // 3. Fetch product details for all discovered IDs
        const products = await Product.find({
            product_id: { $in: Array.from(uniqueProductIds) }
        }).lean();

        // 4. Enrich and sort
        const enrichedProducts = products
            .map((product) => ({
                ...product,
                latest_order_number: latestOrderNumberByProductId.get(product.product_id) ?? 0,
                past_order_count: orderCountByProductId.get(product.product_id) ?? 0,
                past_reorder_count: 0 // Implicitly 0 or derived if needed
            }))
            .sort((a, b) => {
                // Priority 1: Recency (latest order number)
                if (b.latest_order_number !== a.latest_order_number) {
                    return b.latest_order_number - a.latest_order_number;
                }

                // Priority 2: Frequency (total appearances)
                return b.past_order_count - a.past_order_count;
            })
            .slice(0, 20);

        res.json(enrichedProducts);
    } catch (error) {
        console.error('Failed to fetch past products:', error);
        res.status(500).json({ message: 'Failed to fetch past products' });
    }
};
