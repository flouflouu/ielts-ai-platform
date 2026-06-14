import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:3000/register", {
        name,
        email,
        password
      });

      alert("Registration successful. Please login.");
      navigate("/login");
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Registration failed.");
    }
  };

  return (
    <div className="container page-container">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card p-5">
            <div className="text-center mb-4">
              <span className="badge bg-primary mb-3">
                Create Account
              </span>

              <h1 className="section-title">
                Register
              </h1>

              <p className="text-muted">
                Start practicing IELTS with AI feedback.
              </p>
            </div>

            <form onSubmit={handleRegister}>
              <div className="mb-3">
                <label className="form-label">
                  Full Name
                </label>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

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
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button className="btn btn-primary w-100">
                Register
              </button>
            </form>

            <p className="text-center text-muted mt-4 mb-0">
              Already have an account?{" "}
              <Link to="/login">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;