"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./AnimatedLoginForm.module.css";
import "remixicon/fonts/remixicon.css";

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const validateEmail = (emailValue: string): boolean => {
    if (!emailValue.trim()) {
      setEmailError("Email không được để trống");
      return false;
    }
    if (!EMAIL_REGEX.test(emailValue)) {
      setEmailError("Email không hợp lệ");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (validateEmail(email)) {
      // TODO: Integrate with API
      setSubmittedEmail(email);
      setIsSubmitted(true);
      console.log("Reset password for:", email);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (emailError) {
      validateEmail(value);
    }
  };

  const maskEmail = (email: string): string => {
    if (!email) return "";
    const [localPart, domain] = email.split("@");
    if (!localPart || !domain) return email;
    
    const visibleChars = Math.min(3, localPart.length);
    const masked = localPart.substring(0, visibleChars) + "***";
    return `${masked}@${domain}`;
  };

  return (
    <div className={styles.login}>
      <Image
        src="/images/auth/login-bg.png"
        alt="nền đặt lại mật khẩu"
        className={styles.loginImg}
        fill
        priority
        sizes="100vw"
      />
      
      <form className={styles.loginForm} onSubmit={handleSubmit}>
        <h1 className={styles.loginTitle}>Đặt lại mật khẩu</h1>

        {!isSubmitted ? (
          <>
            {/* Info message */}
            <div className="mb-6 p-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
              <p className="text-sm text-white text-center leading-relaxed">
                Nhập email đã xác thực:{" "}
                <strong className="font-semibold text-yellow-200">
                  {email ? maskEmail(email) : "***@gmail.com"}
                </strong>
              </p>
            </div>

            <div className={styles.loginContent}>
              {/* Email Input */}
              <div className={styles.loginBox}>
                <i className={`ri-mail-line ${styles.loginIcon}`}></i>
                <div className={styles.loginBoxInput}>
                  <input
                    type="email"
                    id="reset-email"
                    className={`${styles.loginInput} ${emailError ? "border-red-400" : ""}`}
                    placeholder=" "
                    value={email}
                    onChange={handleEmailChange}
                    onBlur={() => validateEmail(email)}
                    required
                  />
                  <label htmlFor="reset-email" className={styles.loginLabel}>
                    Email
                  </label>
                </div>
              </div>
              
              {emailError && (
                <p className="text-red-300 text-sm mt-1 flex items-center gap-1">
                  <i className="ri-error-warning-line"></i>
                  {emailError}
                </p>
              )}
            </div>

            <button type="submit" className={styles.loginButton}>
              Gửi mật khẩu mới
            </button>

            <div className="text-center mt-4">
              <Link 
                href="/login" 
                className="text-sm text-white hover:underline flex items-center justify-center gap-1"
              >
                <i className="ri-arrow-left-line"></i>
                Quay lại trang Đăng nhập
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="mb-6 p-4 rounded-lg bg-green-500/20 backdrop-blur-sm border border-green-400/30">
              <i className="ri-checkbox-circle-line text-4xl text-green-300 mb-3 block"></i>
              <p className="text-sm text-white leading-relaxed">
                <strong className="font-semibold text-green-200">Mật khẩu mới</strong> đã được gửi đến email{" "}
                <strong className="font-semibold text-green-300">{submittedEmail}</strong>.
                <br />
                <span className="mt-2 block text-white/90">Vui lòng kiểm tra email để đăng nhập.</span>
              </p>
            </div>

            <Link 
              href="/login" 
              className="inline-block text-sm text-white hover:underline flex items-center justify-center gap-1"
            >
              <i className="ri-arrow-left-line"></i>
              Quay lại trang Đăng nhập
            </Link>
          </div>
        )}
      </form>
    </div>
  );
}
