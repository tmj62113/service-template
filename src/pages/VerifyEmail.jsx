import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // loading, success, error, invalid
  const [email, setEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('invalid');
      return;
    }

    handleVerifyEmail(token);
  }, [searchParams]);

  const handleVerifyEmail = async (token) => {
    try {
      const response = await fetch(`http://localhost:3001/api/verify-email/${token}`);

      if (!response.ok) {
        throw new Error('Failed to verify email');
      }

      const data = await response.json();
      setEmail(data.email);
      setStatus('success');
    } catch (error) {
      console.error('Error verifying email:', error);
      setStatus('error');
    }
  };

  const handleResendVerification = async () => {
    if (!email) return;

    setResending(true);
    setResendSuccess(false);

    try {
      const response = await fetch('http://localhost:3001/api/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to resend verification');
      }

      setResendSuccess(true);
    } catch (error) {
      console.error('Error resending verification:', error);
      alert('Failed to resend verification email. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
    }}>
      <div style={{
        maxWidth: '600px',
        width: '100%',
        textAlign: 'center',
        padding: '40px',
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}>
        {status === 'loading' && (
          <>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
            <h2 style={{ marginBottom: '16px' }}>Verifying Your Email...</h2>
            <p style={{ color: '#666' }}>Please wait while we verify your email address.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>✓</div>
            <h2 style={{ marginBottom: '16px', color: '#10b981' }}>Email Verified!</h2>
            <p style={{ color: '#666', marginBottom: '8px' }}>
              Your email has been successfully verified.
            </p>
            {email && (
              <p style={{ color: '#999', fontSize: '14px', marginBottom: '24px' }}>
                ({email})
              </p>
            )}
            <p style={{ color: '#666', marginBottom: '24px' }}>
              You are now subscribed to Mark J Peterson Art newsletter and will receive updates about new artwork, exclusive offers, and more!
            </p>
            <a
              href="/"
              style={{
                display: 'inline-block',
                marginTop: '24px',
                padding: '12px 32px',
                background: 'var(--color-gunmetal, #122d38)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px',
                transition: 'background 0.2s ease',
              }}
            >
              Return to Homepage
            </a>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>✗</div>
            <h2 style={{ marginBottom: '16px', color: '#ef4444' }}>Verification Failed</h2>
            <p style={{ color: '#666', marginBottom: '24px' }}>
              We couldn't verify your email address. The link may be invalid or already used.
            </p>
            {email && (
              <>
                <p style={{ color: '#666', marginBottom: '16px' }}>
                  Would you like us to send a new verification email?
                </p>
                {resendSuccess ? (
                  <p style={{ color: '#10b981', marginBottom: '24px' }}>
                    ✓ New verification email sent! Please check your inbox.
                  </p>
                ) : (
                  <button
                    onClick={handleResendVerification}
                    disabled={resending}
                    style={{
                      padding: '12px 32px',
                      background: resending ? '#ccc' : 'var(--color-gunmetal, #122d38)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: resending ? 'not-allowed' : 'pointer',
                      marginBottom: '24px',
                    }}
                  >
                    {resending ? 'Sending...' : 'Resend Verification Email'}
                  </button>
                )}
              </>
            )}
            <p style={{ color: '#666' }}>
              Need help? Contact us at <a href="mailto:mark@mjpetersonart.com" style={{ color: 'var(--color-gunmetal, #122d38)' }}>mark@mjpetersonart.com</a>
            </p>
            <a
              href="/"
              style={{
                display: 'inline-block',
                marginTop: '24px',
                padding: '12px 32px',
                background: 'var(--color-gunmetal, #122d38)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px',
                transition: 'background 0.2s ease',
              }}
            >
              Return to Homepage
            </a>
          </>
        )}

        {status === 'invalid' && (
          <>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠</div>
            <h2 style={{ marginBottom: '16px', color: '#f59e0b' }}>Invalid Link</h2>
            <p style={{ color: '#666', marginBottom: '24px' }}>
              This verification link is invalid or missing required information.
            </p>
            <p style={{ color: '#666' }}>
              Please use the verification link from your email, or contact us at{' '}
              <a href="mailto:mark@mjpetersonart.com" style={{ color: 'var(--color-gunmetal, #122d38)' }}>mark@mjpetersonart.com</a> for help.
            </p>
            <a
              href="/"
              style={{
                display: 'inline-block',
                marginTop: '24px',
                padding: '12px 32px',
                background: 'var(--color-gunmetal, #122d38)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px',
                transition: 'background 0.2s ease',
              }}
            >
              Return to Homepage
            </a>
          </>
        )}
      </div>
    </div>
  );
}
