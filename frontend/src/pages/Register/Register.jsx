import { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export const Register = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { register, loading } = useContext(AuthContext);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) => {
    return {
      hasLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[!@#$%^&*]/.test(password),
    };
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name?.trim()) newErrors.name = 'Name is required';
    else if (formData.name.length < 2) newErrors.name = 'Name must be at least 2 characters';

    if (!formData.email?.trim()) newErrors.email = 'Email is required';
    else if (!validateEmail(formData.email)) newErrors.email = 'Invalid email format';

    if (!formData.password?.trim()) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await register(formData.name, formData.email, formData.password);
      toast.success('Account created successfully! Please log in.');
      navigate('/login');
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(message);
    }
  };

  const passwordStrength = validatePassword(formData.password);
  const strengthScore = Object.values(passwordStrength).filter(Boolean).length;

  return (
    <div className="flex min-h-screen items-center justify-center `bg-linear-to-br` from-gray-900 via-stone-800 to-gray-900 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-block rounded-lg bg-white/20 p-3 backdrop-blur">
            <span className="text-4xl">🛒</span>
          </div>
          <h1 className="mb-2 text-4xl font-bold text-white">CloudCart</h1>
          <p className="text-white/80">Join our shopping community</p>
        </div>

        <div className="card border border-white/10 bg-base-100 shadow-2xl">
          <div className="card-body space-y-6">
            <h2 className="card-title text-2xl justify-center mb-2">Create Your Account</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Field */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Full Name</span>
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  className={`input input-bordered w-full transition ${
                    errors.name ? 'input-error focus:input-error' : 'focus:input-primary'
                  }`}
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading}
                />
                {errors.name && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.name}</span>
                  </label>
                )}
              </div>

              {/* Email Field */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Email Address</span>
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  className={`input input-bordered w-full transition ${
                    errors.email ? 'input-error focus:input-error' : 'focus:input-primary'
                  }`}
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                />
                {errors.email && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.email}</span>
                  </label>
                )}
              </div>

              {/* Password Field */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="••••••••"
                    className={`input input-bordered w-full transition pr-10 ${
                      errors.password ? 'input-error focus:input-error' : 'focus:input-primary'
                    }`}
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-base-content/70 hover:text-base-content/90"
                    tabIndex="-1"
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {errors.password && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.password}</span>
                  </label>
                )}

                {/* Password Strength Indicator */}
                    {formData.password && (
                  <div className="mt-2 rounded-lg bg-base-200 p-3">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-xs font-semibold">Password Strength:</span>
                      <div className="flex flex-1 gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition ${
                              i <= strengthScore ? 'bg-success' : 'bg-base-300'
                            }`}
                          ></div>
                        ))}
                      </div>
                    </div>
                    <ul className="space-y-1 text-xs">
                      <li className={passwordStrength.hasLength ? 'text-success' : 'text-base-content/40'}>
                        ✓ At least 8 characters
                      </li>
                      <li className={passwordStrength.hasUpperCase ? 'text-success' : 'text-base-content/40'}>
                        ✓ Uppercase letter
                      </li>
                      <li className={passwordStrength.hasLowerCase ? 'text-success' : 'text-base-content/40'}>
                        ✓ Lowercase letter
                      </li>
                      <li className={passwordStrength.hasNumber ? 'text-success' : 'text-base-content/40'}>
                        ✓ Number
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Confirm Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="••••••••"
                    className={`input input-bordered w-full transition pr-10 ${
                      errors.confirmPassword ? 'input-error focus:input-error' : 'focus:input-primary'
                    }`}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-base-content/70 hover:text-base-content/90"
                    tabIndex="-1"
                  >
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.confirmPassword}</span>
                  </label>
                )}
              </div>

              

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full btn-lg gap-2 mt-6"
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Creating Account...
                  </>
                ) : (
                  '→ Create Account'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="divider my-2">OR</div>

            {/* Login Link */}
            <p className="text-center text-sm text-base-content/70">
              Already have an account?{' '}
              <Link to="/login" className="link link-primary font-semibold">
                Log in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
