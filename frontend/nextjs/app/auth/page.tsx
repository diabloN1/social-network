"use client";

import type React from "react";

import { useState } from "react";
import "./auth-form.css";
import postAuth from "../api/_auth/postAuth";
import { useRouter } from "next/navigation";
import { uploadFile } from "../api/_auth/uploadFile";

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    avatar: null as any,
    nickname: "",
    aboutMe: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    username: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      setFormData({
        ...formData,
        avatar: file,
      });

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatarPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors = { ...errors };

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
      isValid = false;
    } else {
      newErrors.email = "";
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
      // Registration specific validations
      if (!formData.firstName) {
        newErrors.firstName = "First name is required";
        isValid = false;
      } else {
        newErrors.firstName = "";
      }

      if (!formData.lastName) {
        newErrors.lastName = "Last name is required";
        isValid = false;
      } else {
        newErrors.lastName = "";
      }

      if (!formData.dateOfBirth) {
        newErrors.dateOfBirth = "Date of birth is required";
        isValid = false;
      } else {
        newErrors.dateOfBirth = "";
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

      // Create FormData object to handle file upload

      try {
        if (formData.avatar) {
          const submitData = new FormData();
          submitData.append("file", formData.avatar);
          formData.avatar = await uploadFile(submitData, "/avatars");
        } else {
          formData.avatar = "";
        }

        const data = await postAuth(path, formData);

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
      } catch (err) {
        alert(err);
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
      firstName: "",
      lastName: "",
      dateOfBirth: "",
    });
    // Reset avatar preview
    setAvatarPreview(null);
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
            <>
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter your first name"
                  className={errors.firstName ? "error" : ""}
                />
                {errors.firstName && (
                  <span className="error-message">{errors.firstName}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Enter your last name"
                  className={errors.lastName ? "error" : ""}
                />
                {errors.lastName && (
                  <span className="error-message">{errors.lastName}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="nickname">Nickname (Optional)</label>
                <input
                  type="text"
                  id="nickname"
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleChange}
                  placeholder="Enter your nickname"
                />
              </div>

              <div className="form-group">
                <label htmlFor="dateOfBirth">Date of Birth</label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className={errors.dateOfBirth ? "error" : ""}
                />
                {errors.dateOfBirth && (
                  <span className="error-message">{errors.dateOfBirth}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="avatar">Profile Picture (Optional)</label>
                <input
                  type="file"
                  id="avatar"
                  name="avatar"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                {avatarPreview && (
                  <div className="avatar-preview">
                    <img
                      src={avatarPreview || "/icons/placeholder.svg"}
                      alt="Avatar preview"
                    />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="aboutMe">About Me (Optional)</label>
                <textarea
                  id="aboutMe"
                  name="aboutMe"
                  value={formData.aboutMe}
                  onChange={handleChange}
                  placeholder="Tell us about yourself"
                  rows={3}
                />
              </div>
            </>
          )}

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
