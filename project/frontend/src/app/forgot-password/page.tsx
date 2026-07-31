'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-slate-100">Reset Password</h1>
        <p className="text-xs text-slate-400">Enter your email to receive password reset instructions</p>
      </div>

      <Card className="p-6">
        {submitted ? (
          <div className="space-y-4 text-center">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl">
              Password reset link sent! Check your inbox.
            </div>
            <Link href="/login">
              <Button variant="outline" className="w-full">
                Back to Sign In
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="admin@acme.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" variant="primary" className="w-full">
              Send Reset Link
            </Button>
            <div className="text-center">
              <Link href="/login" className="text-xs text-slate-400 hover:text-slate-200">
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
