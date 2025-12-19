"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./AnimatedLoginForm.module.css";
import "remixicon/fonts/remixicon.css";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: Integrate with API
    console.log("Login:", { username, password, rememberMe: isChecked });
  };

  return (
    <div className={styles.login}>
      <Image
        src="/images/auth/login-bg.png"
        alt="login background"
        className={styles.loginImg}
        fill
        priority
        sizes="100vw"
      />
      
      <form className={styles.loginForm} onSubmit={handleSubmit}>
        <h1 className={styles.loginTitle}>Login</h1>

        <div className={styles.loginContent}>
          {/* Username Input */}
          <div className={styles.loginBox}>
            <i className={`ri-user-3-line ${styles.loginIcon}`}></i>
            <div className={styles.loginBoxInput}>
              <input
                type="text"
                id="login-username"
                className={styles.loginInput}
                placeholder=" "
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <label htmlFor="login-username" className={styles.loginLabel}>
                Username
              </label>
            </div>
          </div>

          {/* Password Input */}
          <div className={styles.loginBox}>
            <i className={`ri-lock-2-line ${styles.loginIcon}`}></i>
            <div className={styles.loginBoxInput}>
              <input
                type={showPassword ? "text" : "password"}
                id="login-pass"
                className={styles.loginInput}
                placeholder=" "
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <label htmlFor="login-pass" className={styles.loginLabel}>
                Password
              </label>
              <i
                className={`${showPassword ? "ri-eye-line" : "ri-eye-off-line"} ${styles.loginEye}`}
                onClick={() => setShowPassword(!showPassword)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setShowPassword(!showPassword);
                  }
                }}
              ></i>
            </div>
          </div>
        </div>

        {/* Remember me & Forgot password */}
        <div className={styles.loginCheck}>
          <div className={styles.loginCheckGroup}>
            <input
              type="checkbox"
              id="login-check"
              className={styles.loginCheckInput}
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
            />
            <label htmlFor="login-check" className={styles.loginCheckLabel}>
              Remember me
            </label>
          </div>
          <Link href="/reset-password" className={styles.loginForgot}>
            Forgot Password?
          </Link>
        </div>

        <button type="submit" className={styles.loginButton}>
          Login
        </button>
      </form>
    </div>
  );
}
