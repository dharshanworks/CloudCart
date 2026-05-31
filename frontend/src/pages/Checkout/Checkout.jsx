import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../../context/CartContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { orderService } from '../../services/orderService.js';

const TAX_RATE = 0.08;
const SHIPPING_COST = 10;
const FREE_SHIPPING_THRESHOLD = 100;

const FormInput = ({ label, error, required = false, ...props }) => (
  <div className="form-control">
    <label className="label">
      <span className="label-text">
        {label} {required && <span className="text-error">*</span>}
      </span>
    </label>
    <input
      {...props}
      className={`input input-bordered w-full ${error ? 'input-error' : ''}`}
    />
    {error && <label className="label"><span className="label-text-alt text-error">{error}</span></label>}
  </div>
);

const FormSelect = ({ label, options, error, required = false, ...props }) => (
  <div className="form-control">
    <label className="label">
      <span className="label-text">
        {label} {required && <span className="text-error">*</span>}
      </span>
    </label>
    <select
      {...props}
      className={`select select-bordered w-full ${error ? 'select-error' : ''}`}
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
    {error && <label className="label"><span className="label-text-alt text-error">{error}</span></label>}
  </div>
);

export const Checkout = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { cart, clearCart } = useContext(CartContext);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    method: 'Credit Card',
    transactionId: '',
  });

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => /^\d{10,}$/.test(phone.replace(/\D/g, ''));
  const validatePostalCode = (code) => /^[\w\s-]{3,}$/.test(code);

  const validateShipping = () => {
    const newErrors = {};
    if (!formData.name?.trim()) newErrors.name = 'Name is required';
    if (!formData.email?.trim()) newErrors.email = 'Email is required';
    else if (!validateEmail(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.phone?.trim()) newErrors.phone = 'Phone is required';
    else if (!validatePhone(formData.phone)) newErrors.phone = 'Phone must be at least 10 digits';
    if (!formData.street?.trim()) newErrors.street = 'Street address is required';
    if (!formData.city?.trim()) newErrors.city = 'City is required';
    if (!formData.state?.trim()) newErrors.state = 'State is required';
    if (!formData.postalCode?.trim()) newErrors.postalCode = 'Postal code is required';
    else if (!validatePostalCode(formData.postalCode)) newErrors.postalCode = 'Invalid postal code';
    if (!formData.country?.trim()) newErrors.country = 'Country is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleNextStep = () => {
    if (step === 1 && validateShipping()) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    setStep(step - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateShipping()) {
      toast.error('Please fill in all required fields correctly');
      return;
    }

    setLoading(true);
    try {
      const response = await orderService.createOrder(
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            postalCode: formData.postalCode,
            country: formData.country,
          },
        },
        {
          method: formData.method,
          transactionId: formData.transactionId || undefined,
        }
      );

      if (response.success) {
        await clearCart();
        toast.success('Order placed successfully!');
        navigate(`/orders/${response.data.order._id}`);
      } else {
        toast.error(response.message || 'Failed to create order');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create order. Please try again.';
      toast.error(message);
      console.error('Order creation error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-transparent">
        <div className="container mx-auto px-4 py-8">
          <div className="card border border-base-300 bg-base-100 shadow-lg">
            <div className="card-body text-center">
              <h2 className="card-title justify-center text-2xl mb-4">Your cart is empty</h2>
              <p className="mb-6 text-base-content/70">
                Add some items to your cart before proceeding to checkout.
              </p>
              <button
                onClick={() => navigate('/products')}
                className="btn btn-primary w-full"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = cart.totalPrice || 0;
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + shippingCost + tax;

  return (
    <div className="min-h-screen bg-transparent">
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-2 text-4xl font-bold md:text-5xl">Checkout</h1>
        <p className="mb-8 text-base-content/70">Step {step} of 3: {step === 1 ? 'Shipping' : step === 2 ? 'Payment' : 'Review'}</p>

        <div className="mb-8">
          <div className="flex gap-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex-1">
                <div
                  className={`h-2 rounded-full transition-all ${
                    s <= step ? 'bg-primary' : 'bg-base-300'
                  }`}
                ></div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {step === 1 && (
                <div className="card border border-base-300 bg-base-100 shadow-lg">
                  <div className="card-body">
                    <h2 className="card-title mb-6 text-2xl">Shipping Address</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormInput
                        label="Full Name"
                        name="name"
                        type="text"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={handleInputChange}
                        error={errors.name}
                        required
                      />

                      <FormInput
                        label="Email Address"
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        error={errors.email}
                        required
                      />

                      <div className="md:col-span-2">
                        <FormInput
                          label="Phone Number"
                          name="phone"
                          type="tel"
                          placeholder="(555) 123-4567"
                          value={formData.phone}
                          onChange={handleInputChange}
                          error={errors.phone}
                          required
                        />
                      </div>

                      <div className="md:col-span-2">
                        <FormInput
                          label="Street Address"
                          name="street"
                          type="text"
                          placeholder="123 Main Street"
                          value={formData.street}
                          onChange={handleInputChange}
                          error={errors.street}
                          required
                        />
                      </div>

                      <FormInput
                        label="City"
                        name="city"
                        type="text"
                        placeholder="New York"
                        value={formData.city}
                        onChange={handleInputChange}
                        error={errors.city}
                        required
                      />

                      <FormInput
                        label="State/Province"
                        name="state"
                        type="text"
                        placeholder="NY"
                        value={formData.state}
                        onChange={handleInputChange}
                        error={errors.state}
                        required
                      />

                      <FormInput
                        label="Postal Code"
                        name="postalCode"
                        type="text"
                        placeholder="10001"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        error={errors.postalCode}
                        required
                      />

                      <FormInput
                        label="Country"
                        name="country"
                        type="text"
                        placeholder="United States"
                        value={formData.country}
                        onChange={handleInputChange}
                        error={errors.country}
                        required
                      />
                    </div>

                    <div className="mt-6 flex gap-3">
                      <button
                        type="button"
                        onClick={() => navigate('/cart')}
                        className="btn btn-ghost flex-1"
                      >
                        Back to Cart
                      </button>
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="btn btn-primary flex-1"
                      >
                        Next: Payment →
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="card border border-base-300 bg-base-100 shadow-lg">
                  <div className="card-body">
                    <h2 className="card-title mb-6 text-2xl">Payment Method</h2>

                    <FormSelect
                      label="Payment Method"
                      name="method"
                      value={formData.method}
                      onChange={handleInputChange}
                      options={['Credit Card', 'Debit Card', 'PayPal', 'Apple Pay', 'Google Pay']}
                      required
                    />

                    <div className="alert alert-info my-4">
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
                        Your payment information will be securely processed.
                      </div>
                    </div>

                    <FormInput
                      label="Transaction ID (Optional)"
                      name="transactionId"
                      type="text"
                      placeholder="TXN-XXXXXXXXXXXX"
                      value={formData.transactionId}
                      onChange={handleInputChange}
                    />

                    <div className="mt-6 flex gap-3">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="btn btn-ghost flex-1"
                      >
                        ← Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setStep(3)}
                        className="btn btn-primary flex-1"
                      >
                        Review Order →
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="card border border-base-300 bg-base-100 shadow-lg">
                  <div className="card-body">
                    <h2 className="card-title mb-6 text-2xl">Review Your Order</h2>

                    <div className="mb-4 rounded-lg bg-base-200 p-4">
                      <h3 className="font-bold mb-2">Shipping To:</h3>
                      <p className="text-sm">{formData.name}</p>
                      <p className="text-sm">{formData.street}</p>
                      <p className="text-sm">
                        {formData.city}, {formData.state} {formData.postalCode}
                      </p>
                      <p className="text-sm">{formData.country}</p>
                    </div>

                    <div className="rounded-lg bg-base-200 p-4">
                      <h3 className="font-bold mb-2">Payment Method:</h3>
                      <p className="text-sm">{formData.method}</p>
                    </div>

                    <div className="mt-6 flex gap-3">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="btn btn-ghost flex-1"
                      >
                        ← Back
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary flex-1 gap-2"
                      >
                        {loading ? (
                          <>
                            <span className="loading loading-spinner loading-sm"></span>
                            Processing...
                          </>
                        ) : (
                          <>✓ Place Order</>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>

          <div className="card sticky top-24 h-fit border border-base-300 bg-base-100 shadow-lg">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-6">Order Summary</h2>

              <div className="space-y-3 border-b pb-4 max-h-64 overflow-y-auto">
                {cart.items.map((item) => (
                  <div key={item.product._id} className="flex justify-between text-sm">
                    <div>
                      <p className="font-semibold line-clamp-1">{item.product.name}</p>
                      <p className="text-xs text-base-content/60">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-bold">
                      ${((item.price || item.product.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mt-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>

                {shippingCost > 0 ? (
                  <div className="flex justify-between text-sm">
                    <span>Shipping:</span>
                    <span className="font-semibold">${shippingCost.toFixed(2)}</span>
                  </div>
                ) : (
                  <div className="flex justify-between text-sm text-success">
                    <span>Shipping:</span>
                    <span className="font-semibold">Free ✓</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span>Tax ({Math.round(TAX_RATE * 100)}%):</span>
                  <span className="font-semibold">${tax.toFixed(2)}</span>
                </div>

                <div className="divider my-2"></div>

                <div className="flex justify-between text-lg font-bold text-primary">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="alert alert-success mt-4 py-2">
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
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
  <div className="text-sm">
    🔒 Secure checkout
  </div>
</div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;