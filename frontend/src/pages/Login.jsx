import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        "http://localhost:3000/login",
        {
          email,
          password
        },
        {
          withCredentials: true
        }
      );

      navigate("/exam");
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Login failed. Please check your email and password.");
    }
  };

  return (
    <div className="container page-container">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card p-5">
            <div className="text-center mb-4">
              <span className="badge bg-primary mb-3">
                Welcome Back
              </span>

              <h1 className="section-title">
                Login
              </h1>

              <p className="text-muted">
                Continue your IELTS practice journey.
              </p>
            </div>

            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label className="form-label">
                  Email
                </label>

                <input
                  type="email"
                  className="form-control"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label">
                  Password
                </label>

                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button className="btn btn-primary w-100">
                Login
              </button>
            </form>

            <p className="text-center text-muted mt-4 mb-0">
              Do not have an account?{" "}
              <Link to="/register">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;