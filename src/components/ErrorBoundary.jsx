import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Eva Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', background: '#0d0d1a',
          color: '#fff', padding: 40, textAlign: 'center',
        }}>
          <span style={{ fontSize: 48, marginBottom: 16 }}>{'😔'}</span>
          <h1 style={{ fontSize: 24, marginBottom: 8 }}>Something went wrong</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 24 }}>
            Eva ran into an issue. Don't worry, your data is safe.
          </p>
          <button onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
            style={{
              padding: '12px 32px', background: '#6c5ce7', border: 'none',
              borderRadius: 24, color: '#fff', fontSize: 16, cursor: 'pointer',
            }}>
            Restart Eva
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
