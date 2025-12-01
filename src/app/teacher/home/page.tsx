'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { authAPI } from '@/lib/api';
import { User, getRoleName, UserRole } from '@/types';

export default function TeacherHomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const token = Cookies.get('access_token');

      if (!token) {
        router.push('/auth/login');
        return;
      }

      try {
        const userData = await authAPI.getCurrentUser();

        // Check if user is teacher or admin
        if (userData.role !== UserRole.Teacher && userData.role !== UserRole.Admin) {
          // Redirect to appropriate page
          if (userData.role === UserRole.Student) {
            router.push('/student/home');
          } else {
            setError('アクセス権限がありません');
          }
          return;
        }

        setUser(userData);
      } catch (err: any) {
        console.error('Failed to fetch user:', err);
        Cookies.remove('access_token');
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      Cookies.remove('access_token');
      router.push('/auth/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            ログイン画面へ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">ask - 先生ダッシュボード</h1>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 bg-blue-50">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {(() => {
                  const displayName = user?.full_name ?? user?.email ?? '';
                  const suffix = displayName && !displayName.includes('@') ? 'さん' : '';
                  return `ようこそ、${displayName}${suffix}`;
                })()}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                先生用ダッシュボードにログインしました
              </p>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">メールアドレス</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {user?.email}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">ロール</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {user && getRoleName(user.role)} ({user?.role})
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">アカウント状態</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {user?.is_active ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        有効
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        無効
                      </span>
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="mt-6 bg-purple-50 border border-purple-200 rounded-md p-6">
            <h4 className="text-lg font-semibold text-purple-900 mb-2">先生用機能</h4>
            <p className="text-sm text-purple-700 mb-4">
              このページは先生専用のダッシュボードです。今後、以下の機能が追加される予定です:
            </p>
            <ul className="list-disc list-inside text-sm text-purple-700 space-y-1">
              <li>生徒の評価管理</li>
              <li>学習進捗の確認</li>
              <li>生徒データの閲覧（権限制御あり）</li>
              <li>レポート作成</li>
            </ul>
          </div>

          <div className="mt-6 bg-green-50 border border-green-200 rounded-md p-6">
            <h4 className="text-lg font-semibold text-green-900 mb-2">アクセス権限</h4>
            <p className="text-sm text-green-700">
              先生ロールでは、すべての生徒データにアクセスできます。生徒は他の生徒のデータにアクセスできません。
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
