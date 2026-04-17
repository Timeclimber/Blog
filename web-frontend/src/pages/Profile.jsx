import { useState, useEffect } from 'react'

const DEFAULT_AVATAR = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'

function Profile({ currentUser, setCurrentUser }) {
  const [activeTab, setActiveTab] = useState('info')

  if (!currentUser) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h2>🔒 需要登录</h2>
          <p>请先登录后查看个人信息</p>
          <a href="/login" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            立即登录
          </a>
        </div>
      </div>
    )
  }

  const getGenderText = (gender) => {
    switch (gender) {
      case 'male': return '男'
      case 'female': return '女'
      default: return '其他'
    }
  }

  const getRoleText = (role) => {
    return role === 'admin' ? '管理员' : '普通用户'
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleString('zh-CN')
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* 标签导航 */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          borderBottom: '2px solid #e9ecef',
          marginBottom: '1.5rem',
          paddingBottom: '1rem'
        }}>
          <button 
            onClick={() => setActiveTab('info')}
            style={{
              padding: '0.5rem 1rem',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: activeTab === 'info' ? '600' : '500',
              color: activeTab === 'info' ? '#007bff' : '#6c757d',
              borderBottom: activeTab === 'info' ? '2px solid #007bff' : 'none',
              marginBottom: '-1rem',
              paddingBottom: '1rem'
            }}
          >
            个人信息
          </button>
          <button 
            onClick={() => setActiveTab('edit')}
            style={{
              padding: '0.5rem 1rem',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: activeTab === 'edit' ? '600' : '500',
              color: activeTab === 'edit' ? '#007bff' : '#6c757d',
              borderBottom: activeTab === 'edit' ? '2px solid #007bff' : 'none',
              marginBottom: '-1rem',
              paddingBottom: '1rem'
            }}
          >
            编辑资料
          </button>
          <button 
            onClick={() => setActiveTab('password')}
            style={{
              padding: '0.5rem 1rem',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: activeTab === 'password' ? '600' : '500',
              color: activeTab === 'password' ? '#007bff' : '#6c757d',
              borderBottom: activeTab === 'password' ? '2px solid #007bff' : 'none',
              marginBottom: '-1rem',
              paddingBottom: '1rem'
            }}
          >
            修改密码
          </button>
        </div>

        {/* 个人信息展示 */}
        {activeTab === 'info' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <img 
                src={currentUser.avatar_url || DEFAULT_AVATAR} 
                alt="头像" 
                style={{ 
                  width: '100px', 
                  height: '100px', 
                  borderRadius: '50%',
                  border: '3px solid #007bff'
                }}
              />
            </div>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <span style={{ fontWeight: '500', color: '#6c757d' }}>用户名</span>
                <span>{currentUser.username}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <span style={{ fontWeight: '500', color: '#6c757d' }}>邮箱</span>
                <span>{currentUser.email}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <span style={{ fontWeight: '500', color: '#6c757d' }}>性别</span>
                <span>{getGenderText(currentUser.gender)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <span style={{ fontWeight: '500', color: '#6c757d' }}>角色</span>
                <span>{getRoleText(currentUser.role)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <span style={{ fontWeight: '500', color: '#6c757d' }}>注册时间</span>
                <span>{formatDate(currentUser.created_at)}</span>
              </div>
            </div>
          </div>
        )}

        {/* 编辑资料 */}
        {activeTab === 'edit' && (
          <div>
            <h3 style={{ marginBottom: '1rem' }}>编辑资料</h3>
            <p>此页面正在开发中...</p>
          </div>
        )}

        {/* 修改密码 */}
        {activeTab === 'password' && (
          <div>
            <h3 style={{ marginBottom: '1rem' }}>修改密码</h3>
            <p>此页面正在开发中...</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile
