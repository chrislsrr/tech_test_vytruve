import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await userService.login(formData);
      if (!response?.accessToken) {
        throw new Error('No accessToken received from server');
      }
      localStorage.setItem('token', response.accessToken);
      navigate('/patients');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please try again.');
    }
  };

  const goToRegister = () => {
    navigate('/register');
  };

  return (
    <div>
      <h1>Login</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Email:
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john.doe@example.com"
              required
            />
          </label>
        </div>
        <div>
          <label>
            Password:
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="password123"
              minLength={6}
              required
            />
          </label>
        </div>
        <button type="submit">Login</button>
      </form>
      <p>
        Don&apos;t have an account?{' '}
        <button onClick={goToRegister} type="button">
          Create account
        </button>
      </p>
    </div>
  );
}

export default Login;
