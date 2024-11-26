import React, { useState } from "react";
import "../App.css";
import { FaFacebook } from "react-icons/fa6";
import { FcGoogle } from "react-icons/fc";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Mainpage({ toast, signIn, user }) {
  const [users, setUsers] = useState({ userName: "", email: "", password: "" });
  const [userLogin, setUserLogin] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const googleAuth = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      console.log(apiUrl);
      if (!apiUrl) throw new Error("API URL is not defined");
      window.open(`${apiUrl}/google`, "_self");
    } catch (error) {
      toast.error("Google sign-in failed");
      console.error(error);
    }
  };

  const fbAuth = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      if (!apiUrl) throw new Error("API URL is not defined");
      window.open(`${apiUrl}/facebook`, "_self");
    } catch (error) {
      toast.error("Facebook sign-in failed");
      console.error(error);
    }
  };

  const openForgotPass = () => {
    navigate("/forgotpass");
  };

  function handleOnchange(e) {
    setUsers({
      ...users,
      [e.target.name]: e.target.value,
    });
  }

  function handleUserLogin(e) {
    setUserLogin({
      ...userLogin,
      [e.target.name]: e.target.value,
    });
  }

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!isValidEmail(userLogin.email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (userLogin.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/login`,
        userLogin
      );
      if (response.data && response.data.success) {
        toast.success("Login successfully");
        signIn(); // Call the parent function to update the logged-in state
        navigate("/Home");
      } else {
        toast.error(response.data.message || "Invalid login credentials");
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error("An error occurred during login. Please try again.");
    } finally {
      setUserLogin({ email: "", password: "" });
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    axios
      .post(`${process.env.REACT_APP_API_URL}/register`, users)
      .then((result) => {
        console.log(result);
        if (result.data !== "Already Registerd") {
          toast.success("Registered Successfully..");
          setUsers({ userName: "", email: "", password: "" });
          signIn();
        } else {
          toast.error(result.data);
          setUsers({ userName: "", email: "", password: "" });
          signIn();
        }
      })
      .catch((err) => console.log(err));
  };

  return (
    <>
      <div className="form-container sign-up">
        <form method="POST" action="/" onSubmit={(e) => handleRegister(e)}>
          <h1>Create Account</h1>
          <div className="social-icons">
            <button type="button" onClick={googleAuth} className="icon">
              <FcGoogle size={22} />
            </button>
            <button type="button" onClick={fbAuth} className="icon">
              <FaFacebook size={22} />
            </button>
          </div>
          <span>or use your email for registration</span>
          <input
            type="text"
            placeholder="Username"
            id="userName"
            name="userName"
            value={users.userName}
            onChange={(e) => handleOnchange(e)}
          />
          <input
            type="email"
            placeholder="Email"
            id="email"
            name="email"
            value={users.email}
            onChange={(e) => handleOnchange(e)}
          />
          <input
            type="password"
            placeholder="Password"
            id="password"
            name="password"
            value={users.password}
            onChange={(e) => handleOnchange(e)}
          />
          <button className="bt" type="submit">
            Sign Up
          </button>
        </form>
      </div>

      <div className="form-container sign-in">
        <form method="POST" action="/" onSubmit={(e) => handleLogin(e)}>
          <h1>Sign In</h1>
          <div className="social-icons">
            <button type="button" onClick={googleAuth} className="icon">
              <FcGoogle size={22} />
            </button>
            <button type="button" onClick={fbAuth} className="icon">
              <FaFacebook size={22} />
            </button>
          </div>
          <span>or use your email and password</span>
          <input
            type="email"
            name="email"
            value={userLogin.email}
            onChange={(e) => handleUserLogin(e)}
            placeholder="Email"
          />
          <input
            type="password"
            name="password"
            value={userLogin.password}
            onChange={(e) => handleUserLogin(e)}
            placeholder="Password"
          />
          <a onClick={openForgotPass} href="/forgotpass">
            Forget your password?
          </a>
          <button className="bt" type="submit">
            Sign In
          </button>
        </form>
      </div>
    </>
  );
}
