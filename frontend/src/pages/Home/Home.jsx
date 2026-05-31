import { Link } from 'react-router-dom';

export const Home = () => (
  <div className="space-y-12">
    {/* Hero Section */}
    <div className="hero rounded-2xl border border-base-300 bg-gradient-to-r from-gray-900 via-stone-800 to-gray-900 py-20 text-white shadow-xl">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold mb-6">Welcome to CloudCart</h1>
          <p className="text-lg mb-8">
            Discover amazing products at unbeatable prices. Shop with confidence.
          </p>
          <Link to="/products" className="btn btn-neutral">
            Shop Now
          </Link>
        </div>
      </div>
    </div>

    {/* Features Section */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="card border border-base-300 bg-base-100 shadow-md">
        <div className="card-body text-center">
          <div className="text-5xl mb-4">🚚</div>
          <h2 className="card-title justify-center">Fast Shipping</h2>
          <p>Get your orders delivered quickly and safely.</p>
        </div>
      </div>
      <div className="card border border-base-300 bg-base-100 shadow-md">
        <div className="card-body text-center">
          <div className="text-5xl mb-4">💯</div>
          <h2 className="card-title justify-center">Quality Guarantee</h2>
          <p>All products meet our strict quality standards.</p>
        </div>
      </div>
      <div className="card border border-base-300 bg-base-100 shadow-md">
        <div className="card-body text-center">
          <div className="text-5xl mb-4">💳</div>
          <h2 className="card-title justify-center">Secure Payment</h2>
          <p>Your payment information is safe and secure.</p>
        </div>
      </div>
    </div>

    {/* CTA Section */}
    <div className="rounded-2xl border border-base-300 bg-base-200/70 p-8 text-center shadow-sm">
      <h2 className="text-3xl font-bold mb-4">Ready to Start Shopping?</h2>
      <p className="mb-6 text-lg text-base-content/70">
        Browse our extensive collection of products.
      </p>
      <Link to="/products" className="btn btn-primary btn-lg">
        View All Products
      </Link>
    </div>
  </div>
);

