import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import axios from 'axios';

const CartPage = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [cartUpdateLoading, setCartUpdateLoading] = useState(null);

    useEffect(() => {
        fetchCartData();
    }, []);

    const fetchCartData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/student-login');
                return;
            }

            const response = await axios.get('http://localhost:5000/api/cart', {
                headers: { 'x-auth-token': token }
            });

            const cartData = response.data.cart;
            if (cartData?.items) {
                setCartItems(cartData.items.filter(item => !item.isWishlisted).map(item => ({ ...item, cartId: cartData._id })));
                setWishlistItems(cartData.items.filter(item => item.isWishlisted));
            } else {
                setCartItems([]);
                setWishlistItems([]);
            }
            setLoading(false);
        } catch (err) {
            console.error('Error fetching cart data in CartPage:', err);
            setError('Failed to load cart data.');
            setLoading(false);
        }
    };

    const handleRemoveItem = async (courseId) => {
        try {
            setCartUpdateLoading(courseId);
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/student-login');
                return;
            }

            const response = await axios.delete(`http://localhost:5000/api/cart/remove/${courseId}`, {
                headers: { 'x-auth-token': token }
            });

            setCartItems(cartItems.filter(item => item.course._id !== courseId));
            setWishlistItems(wishlistItems.filter(item => item.course._id !== courseId));
            alert(response.data.message || 'Item removed.');
        } catch (err) {
            console.error('Error removing item:', err);
            alert(err.response?.data?.error || 'Failed to remove item.');
        } finally {
            setCartUpdateLoading(null);
        }
    };
    const handleMoveToWishlist = async (courseId) => {
        try {
            setCartUpdateLoading(courseId);
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/student-login');
                return;
            }

            const response = await axios.post(
                'http://localhost:5000/api/cart/wishlist',
                { courseId },
                { headers: { 'x-auth-token': token } }
            );

            const movedItem = cartItems.find(item => item.course._id === courseId);
            if (movedItem) {
                setWishlistItems([...wishlistItems, { ...movedItem, isWishlisted: true }]);
                setCartItems(cartItems.filter(item => item.course._id !== courseId));
            }
            alert(response.data.message || 'Course moved to wishlist.');
        } catch (err) {
            console.error('Error moving to wishlist:', err);
            alert(err.response?.data?.error || 'Failed to move course to wishlist.');
        } finally {
            setCartUpdateLoading(null);
        }
    };

    const handleAddToCartFromWishlist = async (courseId) => {
        try {
            setCartUpdateLoading(courseId);
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/student-login');
                return;
            }

            const response = await axios.post(
                'http://localhost:5000/api/cart/add',
                { courseId },
                { headers: { 'x-auth-token': token } }
            );

            const movedItem = wishlistItems.find(item => item.course._id === courseId);
            if (movedItem) {
                setCartItems([...cartItems, { ...movedItem, isWishlisted: false, cartId: response.data.cartId }]);
                setWishlistItems(wishlistItems.filter(item => item.course._id !== courseId));
            }
            alert(response.data.message || 'Course added to cart.');
        } catch (err) {
            console.error('Error adding from wishlist:', err);
            alert(err.response?.data?.error || 'Failed to add course to cart.');
        } finally {
            setCartUpdateLoading(null);
        }
    };

    const handleCheckout = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/student-login');
            return;
        }

        if (cartItems.length === 0) {
            alert('Your cart is empty. Add courses to proceed to checkout.');
            return;
        }

        axios.post('http://localhost:5000/api/payment/checkout-session', {
            cartId: cartItems[0].cartId // Use the cartId from the fetched cart
        }, {
            headers: { 'x-auth-token': token }
        }).then(response => {
            if (response.data.url) {
                window.location.href = response.data.url;
            } else {
                alert('Failed to initiate checkout.');
            }
        }).catch(error => {
            console.error('Checkout error:', error);
            alert(error.response?.data?.error || 'Failed to initiate checkout.');
        });
    };

    if (loading) return <div className="min-h-screen bg-gray-900 text-yellow-400 flex items-center justify-center">Loading your cart...</div>;
    if (error) return <div className="min-h-screen bg-gray-900 text-yellow-400 flex items-center justify-center">{error}</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-yellow-400">
            <Navbar />
            <div className="pt-20 p-8 max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
                {cartItems.length === 0 ? (
                    <p className="text-gray-400 mb-6">Your cart is empty.</p>
                ) : (
                    <div className="space-y-4 mb-8">
                        {cartItems.map(item => (
                            <div key={item.course._id} className="bg-gray-800 p-4 rounded-lg flex items-center justify-between">
                                <div className="flex items-center">
                                    <img
                                        src={`http://localhost:5000${item.course.thumbnail}`}
                                        alt={item.course.title}
                                        className="w-20 h-16 object-cover rounded-md mr-4"
                                    />
                                    <div>
                                        <h3 className="font-semibold">{item.course.title}</h3>
                                        <p className="text-sm text-gray-400">Price: ₹{item.course.price}</p>
                                    </div>
                                </div>
                                <div>
                                    <button
                                        onClick={() => handleRemoveItem(item.course._id)}
                                        disabled={cartUpdateLoading === item.course._id}
                                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md text-sm mr-2 disabled:opacity-50"
                                    >
                                        {cartUpdateLoading === item.course._id ? 'Removing...' : 'Remove'}
                                    </button>
                                    <button
                                        onClick={() => handleMoveToWishlist(item.course._id)}
                                        disabled={cartUpdateLoading === item.course._id}
                                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-md text-sm disabled:opacity-50"
                                    >
                                        {cartUpdateLoading === item.course._id ? 'Moving...' : 'Move to Wishlist'}
                                    </button>
                                </div>
                            </div>
                        ))}
                        <button
                            onClick={handleCheckout}
                            disabled={cartItems.length === 0}
                            className="w-full bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                )}

                <h2 className="text-2xl font-bold mb-6">Your Wishlist</h2>
                {wishlistItems.length === 0 ? (
                    <p className="text-gray-400">Your wishlist is empty.</p>
                ) : (
                    <div className="space-y-4">
                        {wishlistItems.map(item => (
                            <div key={item.course._id} className="bg-gray-800 p-4 rounded-lg flex items-center justify-between">
                                <div className="flex items-center">
                                    <img
                                        src={`http://localhost:5000${item.course.thumbnail}`}
                                        alt={item.course.title}
                                        className="w-20 h-16 object-cover rounded-md mr-4"
                                    />
                                    <div>
                                        <h3 className="font-semibold">{item.course.title}</h3>
                                        <p className="text-sm text-gray-400">Price: ₹{item.course.price}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleAddToCartFromWishlist(item.course._id)}
                                    disabled={cartUpdateLoading === item.course._id}
                                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-md text-sm disabled:opacity-50"
                                >
                                    {cartUpdateLoading === item.course._id ? 'Adding...' : 'Add to Cart'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default CartPage;