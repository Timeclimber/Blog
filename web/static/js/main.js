// 获取文章列表
async function getArticles() {
    try {
        const response = await fetch('/api/articles');
        const articles = await response.json();
        renderArticles(articles);
    } catch (error) {
        console.error('获取文章列表失败:', error);
    }
}

// 渲染文章列表
function renderArticles(articles) {
    const articleList = document.getElementById('article-list');
    articleList.innerHTML = '';

    articles.forEach(article => {
        const articleItem = document.createElement('div');
        articleItem.className = 'article-item';

        const title = document.createElement('h3');
        const link = document.createElement('a');
        link.href = `/article.html?id=${article.id}`;
        link.textContent = article.title;
        title.appendChild(link);

        const content = document.createElement('p');
        content.textContent = article.content.substring(0, 100) + '...';

        const meta = document.createElement('div');
        meta.className = 'article-meta';
        meta.textContent = new Date(article.created_at).toLocaleString();

        articleItem.appendChild(title);
        articleItem.appendChild(content);
        articleItem.appendChild(meta);

        articleList.appendChild(articleItem);
    });
}

// 检查用户登录状态
function checkLoginStatus() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    const loginLink = document.getElementById('login-link');
    const registerLink = document.getElementById('register-link');
    const userInfo = document.getElementById('user-info');
    
    if (token && user) {
        // 用户已登录
        const userData = JSON.parse(user);
        userInfo.textContent = `欢迎, ${userData.username} (${userData.role})`;
        userInfo.style.display = 'inline';
        loginLink.style.display = 'none';
        registerLink.style.display = 'none';
        
        // 添加登出按钮
        if (!document.getElementById('logout-button')) {
            const logoutButton = document.createElement('a');
            logoutButton.id = 'logout-button';
            logoutButton.href = '#';
            logoutButton.textContent = '登出';
            logoutButton.addEventListener('click', function(e) {
                e.preventDefault();
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/';
            });
            loginLink.parentElement.appendChild(logoutButton);
        }
    } else {
        // 用户未登录
        userInfo.style.display = 'none';
        loginLink.style.display = 'inline';
        registerLink.style.display = 'inline';
        
        // 移除登出按钮
        const logoutButton = document.getElementById('logout-button');
        if (logoutButton) {
            logoutButton.remove();
        }
    }
}

// 页面加载时获取文章列表和检查登录状态
document.addEventListener('DOMContentLoaded', function() {
    getArticles();
    checkLoginStatus();
});