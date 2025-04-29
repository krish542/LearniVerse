const Cart = require('../models/Cart');

exports.getCart = async (req, res) => {
  try {
      console.log('Fetching cart - req.headers:', req.headers); // Check for the token
      console.log('Fetching cart - req.student:', req.student); // Check if student object is present

      if (!req.student || !req.student.id) {
          console.error('Error: Student not authenticated properly.');
          return res.status(401).json({ error: 'Not authenticated' }); // Explicitly handle unauthenticated case
      }

      console.log('Fetching cart for student ID:', req.student.id);
      const cart = await Cart.findOne({ student: req.student.id }).populate('items.course', 'title price thumbnail');

      if (!cart) {
          console.log('No cart found for student:', req.student.id);
          return res.status(200).json({ cart: { items: [] } });
      }

      console.log('Cart fetched successfully:', cart);
      res.status(200).json({ cart });
  } catch (error) {
      console.error('Error fetching cart:', error);
      res.status(500).json({ error: 'Failed to fetch cart' });
  }
};

exports.addItem = async (req, res) => {
    try {
        const { courseId } = req.body;
        const studentId = req.student.id;

        console.log(`Adding/updating course ${courseId} in cart for student ${studentId}`);

        let cart = await Cart.findOne({ student: studentId });

        if (!cart) {
            cart = new Cart({ student: studentId, items: [{ course: courseId }] });
            await cart.save();
            console.log('New cart created and course added.');
            return res.status(200).json({ message: 'Course added to cart', cartId: cart._id });
        }

        const existingItemIndex = cart.items.findIndex(item => item.course.toString() === courseId);

        if (existingItemIndex > -1) {
            if (cart.items[existingItemIndex].isWishlisted) {
                cart.items[existingItemIndex].isWishlisted = false;
                await cart.save();
                console.log('Course moved from wishlist to cart.');
                return res.status(200).json({ message: 'Course moved to cart' });
            } else {
                console.log('Course already in cart.');
                return res.status(400).json({ error: 'Course is already in the cart' });
            }
        } else {
            cart.items.push({ course: courseId });
            await cart.save();
            console.log('Course added to cart.');
            return res.status(200).json({ message: 'Course added to cart', cartId: cart._id });
        }
    } catch (error) {
        console.error('Error adding item to cart:', error);
        res.status(500).json({ error: 'Failed to add item to cart' });
    }
};

exports.toggleWishlist = async (req, res) => {
    try {
        const { courseId } = req.body;
        const studentId = req.student.id;

        console.log(`Toggling wishlist for course ${courseId} for student ${studentId}`);

        let cart = await Cart.findOne({ student: studentId });

        if (!cart) {
            cart = new Cart({ student: studentId, items: [{ course: courseId, isWishlisted: true }] });
            await cart.save();
            console.log('New cart created and course added to wishlist.');
            return res.status(200).json({ message: 'Course added to wishlist' });
        }

        const existingItemIndex = cart.items.findIndex(item => item.course.toString() === courseId);

        if (existingItemIndex > -1) {
            cart.items[existingItemIndex].isWishlisted = !cart.items[existingItemIndex].isWishlisted;
        } else {
            cart.items.push({ course: courseId, isWishlisted: true });
        }

        await cart.save();
        console.log('Wishlist status updated for course.');
        res.status(200).json({ message: 'Wishlist updated successfully' });
    } catch (error) {
        console.error('Error updating wishlist:', error);
        res.status(500).json({ error: 'Failed to update wishlist' });
    }
};

exports.removeItem = async (req, res) => {
    try {
        const { courseId } = req.params;
        const studentId = req.student.id;

        console.log(`Removing course ${courseId} from cart/wishlist for student ${studentId}`);

        const cart = await Cart.findOneAndUpdate(
            { student: studentId },
            { $pull: { items: { course: courseId } } },
            { new: true }
        );

        if (!cart) {
            console.log('Cart not found for student:', studentId);
            return res.status(404).json({ error: 'Cart not found' });
        }

        console.log('Course removed from cart/wishlist.');
        res.status(200).json({ message: 'Course removed' });
    } catch (error) {
        console.error('Error removing item:', error);
        res.status(500).json({ error: 'Failed to remove item' });
    }
};
exports.clearCart = async (req, res) => {
    try {
      const studentId = req.student.id;
      
      const cart = await Cart.findOneAndUpdate(
        { student: studentId },
        { $set: { items: [] } },
        { new: true }
      );
  
      res.json({
        success: true,
        message: 'Cart cleared',
        cart
      });
    } catch (err) {
      console.error('Error clearing cart:', err);
      res.status(500).json({ error: 'Failed to clear cart' });
    }
  };