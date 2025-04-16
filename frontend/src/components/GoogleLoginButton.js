import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const GoogleLoginButton = () => {
  return (
    <GoogleOAuthProvider clientId="962168130471-9mv2m6qefvbdkq7qfbaisfsk5o6nisfu.apps.googleusercontent.com">
      <GoogleLogin
        onSuccess={(credentialResponse) => {
          console.log('Login Success:', credentialResponse);
          // Handle login success (e.g., store token, redirect)
        }}
        onError={() => {
          console.log('Login Failed');
        }}
        useOneTap
      />
    </GoogleOAuthProvider>
  );
};
export default GoogleLoginButton;