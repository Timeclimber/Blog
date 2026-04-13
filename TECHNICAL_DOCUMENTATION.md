# 本地个人博客技术文档

## 1. 项目概述

这是一个使用Go语言开发的本地个人博客系统，具有以下功能：
- 文章管理：创建、查看文章
- 评论系统：为文章添加评论
- 标签系统：为文章添加标签
- 数据持久化：使用JSON文件存储数据

## 2. 技术栈

- **后端**：Go标准库
- **前端**：HTML、CSS、JavaScript
- **数据存储**：JSON文件
- **Web服务器**：Go标准库的http包

## 3. 项目结构

```
本地个人博客/
├── web/                  # 前端资源
│   ├── templates/        # HTML模板
│   │   ├── index.html    # 首页模板
│   │   ├── new.html      # 写文章页面模板
│   │   └── article.html  # 文章详情页面模板
│   └── static/           # 静态文件
│       └── css/          # CSS样式
│           └── style.css # 主样式文件
├── simple_blog.go        # 主程序文件
├── blog_data.json        # 数据存储文件
├── README.md             # 项目说明文档
├── CHANGELOG.md          # 版本更新记录
└── TECHNICAL_DOCUMENTATION.md # 技术文档
```

## 4. 代码组织

### 4.1 主程序文件 (simple_blog.go)

主程序文件包含以下部分：

1. **数据模型**：定义了Article、Comment、Tag和ArticleTag结构体
2. **内存存储**：使用切片存储数据
3. **数据持久化**：实现了loadData()和saveData()函数，用于从JSON文件加载数据和保存数据
4. **业务逻辑**：实现了文章、评论、标签的CRUD操作
5. **处理函数**：实现了HTTP请求处理函数
6. **路由**：设置了HTTP路由
7. **主函数**：初始化数据、设置路由、启动服务器

### 4.2 前端模板

- **index.html**：首页模板，显示文章列表
- **new.html**：写文章页面模板，包含文章表单
- **article.html**：文章详情页面模板，显示文章内容、标签和评论

### 4.3 静态文件

- **style.css**：主样式文件，定义了页面的样式

## 5. 功能实现

### 5.1 文章管理

- **创建文章**：通过/new路径的POST请求创建文章
- **查看文章**：通过/article?id=X路径查看文章详情
- **查看文章列表**：通过/路径查看所有文章

### 5.2 评论系统

- **添加评论**：在文章详情页面通过POST请求添加评论
- **查看评论**：在文章详情页面显示文章的所有评论

### 5.3 标签系统

- **创建标签**：在创建文章时自动创建标签
- **为文章添加标签**：在创建文章时为文章添加标签
- **查看文章标签**：在文章详情页面显示文章的所有标签

### 5.4 数据持久化

- **数据加载**：程序启动时从blog_data.json文件加载数据
- **数据保存**：每次添加或修改数据时，自动保存到blog_data.json文件

## 6. 数据模型

### 6.1 Article（文章）

```go
type Article struct {
	ID        int       `json:"id"`
	Title     string    `json:"title"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
```

### 6.2 Comment（评论）

```go
type Comment struct {
	ID        int       `json:"id"`
	ArticleID int       `json:"article_id"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
}
```

### 6.3 Tag（标签）

```go
type Tag struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}
```

### 6.4 ArticleTag（文章标签关联）

```go
type ArticleTag struct {
	ArticleID int `json:"article_id"`
	TagID     int `json:"tag_id"`
}
```

## 7. 部署和运行方式

### 7.1 运行环境

- Go 1.24.2或更高版本
- 任何支持HTTP的浏览器

### 7.2 运行步骤

1. 进入项目目录
2. 运行以下命令启动服务器：

```bash
go run simple_blog.go
```

3. 打开浏览器访问：http://localhost:8081

### 7.3 数据存储

- 数据存储在项目根目录的blog_data.json文件中
- 每次启动服务器时会加载该文件中的数据
- 每次添加或修改数据时会自动保存到该文件

## 8. 版本管理

- 使用语义化版本号（MAJOR.MINOR.PATCH）
- 小改动（如bug修复）更新PATCH版本号
- 新功能更新MINOR版本号
- 重大变更更新MAJOR版本号
- 版本更新记录保存在CHANGELOG.md文件中

## 9. 未来扩展计划

1. **用户系统**：添加用户注册、登录功能
2. **文章编辑**：添加编辑已有文章的功能
3. **文章删除**：添加删除文章的功能
4. **评论管理**：添加删除评论的功能
5. **标签管理**：添加管理标签的功能
6. **搜索功能**：添加文章搜索功能
7. **分页功能**：添加文章列表分页功能
8. **主题支持**：添加不同的主题风格
9. **Markdown支持**：支持Markdown格式的文章内容
10. **图片上传**：支持在文章中插入图片

## 10. 代码风格和规范

- 使用Go语言的标准代码风格
- 变量和函数命名使用驼峰命名法
- 代码注释清晰明了
- 错误处理及时、合理
- 代码结构清晰，逻辑分明

## 11. 故障排除

### 11.1 服务器启动失败

- 检查端口8081是否被占用
- 检查Go环境是否正确安装
- 检查代码是否有编译错误

### 11.2 数据保存失败

- 检查blog_data.json文件是否有写入权限
- 检查磁盘空间是否充足

### 11.3 页面显示异常

- 检查浏览器是否支持HTML5
- 清除浏览器缓存
- 检查网络连接是否正常

## 12. 维护和支持

- 定期备份blog_data.json文件
- 及时更新Go版本
- 监控服务器运行状态
- 处理用户反馈的问题
