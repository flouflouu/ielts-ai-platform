import { useState } from "react";
import axios from "axios";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

  const response =
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

  console.log(response.data);

}
catch(error) {

  console.log(error);

}
  };

  return (
    <div className="container mt-5">
      <h1>Login</h1>

      <form onSubmit={handleSubmit}>

        <div className="mb-3">
          <label>Email</label>

          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />
        </div>

        <div className="mb-3">
          <label>Password</label>

          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
        >
          Login
        </button>

      </form>
    </div>
  );
}

export default Login;