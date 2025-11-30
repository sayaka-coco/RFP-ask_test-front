'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { authAPI } from '@/lib/api';
import { UserRole } from '@/types';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login({ email, password });

      // Store token in cookie
      Cookies.set('access_token', response.access_token, { expires: 1 });

      // Redirect based on role
      if (response.user.role === UserRole.Student) {
        router.push('/student/home');
      } else if (response.user.role === UserRole.Teacher) {
        router.push('/teacher/home');
      } else {
        router.push('/student/home');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'ログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.googleLogin(credentialResponse.credential);

      // Store token in cookie
      Cookies.set('access_token', response.access_token, { expires: 1 });

      // Redirect based on role
      if (response.user.role === UserRole.Student) {
        router.push('/student/home');
      } else if (response.user.role === UserRole.Teacher) {
        router.push('/teacher/home');
      } else {
        router.push('/student/home');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Googleログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Googleログインがキャンセルされました');
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              HugHigh ログイン
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              生徒・先生用ログインシステム
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleEmailLogin}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email" className="sr-only">
                  メールアドレス
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="メールアドレス"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  パスワード
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="パスワード"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
              >
                {loading ? 'ログイン中...' : 'ログイン'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">または</span>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
                text="signin_with"
                locale="ja"
              />
            </div>
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
            <p className="text-sm font-semibold text-blue-800 mb-2">テストアカウント:</p>
            <div className="text-xs text-blue-700 space-y-1">
              <p><strong>生徒:</strong> student1@example.com / password123</p>
              <p><strong>先生:</strong> teacher1@example.com / password123</p>
            </div>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}
