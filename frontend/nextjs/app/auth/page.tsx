"use client";

import type React from "react";

import { useState } from "react";
import "./auth-form.css";
import postAuth from "./actions/postAuth";
import { useRouter } from "next/navigation";

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    username: "",
    confirmPassword: "",
  });

  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors = { ...errors };

    // Registration specific validations
    if (!formData.username) {
      newErrors.username = "Username/Email is required";
      isValid = false;
    } else {
      newErrors.username = "";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    } else {
      newErrors.password = "";
    }

    if (!isLogin) {
      // Email validation
      if (!formData.email) {
        newErrors.username = "email is required";
        isValid = false;
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Email is invalid";
        isValid = false;
      } else {
        newErrors.email = "";
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
        isValid = false;
      } else {
        newErrors.confirmPassword = "";
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      const path = isLogin ? "login" : "register";
      const data = await postAuth(path, formData);

      console.log("data---------", data);
      if (data.error && errors.hasOwnProperty(data.type)) {
        setErrors({
          ...errors,
          [data.type]: data.error,
        });
        return;
      }

      if (data.session) {
        router.push("/app");
      }
    }
  };

  const toggleView = () => {
    setIsLogin(!isLogin);
    // Reset errors when toggling views
    setErrors({
      email: "",
      password: "",
      username: "",
      confirmPassword: "",
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>{isLogin ? "Welcome Back" : "Create Account"}</h1>
          <p>{isLogin ? "Sign in to continue" : "Sign up to get started"}</p>
        </div>

        <form className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className={errors.email ? "error" : ""}
              />
              {errors.email && (
                <span className="error-message">{errors.email}</span>
              )}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">username</label>
            <input
              type="text"
              id="name"
              name="username"
              onChange={handleChange}
              placeholder="Enter your name"
              className={errors.username ? "error" : ""}
            />
            {errors.username && (
              <span className="error-message">{errors.username}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className={errors.password ? "error" : ""}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type={showPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                className={errors.confirmPassword ? "error" : ""}
              />
              {errors.confirmPassword && (
                <span className="error-message">{errors.confirmPassword}</span>
              )}
            </div>
          )}

          <button
            type="button"
            className="submit-button"
            onClick={handleSubmit}
          >
            {isLogin ? "Sign In" : "Sign Up"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button type="button" className="toggle-view" onClick={toggleView}>
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
