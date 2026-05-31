import { useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../../context/CartContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { CartItem } from '../../components/cart/CartItem.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';

const TAX_RATE = 0.08;
const SHIPPING_COST = 10;
const FREE_SHIPPING_THRESHOLD = 100;

export const Cart = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { cart, loading, error, fetchCart, updateQuantity, removeFromCart, clearCart } =
    useContext(CartContext);

  useEffect(() => {
    if (!cart) {
      fetchCart();
    }
  }, [cart, fetchCart]);

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await updateQuantity(productId, newQuantity);
      toast.success('Quantity updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update quantity');
    }
  };

  const handleRemoveItem = async (productId) => {
    if (!window.confirm('Are you sure you want to remove this item?')) return;
    try {
      await removeFromCart(productId);
      toast.success('Item removed from cart');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove item');
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your cart?')) return;
    try {
      await clearCart();
      toast.success('Cart cleared');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to clear cart');
    }
  };

  const handleCheckout = () => {
    if (!cart || cart.items.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent">
        <div className="container mx-auto px-4 py-8">
          <h1 className="mb-8 text-4xl font-bold">Shopping Cart</h1>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card animate-pulse bg-base-100 shadow">
                  <div className="card-body h-32"></div>
                </div>
              ))}
            </div>
            <div className="card animate-pulse bg-base-100 shadow">
              <div className="card-body h-64"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-transparent">
        <div className="container mx-auto px-4 py-8">
          <div className="alert alert-error mb-6 shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l-2-2m0 0l-2-2m2 2l2-2m-2 2l-2 2m8-8l2 2m0 0l2 2m-2-2l-2-2m2 2l2-2"
              />
            </svg>
            <div>
              <h3 className="font-bold">Error</h3>
              <div className="text-sm">{error}</div>
            </div>
            <button onClick={fetchCart} className="btn btn-sm btn-ghost">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const cartItems = Array.isArray(cart?.items) ? cart.items : [];
  const validCartItems = cartItems.filter((item) => item?.product?._id);
  const unavailableItemsCount = cartItems.length - validCartItems.length;
  const isEmpty = validCartItems.length === 0;

  if (isEmpty) {
    return (
      <div className="min-h-screen bg-transparent">
        <div className="container mx-auto px-4 py-8">
          <h1 className="mb-8 text-4xl font-bold">Shopping Cart</h1>
          <EmptyState
            title="Your cart is empty"
            message="Looks like you haven't added any items yet. Start shopping to fill your cart!"
            icon="🛒"
            action={
              <Link to="/products" className="btn btn-primary">
                Continue Shopping
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  const subtotal = validCartItems.reduce(
    (sum, item) => sum + (item.price || item.product?.price || 0) * (item.quantity || 0),
    0
  );
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + shippingCost + tax;

  return (
    <div className="min-h-screen bg-transparent">
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-2 text-4xl font-bold md:text-5xl">Shopping Cart</h1>
          <p className="mb-8 text-base-content/70">
            {validCartItems.length} item{validCartItems.length !== 1 ? 's' : ''} in your cart
          </p>

          {unavailableItemsCount > 0 && (
            <div className="alert alert-warning mb-6">
              <span>
                {unavailableItemsCount} unavailable item
                {unavailableItemsCount !== 1 ? 's were' : ' was'} hidden because the product no longer
                exists.
              </span>
            </div>
          )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4 mb-6">
              {validCartItems.map((item, index) => (
                <CartItem
                  key={`${item.product._id}-${index}`}
                  item={item}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemove={handleRemoveItem}
                />
              ))}
            </div>

            {/* Clear Cart Button */}
            <button onClick={handleClearCart} className="btn btn-outline btn-error w-full">
              Clear Cart
            </button>
          </div>

          {/* Order Summary Sidebar */}
          <div className="card sticky top-24 h-fit border border-base-300 bg-base-100 shadow-lg">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-6">Order Summary</h2>

              {/* Summary Items */}
              <div className="space-y-3 border-b pb-4">
                <div className="flex justify-between">
                  <span className="text-base-content/70">Subtotal:</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>

                {shippingCost > 0 ? (
                  <div className="flex justify-between">
                    <span className="text-base-content/70">Shipping:</span>
                    <span className="font-semibold">${shippingCost.toFixed(2)}</span>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <span className="text-base-content/70">Shipping:</span>
                    <span className="flex items-center gap-1 font-semibold text-success">
                      Free ✓
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-base-content/70">Tax ({Math.round(TAX_RATE * 100)}%):</span>
                  <span className="font-semibold">${tax.toFixed(2)}</span>
                </div>
              </div>

              {/* Free Shipping Notice */}
              {shippingCost > 0 && subtotal < FREE_SHIPPING_THRESHOLD && (
                <div className="alert alert-info my-4 py-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="stroke-current shrink-0 w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  <div className="text-sm">
                    Add ${(FREE_SHIPPING_THRESHOLD - subtotal).toFixed(2)} more for free shipping!
                  </div>
                </div>
              )}

              {/* Total */}
              <div className="flex justify-between text-xl font-bold mt-6 mb-6">
                <span>Total:</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>

              {/* Checkout Button */}
              <button onClick={handleCheckout} className="btn btn-primary w-full btn-lg mb-2">
                Proceed to Checkout →
              </button>

              {/* Continue Shopping Button */}
              <Link to="/products" className="btn btn-ghost w-full">
                Continue Shopping
              </Link>

              {/* Security Badge */}
              <div className="mt-4 flex items-center justify-center gap-1 text-center text-xs text-base-content/50">
                <span>🔒 Secure Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
