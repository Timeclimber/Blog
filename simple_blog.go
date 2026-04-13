package main

import (
	"encoding/json"
	"fmt"
	"html/template"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"
)

// 数据模型
type Article struct {
	ID        int       `json:"id"`
	Title     string    `json:"title"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Comment struct {
	ID        int       `json:"id"`
	ArticleID int       `json:"article_id"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
}

type Tag struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

type ArticleTag struct {
	ArticleID int `json:"article_id"`
	TagID     int `json:"tag_id"`
}

type Message struct {
	ID        int       `json:"id"`
	Name      string    `json:"name"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
}

// 内存存储
var (
	articles      = []*Article{}
	comments      = []*Comment{}
	tags          = []*Tag{}
	articleTags   = []*ArticleTag{}
	messages      = []*Message{}
	nextArticleID = 1
	nextCommentID = 1
	nextTagID     = 1
	nextMessageID = 1
)

// 数据持久化
func loadData() {
	// 尝试从文件加载数据
	if data, err := os.ReadFile("./blog_data.json"); err == nil {
		type Data struct {
			Articles      []*Article    `json:"articles"`
			Comments      []*Comment    `json:"comments"`
			Tags          []*Tag        `json:"tags"`
			ArticleTags   []*ArticleTag `json:"article_tags"`
			Messages      []*Message    `json:"messages"`
			NextArticleID int           `json:"next_article_id"`
			NextCommentID int           `json:"next_comment_id"`
			NextTagID     int           `json:"next_tag_id"`
			NextMessageID int           `json:"next_message_id"`
		}
		var d Data
		if json.Unmarshal(data, &d) == nil {
			articles = d.Articles
			comments = d.Comments
			tags = d.Tags
			articleTags = d.ArticleTags
			messages = d.Messages
			nextArticleID = d.NextArticleID
			nextCommentID = d.NextCommentID
			nextTagID = d.NextTagID
			nextMessageID = d.NextMessageID
		}
	}
}

func saveData() {
	type Data struct {
		Articles      []*Article    `json:"articles"`
		Comments      []*Comment    `json:"comments"`
		Tags          []*Tag        `json:"tags"`
		ArticleTags   []*ArticleTag `json:"article_tags"`
		Messages      []*Message    `json:"messages"`
		NextArticleID int           `json:"next_article_id"`
		NextCommentID int           `json:"next_comment_id"`
		NextTagID     int           `json:"next_tag_id"`
		NextMessageID int           `json:"next_message_id"`
	}
	d := Data{
		Articles:      articles,
		Comments:      comments,
		Tags:          tags,
		ArticleTags:   articleTags,
		Messages:      messages,
		NextArticleID: nextArticleID,
		NextCommentID: nextCommentID,
		NextTagID:     nextTagID,
		NextMessageID: nextMessageID,
	}
	if data, err := json.MarshalIndent(d, "", "  "); err == nil {
		os.WriteFile("./blog_data.json", data, 0644)
	}
}

// 文章相关操作
func createArticle(title, content string) int {
	article := &Article{
		ID:        nextArticleID,
		Title:     title,
		Content:   content,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	articles = append(articles, article)
	nextArticleID++
	saveData()
	return article.ID
}

func getArticleByID(id int) *Article {
	for _, article := range articles {
		if article.ID == id {
			return article
		}
	}
	return nil
}

func getAllArticles() []*Article {
	return articles
}

// 评论相关操作
func createComment(articleID int, content string) int {
	comment := &Comment{
		ID:        nextCommentID,
		ArticleID: articleID,
		Content:   content,
		CreatedAt: time.Now(),
	}
	comments = append(comments, comment)
	nextCommentID++
	saveData()
	return comment.ID
}

func getCommentsByArticleID(articleID int) []*Comment {
	var result []*Comment
	for _, comment := range comments {
		if comment.ArticleID == articleID {
			result = append(result, comment)
		}
	}
	return result
}

// 标签相关操作
func createTag(name string) int {
	// 检查标签是否已存在
	for _, tag := range tags {
		if tag.Name == name {
			return tag.ID
		}
	}

	tag := &Tag{
		ID:   nextTagID,
		Name: name,
	}
	tags = append(tags, tag)
	nextTagID++
	saveData()
	return tag.ID
}

func addTagToArticle(articleID, tagID int) {
	// 检查是否已存在
	for _, at := range articleTags {
		if at.ArticleID == articleID && at.TagID == tagID {
			return
		}
	}

	articleTags = append(articleTags, &ArticleTag{
		ArticleID: articleID,
		TagID:     tagID,
	})
	saveData()
}

func getTagsByArticleID(articleID int) []*Tag {
	var result []*Tag
	for _, at := range articleTags {
		if at.ArticleID == articleID {
			for _, tag := range tags {
				if tag.ID == at.TagID {
					result = append(result, tag)
					break
				}
			}
		}
	}
	return result
}

// 留言相关操作
func createMessage(name, content string) int {
	message := &Message{
		ID:        nextMessageID,
		Name:      name,
		Content:   content,
		CreatedAt: time.Now(),
	}
	messages = append(messages, message)
	nextMessageID++
	saveData()
	return message.ID
}

func getAllMessages() []*Message {
	return messages
}

// 处理函数
func indexHandler(w http.ResponseWriter, r *http.Request) {
	tmpl := template.Must(template.New("index.html").Funcs(template.FuncMap{
		"truncate": func(s string, max int) string {
			if len(s) <= max {
				return s
			}
			return s[:max] + "..."
		},
	}).ParseFiles("./web/templates/index.html"))
	tmpl.Execute(w, getAllArticles())
}

func newArticleHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == "GET" {
		tmpl := template.Must(template.ParseFiles("./web/templates/new.html"))
		tmpl.Execute(w, nil)
	} else if r.Method == "POST" {
		r.ParseForm()
		title := r.FormValue("title")
		content := r.FormValue("content")
		tagsInput := r.FormValue("tags")

		articleID := createArticle(title, content)

		// 处理标签
		if tagsInput != "" {
			tagNames := strings.Split(tagsInput, ",")
			for _, tagName := range tagNames {
				tagName = strings.TrimSpace(tagName)
				if tagName != "" {
					tagID := createTag(tagName)
					addTagToArticle(articleID, tagID)
				}
			}
		}

		http.Redirect(w, r, "/", http.StatusFound)
	}
}

func articleHandler(w http.ResponseWriter, r *http.Request) {
	idStr := r.URL.Query().Get("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "无效的文章ID", http.StatusBadRequest)
		return
	}

	article := getArticleByID(id)
	if article == nil {
		http.Error(w, "文章不存在", http.StatusNotFound)
		return
	}

	if r.Method == "POST" {
		r.ParseForm()
		commentContent := r.FormValue("comment")
		if commentContent != "" {
			createComment(id, commentContent)
			http.Redirect(w, r, r.URL.String(), http.StatusFound)
			return
		}
	}

	data := struct {
		Article  *Article
		Comments []*Comment
		Tags     []*Tag
	}{
		Article:  article,
		Comments: getCommentsByArticleID(id),
		Tags:     getTagsByArticleID(id),
	}

	tmpl := template.Must(template.ParseFiles("./web/templates/article.html"))
	tmpl.Execute(w, data)
}

func messageHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == "POST" {
		r.ParseForm()
		name := r.FormValue("name")
		content := r.FormValue("content")
		if name != "" && content != "" {
			createMessage(name, content)
			http.Redirect(w, r, "/message", http.StatusFound)
			return
		}
	}

	tmpl := template.Must(template.ParseFiles("./web/templates/message.html"))
	tmpl.Execute(w, getAllMessages())
}

func main() {
	// 加载数据
	loadData()

	// 静态文件服务
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("./web/static"))))

	// 路由
	http.HandleFunc("/", indexHandler)
	http.HandleFunc("/new", newArticleHandler)
	http.HandleFunc("/article", articleHandler)
	http.HandleFunc("/message", messageHandler)

	// 启动服务器
	port := "8081"
	fmt.Printf("服务器启动在 http://localhost:%s\n", port)
	err := http.ListenAndServe(":"+port, nil)
	if err != nil {
		log.Fatalf("服务器启动失败: %v", err)
	}
}
