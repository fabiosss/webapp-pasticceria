'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errore, setErrore] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrore('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrore('❌ Email o password errati.');
    } else {
      router.push('/calendario');
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: 'var(--colore-secondario)' }}
    >
      <div
        className="rounded-xl shadow-lg"
        style={{
          backgroundColor: 'white',
          padding: '32px',
          width: '100%',
          maxWidth: '400px',
          boxShadow: 'var(--ombra)',
          borderRadius: 'var(--bordo)',
          margin: '0 auto',
        }}
      >
        <h1
          style={{
            fontSize: '1.8rem',
            fontWeight: 'bold',
            marginBottom: '1.5rem',
            color: 'var(--colore-primario)',
            textAlign: 'center',
          }}
        >
          🔐 Accedi
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="login-input"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
          />
          <button onClick={handleLogin} className="button">
            ➡️ Login
          </button>
        </div>
      </div>
    </div>
  );

}

