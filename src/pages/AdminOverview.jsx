import { useState, useEffect } from 'react';
import { getApiUrl } from '../config/api';

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(getApiUrl('/api/orders/stats/summary'), {
        credentials: 'include',
      });
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="admin-overview">
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">
            <span className="material-symbols-outlined">payments</span>
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Sales</div>
            <div className="stat-sublabel">{stats?.totalOrders || 0} Orders</div>
            <div className="stat-value">{formatCurrency(stats?.totalRevenue || 0)}</div>
            <div className="stat-change positive">
              <span className="material-symbols-outlined">trending_up</span>
              +15.6% <span className="change-detail">+1.4k this week</span>
            </div>
          </div>
          <div className="stat-arrow">
            <span className="material-symbols-outlined">arrow_forward_ios</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon light">
            <span className="material-symbols-outlined">groups</span>
          </div>
          <div className="stat-content">
            <div className="stat-label">Visitors</div>
            <div className="stat-sublabel">Avg. time: 4:30m</div>
            <div className="stat-value">12,302</div>
            <div className="stat-change positive">
              <span className="material-symbols-outlined">trending_up</span>
              +12.7% <span className="change-detail">+1.2k this week</span>
            </div>
          </div>
          <div className="stat-arrow">
            <span className="material-symbols-outlined">arrow_forward_ios</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon light">
            <span className="material-symbols-outlined">verified</span>
          </div>
          <div className="stat-content">
            <div className="stat-label">Refunds</div>
            <div className="stat-sublabel">2 Disputed</div>
            <div className="stat-value">963</div>
            <div className="stat-change negative">
              <span className="material-symbols-outlined">trending_down</span>
              -12.7% <span className="change-detail">-213</span>
            </div>
          </div>
          <div className="stat-arrow">
            <span className="material-symbols-outlined">arrow_forward_ios</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        {/* Sales Performance Chart */}
        <div className="chart-card large">
          <div className="chart-header">
            <h3>Sales Performance</h3>
            <div className="chart-controls">
              <button className="chart-control-btn">Export data</button>
              <button className="chart-control-btn">Last 14 Days</button>
            </div>
          </div>
          <div className="chart-legend">
            <div className="legend-item">
              <span className="legend-dot earnings"></span>
              <span>Earnings</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot costs"></span>
              <span>Costs</span>
            </div>
          </div>
          <div className="chart-placeholder">
            <p>Chart visualization would go here</p>
            <p className="chart-note">(Sales performance over time)</p>
          </div>
        </div>

        {/* Top Categories */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Top Categories</h3>
          </div>
          <div className="donut-chart">
            <div className="donut-value">
              <span className="donut-amount">$6.2k</span>
            </div>
          </div>
          <div className="categories-list">
            <div className="category-item">
              <span className="category-dot electronics"></span>
              <span className="category-name">Electronics</span>
              <span className="category-arrow">
                <span className="material-symbols-outlined">arrow_forward_ios</span>
              </span>
            </div>
            <div className="category-item">
              <span className="category-dot laptops"></span>
              <span className="category-name">Laptops</span>
              <span className="category-arrow">
                <span className="material-symbols-outlined">arrow_forward_ios</span>
              </span>
            </div>
            <div className="category-item">
              <span className="category-dot phones"></span>
              <span className="category-name">Phones</span>
              <span className="category-arrow">
                <span className="material-symbols-outlined">arrow_forward_ios</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
