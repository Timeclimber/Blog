// 获取URL参数
function getUrlParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// 获取文章详情
async function getArticleDetail() {
    const id = getUrlParam('id');
    if (!id) {
        window.location.href = '/';
        return;
    }

    try {
        const response = await fetch(`/api/articles/detail/${id}`);
        const data = await response.json();
        renderArticleDetail(data);
        renderComments(data.comments);
    } catch (error) {
        console.error('获取文章详情失败:', error);
    }
}

// 渲染文章详情
function renderArticleDetail(data) {
    const article = data.article;
    const tags = data.tags;

    document.getElementById('article-title').textContent = article.title;
    document.getElementById('article-meta').textContent = new Date(article.created_at).toLocaleString();
    document.getElementById('article-content').textContent = article.content;

    const tagsContainer = document.getElementById('article-tags');
    tagsContainer.innerHTML = '';
    tags.forEach(tag => {
        const tagElement = document.createElement('span');
        tagElement.className = 'tag';
        tagElement.textContent = tag.name;
        tagsContainer.appendChild(tagElement);
    });
}

// 渲染评论列表
function renderComments(comments) {
    const commentList = document.getElementById('comment-list');
    commentList.innerHTML = '';

    comments.forEach(comment => {
        const commentItem = document.createElement('div');
        commentItem.className = 'comment-item';

        const content = document.createElement('p');
        content.textContent = comment.content;

        const meta = document.createElement('div');
        meta.className = 'comment-meta';
        let metaText = new Date(comment.created_at).toLocaleString();
        if (comment.user && comment.user.username) {
            metaText = `${metaText} - ${comment.user.username}`;
        }
        meta.textContent = metaText;

        commentItem.appendChild(content);
        commentItem.appendChild(meta);

        commentList.appendChild(commentItem);
    });
}

// 提交评论
async function submitComment() {
    const id = getUrlParam('id');
    const content = document.getElementById('comment-content').value;

    if (!content) return;

    // 检查登录状态
    const token = localStorage.getItem('token');
    if (!token) {
        alert('请先登录后再提交评论');
        window.location.href = '/login';
        return;
    }

    try {
        const response = await fetch('/api/comments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ article_id: parseInt(id), content })
        });

        const comment = await response.json();
        
        // 重新获取评论列表
        const commentsResponse = await fetch(`/api/articles/${id}/comments`);
        const comments = await commentsResponse.json();
        renderComments(comments);

        // 清空评论输入框
        document.getElementById('comment-content').value = '';
    } catch (error) {
        console.error('提交评论失败:', error);
    }
}

// 页面加载时获取文章详情
document.addEventListener('DOMContentLoaded', getArticleDetail);

// 评论提交事件
document.getElementById('submit-comment').addEventListener('click', submitComment);