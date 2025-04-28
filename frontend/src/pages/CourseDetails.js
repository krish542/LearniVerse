import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import axios from 'axios';
import { getAuthHeader } from '../utils/authService';
const CourseDetails = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [totalDuration, setTotalDuration] = useState(0);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [isInCart, setIsInCart] = useState(false);
    const [error, setError] = useState('');
    const [cartLoading, setCartLoading] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);
    const [cart, setCart] = useState({ items: [] });
    const fetchCourseDetails = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/courses/${courseId}`);
            setCourse(response.data);

            if (response.data.lectures) {
                const duration = response.data.lectures.reduce((total, lecture) => {
                    return total + (parseInt(lecture.duration) || 0);
                }, 0);
                setTotalDuration(duration);
            }
            setLoading(false);
        } catch (err) {
            console.error('Error fetching course details:', err);
            setError('Failed to load course.');
            setLoading(false);
        }
    };

    /*const fetchCartData = async () => {
        try {
            const token = localStorage.getItem('token');
            console.log('Token being sent for cart request:', token);
            if (!token) return;

            const response = await axios.get('http://localhost:5000/api/cart', {
                headers: { 'x-auth-token': token }
            });

            const cartData = response.data.cart;
            if (cartData?.items) {
                const wishlistItem = cartData.items.find(
                    item => item.course?._id === courseId && item.isWishlisted
                );
                setIsWishlisted(!!wishlistItem);
                const cartItem = cartData.items.find(
                    item => item.course?._id === courseId && !item.isWishlisted
                );
                setIsInCart(!!cartItem);
            } else {
                setIsWishlisted(false);
                setIsInCart(false);
            }
        } catch (err) {
            console.error('Error fetching cart data in CourseDetails:', err);
        }
    };*/
    const fetchCartData = async () => {
        const headers = getAuthHeader();
        if (Object.keys(headers).length === 0) {
            // Handle expired token (e.g., don't make request, redirect)
            return;
        }
        try {
            const response = await axios.get('http://localhost:5000/api/cart', { headers });
            setCart(response.data.cart);
        } catch (error) {
            console.error('Error fetching cart:', error);
            setError('Failed to load cart.');
        }
    };
    const handleAddToCart = async () => {
        try {
            setCartLoading(true);
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
            setIsInCart(true);
            alert(response.data.message || 'Course added to cart!');
        } catch (err) {
            console.error('Error adding to cart:', err);
            if (err.response?.status === 401) {
                navigate('/student-login');
            } else {
                alert(err.response?.data?.error || 'Failed to add to cart');
            }
        } finally {
            setCartLoading(false);
        }
    };

    const handleToggleWishlist = async () => {
        try {
            setWishlistLoading(true);
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
            setIsWishlisted(!isWishlisted);
            alert(response.data.message || (isWishlisted ? 'Removed from wishlist!' : 'Added to wishlist!'));
        } catch (err) {
            console.error('Error toggling wishlist:', err);
            if (err.response?.status === 401) {
                navigate('/student-login');
            } else {
                alert(err.response?.data?.error || 'Wishlist update failed');
            }
        } finally {
            setWishlistLoading(false);
        }
    };

    useEffect(() => {
        fetchCourseDetails();
        fetchCartData();
    }, [courseId]);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return [h, m, s]
            .map(val => val < 10 ? `0${val}` : val)
            .filter((val, idx) => val !== '00' || idx > 0)
            .join(':');
    };

    if (loading) return <div className="min-h-screen bg-gray-900 text-yellow-400 flex items-center justify-center">Loading...</div>;
    if (error) return <div className="min-h-screen bg-gray-900 text-yellow-400 flex items-center justify-center">{error}</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-yellow-400">
            <Navbar />
            <div className="pt-20 p-8 max-w-6xl mx-auto">
                {course && (
                    <>
                        <div className="mb-6">
                            {course.thumbnail && (
                                <img
                                    src={`http://localhost:5000${course.thumbnail.replace(/\\/g, '/')}`} // Adjust path if needed
                                    alt={course.title}
                                    className="w-full rounded-md shadow-md"
                                />
                            )}
                        </div>
                        <h2 className="text-3xl font-bold mb-4">{course.title}</h2>
                        <p className="mb-4">{course.description}</p>
                        {course.lectures && course.lectures.length > 0 && (
                            <div>
                                <h3 className="text-xl font-semibold mb-2">Lectures</h3>
                                <ul>
                                    {course.lectures.map(lecture => (
                                        <li key={lecture._id} className="mb-1">{lecture.title} ({formatTime(parseInt(lecture.duration) || 0)})</li>
                                    ))}
                                </ul>
                                <p className="font-semibold">Total Duration: {formatTime(totalDuration)}</p>
                            </div>
                        )}
                        {/* Add more details here */}
                        <div className="mt-6">
                            {!isInCart && (
                                <button
                                    onClick={handleAddToCart}
                                    disabled={cartLoading}
                                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2"
                                >
                                    {cartLoading ? 'Adding to Cart...' : 'Add to Cart'}
                                </button>
                            )}
                            {isInCart && (
                                <span className="text-green-500 font-semibold mr-2">In Cart</span>
                            )}
                            <button
                                onClick={handleToggleWishlist}
                                disabled={wishlistLoading}
                                className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${isWishlisted ? 'bg-red-500 hover:bg-red-700' : ''}`}
                            >
                                {wishlistLoading ? 'Updating...' : (isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist')}
                            </button>
                        </div>
                    </>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default CourseDetails;