import { useState } from "react";
import axios from "axios";

function Register() {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      const response =
        await axios.post(
          "http://localhost:3000/register",
          {
            name,
            email,
            password
          }
        );

      console.log(response.data);

      alert("Registration successful!");

    }
    catch(error) {

      console.log(error);

      alert("Registration failed");

    }

  };

  return (
    <div className="container mt-5">

      <h1>Register</h1>

      <form onSubmit={handleSubmit}>

        <div className="mb-3">

          <label>Name</label>

          <input
            type="text"
            className="form-control"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
          />

        </div>

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
          className="btn btn-success"
        >
          Register
        </button>

      </form>

    </div>
  );
}

export default Register;