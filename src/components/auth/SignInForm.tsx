"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import styles from "./AnimatedLoginForm.module.css";
import "remixicon/fonts/remixicon.css";
import { BUTTON_LOADING_CONFIG } from '@/lib/config/ui.config';

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingDots, setLoadingDots] = useState('.');
  const { login } = useAuth();

  // Animation for loading dots
  useEffect(() => {
    if (isSubmitting) {
      const interval = setInterval(() => {
        setLoadingDots((prev) => {
          if (prev === '.') return '..';
          if (prev === '..') return '...';
          return '.';
        });
      }, BUTTON_LOADING_CONFIG.DOTS_ANIMATION_INTERVAL);

      return () => clearInterval(interval);
    } else {
      setLoadingDots('.');
    }
  }, [isSubmitting]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(username, password);
      // Redirect is handled by AuthContext
    } catch (err: any) {
      setError(err.message || "Đăng nhập thất bại. Vui lòng kiểm tra thông tin đăng nhập.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.login}>
      <Image
        src="/images/auth/login-bg.png"
        alt="nền đăng nhập"
        className={styles.loginImg}
        fill
        priority
        sizes="100vw"
      />
      
      <form className={styles.loginForm} onSubmit={handleSubmit}>
        <h1 className={styles.loginTitle}>Đăng nhập</h1>

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
                Tên đăng nhập
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
                Mật khẩu
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

        {/* Error message */}
        {error && (
          <div className={styles.loginError} style={{ color: 'red', marginBottom: '1rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

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
              Ghi nhớ đăng nhập
            </label>
          </div>
          <Link href="/reset-password" className={styles.loginForgot}>
            Quên mật khẩu?
          </Link>
        </div>

        <button 
          type="submit" 
          className={styles.loginButton}
          disabled={isSubmitting}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
        >
          {isSubmitting && (
            <svg
              className="animate-spin"
              style={{ width: '16px', height: '16px', color: 'white' }}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                style={{ opacity: 0.25 }}
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                style={{ opacity: 0.75 }}
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          )}
          {isSubmitting ? `Đang đăng nhập${loadingDots}` : 'Đăng nhập'}
        </button>
      </form>
    </div>
  );
}
