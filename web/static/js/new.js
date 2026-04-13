// 发布文章
async function publishArticle() {
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    const tagsInput = document.getElementById('tags').value;

    try {
        // 创建文章
        const articleResponse = await fetch('/api/articles', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, content })
        });

        const article = await articleResponse.json();

        // 处理标签
        if (tagsInput) {
            const tags = tagsInput.split(',').map(tag => tag.trim());
            for (const tagName of tags) {
                if (tagName) {
                    // 创建标签
                    const tagResponse = await fetch('/api/tags', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ name: tagName })
                    });

                    const tag = await tagResponse.json();

                    // 为文章添加标签
                    await fetch(`/api/articles/${article.id}/tags/${tag.id}`, {
                        method: 'POST'
                    });
                }
            }
        }

        // 跳转到首页
        window.location.href = '/';
    } catch (error) {
        console.error('发布文章失败:', error);
    }
}

// 表单提交事件
document.getElementById('article-form').addEventListener('submit', function(e) {
    e.preventDefault();
    publishArticle();
});