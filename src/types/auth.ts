/**
 * Authentication Types
 */

import { ResponseObject } from './common';

// Authentication Request
export interface AuthenticationRequest {
  username: string;
  password: string;
}

// Authentication Response
export interface AuthenticationResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number; // seconds
  refreshTokenExpiresIn: number; // seconds
}

// Refresh Token Response
export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number; // seconds
  refreshTokenExpiresIn: number; // seconds
}

// API Response Types
export interface AuthenticationResponseData extends ResponseObject<AuthenticationResponse> {}

export interface RefreshTokenResponseData extends ResponseObject<RefreshTokenResponse> {}
