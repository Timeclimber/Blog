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

// 页面加载时获取文章列表
document.addEventListener('DOMContentLoaded', getArticles);