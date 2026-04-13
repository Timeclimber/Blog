package main

import (
	"database/sql"
	"fmt"
	"html/template"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	_ "github.com/mattn/go-sqlite3"
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

var db *sql.DB

// 初始化数据库
func initDB() error {
	var err error
	db, err = sql.Open("sqlite3", "./blog.db")
	if err != nil {
		return err
	}

	err = db.Ping()
	if err != nil {
		return err
	}

	err = createTables()
	if err != nil {
		return err
	}

	log.Println("数据库初始化成功")
	return nil
}

// 创建数据库表
func createTables() error {
	// 创建文章表
	_, err := db.Exec(`
	CREATE TABLE IF NOT EXISTS articles (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		title TEXT NOT NULL,
		content TEXT NOT NULL,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	)
	`)
	if err != nil {
		return err
	}

	// 创建评论表
	_, err = db.Exec(`
	CREATE TABLE IF NOT EXISTS comments (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		article_id INTEGER NOT NULL,
		content TEXT NOT NULL,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
	)
	`)
	if err != nil {
		return err
	}

	// 创建标签表
	_, err = db.Exec(`
	CREATE TABLE IF NOT EXISTS tags (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL UNIQUE
	)
	`)
	if err != nil {
		return err
	}

	// 创建文章标签关联表
	_, err = db.Exec(`
	CREATE TABLE IF NOT EXISTS article_tags (
		article_id INTEGER NOT NULL,
		tag_id INTEGER NOT NULL,
		PRIMARY KEY (article_id, tag_id),
		FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
		FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
	)
	`)
	if err != nil {
		return err
	}

	return nil
}

// 文章相关操作
func createArticle(title, content string) (int, error) {
	query := `INSERT INTO articles (title, content, created_at, updated_at) VALUES (?, ?, ?, ?)`
	result, err := db.Exec(query, title, content, time.Now(), time.Now())
	if err != nil {
		return 0, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}

	return int(id), nil
}

func getArticleByID(id int) (*Article, error) {
	query := `SELECT id, title, content, created_at, updated_at FROM articles WHERE id = ?`
	row := db.QueryRow(query, id)

	article := &Article{}
	err := row.Scan(&article.ID, &article.Title, &article.Content, &article.CreatedAt, &article.UpdatedAt)
	if err != nil {
		return nil, err
	}

	return article, nil
}

func getAllArticles() ([]*Article, error) {
	query := `SELECT id, title, content, created_at, updated_at FROM articles ORDER BY created_at DESC`
	rows, err := db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	articles := []*Article{}
	for rows.Next() {
		article := &Article{}
		err := rows.Scan(&article.ID, &article.Title, &article.Content, &article.CreatedAt, &article.UpdatedAt)
		if err != nil {
			return nil, err
		}
		articles = append(articles, article)
	}

	return articles, nil
}

// 评论相关操作
func createComment(articleID int, content string) (int, error) {
	query := `INSERT INTO comments (article_id, content, created_at) VALUES (?, ?, ?)`
	result, err := db.Exec(query, articleID, content, time.Now())
	if err != nil {
		return 0, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}

	return int(id), nil
}

func getCommentsByArticleID(articleID int) ([]*Comment, error) {
	query := `SELECT id, article_id, content, created_at FROM comments WHERE article_id = ? ORDER BY created_at DESC`
	rows, err := db.Query(query, articleID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	comments := []*Comment{}
	for rows.Next() {
		comment := &Comment{}
		err := rows.Scan(&comment.ID, &comment.ArticleID, &comment.Content, &comment.CreatedAt)
		if err != nil {
			return nil, err
		}
		comments = append(comments, comment)
	}

	return comments, nil
}

// 标签相关操作
func createTag(name string) (int, error) {
	query := `INSERT OR IGNORE INTO tags (name) VALUES (?)`
	result, err := db.Exec(query, name)
	if err != nil {
		return 0, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		// 如果标签已存在，获取其ID
		row := db.QueryRow(`SELECT id FROM tags WHERE name = ?`, name)
		err = row.Scan(&id)
		return int(id), err
	}

	return int(id), nil
}

func addTagToArticle(articleID, tagID int) error {
	query := `INSERT OR IGNORE INTO article_tags (article_id, tag_id) VALUES (?, ?)`
	_, err := db.Exec(query, articleID, tagID)
	return err
}

func getTagsByArticleID(articleID int) ([]*Tag, error) {
	query := `
	SELECT t.id, t.name FROM tags t
	JOIN article_tags at ON t.id = at.tag_id
	WHERE at.article_id = ?
	`
	rows, err := db.Query(query, articleID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	tags := []*Tag{}
	for rows.Next() {
		tag := &Tag{}
		err := rows.Scan(&tag.ID, &tag.Name)
		if err != nil {
			return nil, err
		}
		tags = append(tags, tag)
	}

	return tags, nil
}

// 处理函数
func indexHandler(w http.ResponseWriter, r *http.Request) {
	articles, err := getAllArticles()
	if err != nil {
		http.Error(w, "获取文章列表失败", http.StatusInternalServerError)
		return
	}

	tmpl := template.Must(template.New("index.html").Funcs(template.FuncMap{
		"truncate": func(s string, max int) string {
			if len(s) <= max {
				return s
			}
			return s[:max] + "..."
		},
	}).ParseFiles("./web/templates/index.html"))
	tmpl.Execute(w, articles)
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

		articleID, err := createArticle(title, content)
		if err != nil {
			http.Error(w, "创建文章失败", http.StatusInternalServerError)
			return
		}

		// 处理标签
		if tagsInput != "" {
			tags := strings.Split(tagsInput, ",")
			for _, tagName := range tags {
				tagName = strings.TrimSpace(tagName)
				if tagName != "" {
					tagID, err := createTag(tagName)
					if err != nil {
						log.Printf("创建标签失败: %v", err)
						continue
					}
					err = addTagToArticle(articleID, tagID)
					if err != nil {
						log.Printf("为文章添加标签失败: %v", err)
					}
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

	article, err := getArticleByID(id)
	if err != nil {
		http.Error(w, "文章不存在", http.StatusNotFound)
		return
	}

	comments, err := getCommentsByArticleID(id)
	if err != nil {
		log.Printf("获取评论失败: %v", err)
		comments = []*Comment{}
	}

	tags, err := getTagsByArticleID(id)
	if err != nil {
		log.Printf("获取标签失败: %v", err)
		tags = []*Tag{}
	}

	if r.Method == "POST" {
		r.ParseForm()
		commentContent := r.FormValue("comment")
		if commentContent != "" {
			_, err := createComment(id, commentContent)
			if err != nil {
				log.Printf("创建评论失败: %v", err)
			}
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
		Comments: comments,
		Tags:     tags,
	}

	tmpl := template.Must(template.ParseFiles("./web/templates/article.html"))
	tmpl.Execute(w, data)
}

func main() {
	// 初始化数据库
	err := initDB()
	if err != nil {
		log.Fatalf("数据库初始化失败: %v", err)
	}
	defer db.Close()

	// 静态文件服务
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("./web/static"))))

	// 路由
	http.HandleFunc("/", indexHandler)
	http.HandleFunc("/new", newArticleHandler)
	http.HandleFunc("/article", articleHandler)

	// 启动服务器
	port := "8081"
	log.Printf("服务器启动在 http://localhost:%s", port)
	err = http.ListenAndServe(":"+port, nil)
	if err != nil {
		log.Fatalf("服务器启动失败: %v", err)
	}
}