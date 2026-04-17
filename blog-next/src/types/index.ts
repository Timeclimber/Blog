export interface User {
  id: number
  username: string
  email: string
}

export interface Article {
  id: number
  title: string
  content: string
  authorId: number
  authorName: string
  createdAt: string
  updatedAt: string
}

export interface Comment {
  id: number
  content: string
  userId: number
  username: string
  articleId: number
  createdAt: string
}

export interface Tag {
  id: number
  name: string
}

export interface Message {
  id: number
  content: string
  userId: number
  username: string
  createdAt: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
}

export interface CreateArticleRequest {
  title: string
  content: string
}

export interface UpdateArticleRequest {
  title: string
  content: string
}

export interface CreateCommentRequest {
  content: string
  articleId: number
}

export interface CreateMessageRequest {
  content: string
}

export interface UpdateUserRequest {
  username?: string
  email?: string
}

export interface UpdatePasswordRequest {
  oldPassword: string
  newPassword: string
}
