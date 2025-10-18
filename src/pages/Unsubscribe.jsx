import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getApiUrl } from '../config/api';

export default function Unsubscribe() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // loading, success, error, invalid
  const [email, setEmail] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('invalid');
      return;
    }

    handleUnsubscribe(token);
  }, [searchParams]);

  const handleUnsubscribe = async (token) => {
    try {
      const response = await fetch(getApiUrl(`/api/newsletter/unsubscribe/${token}`), {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to unsubscribe');
      }

      const data = await response.json();
      setEmail(data.email);
      setStatus('success');
    } catch (error) {
      console.error('Error unsubscribing:', error);
      setStatus('error');
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
            <h2 style={{ marginBottom: '16px' }}>Processing...</h2>
            <p style={{ color: '#666' }}>Please wait while we unsubscribe you from our newsletter.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>✓</div>
            <h2 style={{ marginBottom: '16px', color: '#10b981' }}>Successfully Unsubscribed</h2>
            <p style={{ color: '#666', marginBottom: '8px' }}>
              You have been removed from our newsletter mailing list.
            </p>
            {email && (
              <p style={{ color: '#999', fontSize: '14px', marginBottom: '24px' }}>
                ({email})
              </p>
            )}
            <p style={{ color: '#666' }}>
              We're sorry to see you go! If you change your mind, you can always sign up again through our website.
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
            <h2 style={{ marginBottom: '16px', color: '#ef4444' }}>Error</h2>
            <p style={{ color: '#666', marginBottom: '24px' }}>
              We couldn't process your unsubscribe request. The link may be invalid or expired.
            </p>
            <p style={{ color: '#666' }}>
              Please contact us at <a href="mailto:mark@mjpetersonart.com" style={{ color: 'var(--color-gunmetal, #122d38)' }}>mark@mjpetersonart.com</a> if you need assistance.
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
              This unsubscribe link is invalid or missing required information.
            </p>
            <p style={{ color: '#666' }}>
              Please use the unsubscribe link from your newsletter email, or contact us at{' '}
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
