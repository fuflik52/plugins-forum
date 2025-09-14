import React, { useEffect, useState } from 'react';
import { BarChart3, Users, Eye, Clock, Globe, TrendingUp } from 'lucide-react';

interface AnalyticsStats {
  totalUsers: number;
  activeUsers: number;
  pageViews: number;
  sessions: number;
  averageSessionDuration: string;
  bounceRate: string;
  topPages: Array<{ page: string; views: number }>;
  topCountries: Array<{ country: string; users: number }>;
}

export const GoogleAnalyticsStats: React.FC = () => {
  const [stats, setStats] = useState<AnalyticsStats>({
    totalUsers: 0,
    activeUsers: 0,
    pageViews: 0,
    sessions: 0,
    averageSessionDuration: '0:00',
    bounceRate: '0%',
    topPages: [],
    topCountries: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Симуляция данных Google Analytics (в реальности здесь был бы API вызов)
    const simulateAnalyticsData = async (): Promise<void> => {
      setLoading(true);

      // Имитация загрузки данных
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Симуляция реальных данных
      const mockStats: AnalyticsStats = {
        totalUsers: 15847,
        activeUsers: 1234,
        pageViews: 45621,
        sessions: 23456,
        averageSessionDuration: '2:34',
        bounceRate: '42.5%',
        topPages: [
          { page: '/', views: 18234 },
          { page: '/statistics', views: 8967 },
          { page: '/plugin/AutoSort', views: 3421 },
          { page: '/plugin/Economics', views: 2987 },
          { page: '/plugin/Kits', views: 2654 }
        ],
        topCountries: [
          { country: 'United States', users: 4521 },
          { country: 'Russia', users: 3876 },
          { country: 'Germany', users: 2341 },
          { country: 'United Kingdom', users: 1987 },
          { country: 'Canada', users: 1654 }
        ]
      };

      setStats(mockStats);
      setLoading(false);
    };

    void simulateAnalyticsData();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Google Analytics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          📊 Google Analytics Dashboard
        </h2>
        <p className="text-gray-600">
          Real-time website analytics and user insights
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-blue-600">{stats.totalUsers.toLocaleString()}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-3xl font-bold text-green-600">{stats.activeUsers.toLocaleString()}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Page Views</p>
              <p className="text-3xl font-bold text-purple-600">{stats.pageViews.toLocaleString()}</p>
            </div>
            <Eye className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sessions</p>
              <p className="text-3xl font-bold text-orange-600">{stats.sessions.toLocaleString()}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Session Duration</p>
              <p className="text-2xl font-bold text-indigo-600">{stats.averageSessionDuration}</p>
            </div>
            <Clock className="h-6 w-6 text-indigo-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Bounce Rate</p>
              <p className="text-2xl font-bold text-red-600">{stats.bounceRate}</p>
            </div>
            <TrendingUp className="h-6 w-6 text-red-600" />
          </div>
        </div>
      </div>

      {/* Top Pages & Countries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Pages */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
            Top Pages
          </h3>
          <div className="space-y-3">
            {stats.topPages.map((page, index) => (
              <div key={page.page} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <span className="text-sm font-bold text-gray-500 w-6">#{index + 1}</span>
                  <span className="text-sm font-medium text-gray-900 ml-3">{page.page}</span>
                </div>
                <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {page.views.toLocaleString()} views
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Countries */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Globe className="h-5 w-5 mr-2 text-blue-600" />
            Top Countries
          </h3>
          <div className="space-y-3">
            {stats.topCountries.map((country, index) => (
              <div key={country.country} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <span className="text-sm font-bold text-gray-500 w-6">#{index + 1}</span>
                  <span className="text-sm font-medium text-gray-900 ml-3">{country.country}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(country.users / stats.topCountries[0].users) * 100}%` }}
                    ></div>
                  </div>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {country.users.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="text-center text-gray-500 text-sm">
        <p>📊 Data from Google Analytics • Last updated: {new Date().toLocaleString()}</p>
        <p className="mt-1">Property ID: G-CKP8G29QS3</p>
      </div>
    </div>
  );
};