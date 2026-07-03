# Chapter 11: Web Development

---

Python has become one of the most dominant languages for web development, powering everything from lightweight microservices to massive platforms like Instagram, Spotify, and Pinterest. Its clean syntax, rich ecosystem of frameworks, and excellent database integration make it an ideal choice for building web applications of any scale.

In this chapter, we'll journey from the fundamentals of how the web works all the way through building production-ready APIs, authenticating users, deploying applications, and even scraping data from websites. By the end, you'll have the knowledge to build, secure, and deploy a full-stack web application in Python.

---

## 11.1 How the Web Works

Before writing a single line of code, it's essential to understand the request-response cycle that underpins every interaction on the web.

### The Client-Server Model

Every web transaction follows a simple pattern: a **client** (usually a browser) sends a **request** to a **server**, which processes it and returns a **response**.

```
┌──────────┐         HTTP Request          ┌──────────┐
│          │  ──────────────────────────▶   │          │
│  CLIENT  │   GET /api/users HTTP/1.1      │  SERVER  │
│ (Browser)│   Host: example.com            │  (Python)│
│          │                                │          │
│          │  ◀──────────────────────────   │          │
│          │   HTTP/1.1 200 OK              │          │
│          │   Content-Type: application/json│          │
└──────────┘   {"users": [...]}             └──────────┘
```

The client sends an HTTP (Hypertext Transfer Protocol) message over TCP/IP. The server listens on a port (typically 80 for HTTP, 443 for HTTPS), parses the request, executes application logic, and sends back a response with a status code, headers, and an optional body.

### HTTP Methods

HTTP defines several methods (also called verbs) that indicate the intended action:

| Method   | Purpose                  | Idempotent | Safe  | Request Body |
|----------|--------------------------|------------|-------|--------------|
| `GET`    | Retrieve a resource      | Yes        | Yes   | No           |
| `POST`   | Create a new resource    | No         | No    | Yes          |
| `PUT`    | Replace a resource       | Yes        | No    | Yes          |
| `PATCH`  | Partially update a resource | Yes     | No    | Yes          |
| `DELETE` | Remove a resource        | Yes        | No    | Optional     |

**Idempotent** means making the same request multiple times produces the same result. **Safe** means the method doesn't modify server state.

### Status Codes

Every HTTP response includes a three-digit status code indicating the outcome:

| Code | Meaning              | When It Occurs                                      |
|------|----------------------|-----------------------------------------------------|
| `200`| OK                   | Successful request                                   |
| `201`| Created              | A new resource was successfully created               |
| `301`| Moved Permanently    | The resource has a new permanent URL                  |
| `400`| Bad Request          | The client sent malformed or invalid data             |
| `401`| Unauthorized         | Authentication is required but missing/invalid        |
| `403`| Forbidden            | Authenticated but not permitted to access the resource|
| `404`| Not Found            | The requested resource doesn't exist                  |
| `500`| Internal Server Error| Something went wrong on the server side               |

### Headers, Cookies, and Sessions

**Headers** are key-value pairs in both requests and responses that carry metadata:

```http
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Cache-Control: no-cache
Accept-Language: en-US
```

**Cookies** are small pieces of data the server asks the browser to store and send back with every subsequent request. They're used for session management, preferences, and tracking.

**Sessions** extend cookies by storing server-side state. The cookie holds only a session ID (e.g., `session_id=abc123`), while the actual data lives on the server in memory, a database, or a cache like Redis.

### REST API Principles

REST (Representational State Transfer) is an architectural style for designing networked applications:

1. **Stateless**: Each request contains all information needed to process it. The server stores no client context between requests.
2. **Resource-based**: Everything is a resource identified by a URI (e.g., `/api/users/42`).
3. **Standard methods**: Use HTTP verbs semantically (`GET` to read, `POST` to create, `PUT` to update, `DELETE` to remove).
4. **Representation**: Resources are transferred as JSON, XML, or other formats—not as raw database objects.
5. **HATEOAS** (optional): Responses include links to related resources.

A well-designed REST API looks like this:

```
GET    /api/v1/users          → List all users
POST   /api/v1/users          → Create a user
GET    /api/v1/users/42       → Get user 42
PUT    /api/v1/users/42       → Replace user 42
PATCH  /api/v1/users/42       → Update fields on user 42
DELETE /api/v1/users/42       → Delete user 42
GET    /api/v1/users/42/posts → List posts by user 42
```

---

## 11.2 Flask Basics

Flask is a lightweight, extensible micro-framework for Python web development. Unlike Django, it doesn't impose a project structure or include built-in ORMs, admin panels, or form libraries—you choose your own tools.

### Installation and Hello World

```bash
uv add flask
```

Create a minimal Flask application:

```python
from flask import Flask

app = Flask(__name__)

@app.route("/")
def hello():
    return "<h1>Hello, World!</h1>"

if __name__ == "__main__":
    app.run(debug=True)
```

Run it:

```bash
uv run python app.py
```

Flask starts a development server on `http://127.0.0.1:5000`. The `debug=True` flag enables auto-reloading when you change code and shows detailed error pages.

### Route Decorators and URL Rules

The `@app.route()` decorator maps a URL to a function:

```python
@app.route("/")
def index():
    return "Home page"

@app.route("/about")
def about():
    return "About page"
```

You can specify multiple URL rules for the same view:

```python
@app.route("/home")
@app.route("/")
def index():
    return "Home page"
```

### HTTP Methods on Routes

By default, routes respond only to `GET`. Use the `methods` parameter to accept others:

```python
@app.route("/submit", methods=["GET", "POST"])
def submit():
    if request.method == "POST":
        return "Form submitted!"
    return "Show the form"
```

### URL Parameters and Query Strings

**URL parameters** capture dynamic segments of the path:

```python
@app.route("/users/<int:user_id>")
def get_user(user_id):
    return f"User {user_id} (type: {type(user_id).__name__})"
```

Flask automatically converts `<int:user_id>` to an integer, and the view receives a Python `int`, not a string. Other converters include `string` (default), `float`, `uuid`, and `path`.

**Query strings** are accessed via `request.args`:

```python
from flask import request

@app.route("/search")
def search():
    query = request.args.get("q", "")        # ?q=python
    page = request.args.get("page", 1, type=int)  # ?page=2
    return f"Searching '{query}' on page {page}"
```

### Request and Response Objects

Flask's `request` object provides access to all incoming data:

```python
from flask import request, jsonify, make_response

@app.route("/api/data", methods=["POST"])
def receive_data():
    # JSON body
    data = request.get_json()

    # Form data
    name = request.form.get("name")

    # File uploads
    file = request.files.get("upload")

    # Request metadata
    content_type = request.content_type
    user_agent = request.user_agent.string

    # Return JSON with custom status code and headers
    response = jsonify({"received": data})
    response.status_code = 201
    response.headers["X-Custom"] = "value"
    return response
```

For more control, use `make_response`:

```python
@app.route("/custom")
def custom_response():
    response = make_response("Custom response body", 200)
    response.headers["Content-Type"] = "text/plain"
    response.set_cookie("theme", "dark")
    return response
```

### Templates with Jinja2

Flask integrates Jinja2 by default for HTML templating. Templates live in a `templates/` folder:

```python
from flask import render_template

@app.route("/hello/<name>")
def hello(name):
    return render_template("hello.html", name=name, items=["Python", "Flask", "Jinja2"])
```

A template file (`templates/hello.html`):

```html
<!DOCTYPE html>
<html>
<head><title>Hello, {{ name }}!</title></head>
<body>
    <h1>Welcome, {{ name }}!</h1>
    <ul>
        {% for item in items %}
            <li>{{ item }}</li>
        {% endfor %}
    </ul>
</body>
</html>
```

### Serving Static Files

Place static assets (CSS, JavaScript, images) in a `static/` folder. Reference them in templates:

```html
<link rel="stylesheet" href="{{ url_for('static', filename='style.css') }}">
<img src="{{ url_for('static', filename='logo.png') }}" alt="Logo">
```

---

## 11.3 Flask Forms and Templates

### HTML Forms and POST Handling

A typical form workflow involves displaying a form via `GET`, then processing the submission via `POST`:

```python
from flask import Flask, render_template, request, redirect, url_for, flash

app = Flask(__name__)
app.secret_key = "dev-secret-key-change-in-production"

@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        username = request.form["username"]
        email = request.form["email"]
        password = request.form["password"]

        # Validate
        if len(username) < 3:
            flash("Username must be at least 3 characters.", "error")
            return redirect(url_for("register"))

        # Save to database...
        flash("Registration successful!", "success")
        return redirect(url_for("welcome", name=username))

    return render_template("register.html")
```

The corresponding template (`templates/register.html`):

```html
<!DOCTYPE html>
<html>
<head><title>Register</title></head>
<body>
    <h1>Register</h1>

    {% with messages = get_flashed_messages(with_categories=true) %}
        {% if messages %}
            {% for category, message in messages %}
                <div class="alert alert-{{ category }}">{{ message }}</div>
            {% endfor %}
        {% endif %}
    {% endwith %}

    <form method="POST" action="{{ url_for('register') }}">
        <label>Username: <input type="text" name="username" required></label><br>
        <label>Email: <input type="email" name="email" required></label><br>
        <label>Password: <input type="password" name="password" required></label><br>
        <button type="submit">Register</button>
    </form>
</body>
</html>
```

### Jinja2 Template Inheritance

Avoid repeating boilerplate HTML with template inheritance. Create a base template (`templates/base.html`):

```html
<!DOCTYPE html>
<html>
<head>
    <title>{% block title %}My App{% endblock %}</title>
    <link rel="stylesheet" href="{{ url_for('static', filename='style.css') }}">
</head>
<body>
    <nav>
        <a href="{{ url_for('index') }}">Home</a>
        <a href="{{ url_for('register') }}">Register</a>
    </nav>

    <main>
        {% block content %}{% endblock %}
    </main>

    <footer>
        <p>&copy; 2026 My App</p>
    </footer>
</body>
</html>
```

Child templates extend it:

```html
{% extends "base.html" %}

{% block title %}Register - My App{% endblock %}

{% block content %}
    <h1>Create an Account</h1>
    <form method="POST">
        <!-- form fields -->
    </form>
{% endblock %}
```

### Template Filters

Jinja2 provides filters for transforming data in templates:

```html
{{ name | upper }}                          <!-- "ALICE" -->
{{ name | lower }}                          <!-- "alice" -->
{{ price | currency }}                      <!-- "$42.00" -->
{{ created | dateformat('%Y-%m-%d') }}      <!-- "2026-07-02" -->
{{ bio | truncate(100) }}                   <!-- First 100 chars -->
{{ items | length }}                        <!-- Number of items -->
{{ items | join(', ') }}                    <!-- "a, b, c" -->
{{ html_content | safe }}                   <!-- Render raw HTML -->
{{ "<em>bold</em>" | e }}                   <!-- Escape HTML entities -->
```

### Flash Messages

Flash messages provide one-time feedback to users:

```python
from flask import flash

@app.route("/delete/<int:post_id>", methods=["POST"])
def delete_post(post_id):
    # Delete post...
    flash(f"Post {post_id} deleted successfully.", "success")
    return redirect(url_for("posts"))
```

Display them in any template:

```html
{% with messages = get_flashed_messages(with_categories=true) %}
    {% for category, message in messages %}
        <div class="flash {{ category }}">{{ message }}</div>
    {% endfor %}
{% endwith %}
```

### Redirect and URL Building

```python
from flask import redirect, url_for

# Redirect to a view function
return redirect(url_for("index"))

# Redirect with a query parameter
return redirect(url_for("search", q="flask", page=2))

# Redirect to an external URL
return redirect("https://example.com")
```

`url_for()` generates URLs from view function names, making your code resilient to URL changes:

```python
url_for("index")                        # "/"
url_for("get_user", user_id=42)         # "/users/42"
url_for("search", q="flask")            # "/search?q=flask"
```

---

## 11.4 FastAPI Basics

FastAPI is a modern, high-performance framework built on top of Starlette and Pydantic. It offers automatic request validation, serialization, and interactive API documentation out of the box.

### Installation and Hello World

```bash
uv add fastapi uvicorn
```

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}
```

Run the server:

```bash
uv run uvicorn app:app --reload
```

Visit `http://127.0.0.1:8000` to see the response. The `--reload` flag watches for code changes.

### Path Parameters and Query Parameters

FastAPI uses type hints to define parameters:

```python
@app.get("/users/{user_id}")
def get_user(user_id: int):
    return {"user_id": user_id, "name": "Alice"}

@app.get("/search")
def search(q: str = "", page: int = 1, limit: int = 10):
    return {"query": q, "page": page, "limit": limit}
```

FastAPI automatically validates types and returns clear error messages for invalid input.

### Pydantic Models for Request and Response

Pydantic models define the shape of your data with automatic validation:

```python
from pydantic import BaseModel, EmailStr, Field

class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(min_length=8)

class UserResponse(BaseModel):
    id: int
    username: str
    email: str

    model_config = {"from_attributes": True}

@app.post("/users", response_model=UserResponse, status_code=201)
def create_user(user: UserCreate):
    # user is already validated!
    user_data = user.model_dump()
    user_data["id"] = 1
    return user_data
```

### Automatic Documentation

FastAPI generates interactive docs automatically:

- **Swagger UI**: Visit `/docs` for an interactive API explorer
- **ReDoc**: Visit `/redoc` for beautiful, readable documentation

You can add descriptions to endpoints:

```python
@app.get(
    "/users/{user_id}",
    response_model=UserResponse,
    summary="Get a user by ID",
    description="Returns the full profile of the specified user.",
    responses={
        404: {"description": "User not found"},
    },
)
def get_user(user_id: int):
    ...
```

### Dependency Injection

FastAPI's dependency injection system lets you reuse logic across endpoints:

```python
from fastapi import Depends, HTTPException

def get_db():
    db = DatabaseSession()
    try:
        yield db
    finally:
        db.close()

def get_current_user(token: str = Depends(oauth2_scheme), db = Depends(get_db)):
    user = db.query(User).filter(User.token == token).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user

@app.get("/profile")
def read_profile(user = Depends(get_current_user)):
    return {"username": user.username}
```

Dependencies are resolved automatically and can be nested.

### Async Support

FastAPI supports both sync and async views:

```python
import httpx

@app.get("/external")
async def fetch_external():
    async with httpx.AsyncClient() as client:
        response = await client.get("https://api.example.com/data")
    return response.json()

@app.get("/slow")
async def slow_endpoint():
    # Async doesn't block the event loop
    result = await some_async_io_operation()
    return {"result": result}
```

### Flask vs FastAPI Comparison

| Feature              | Flask                        | FastAPI                       |
|----------------------|------------------------------|-------------------------------|
| **Performance**      | Good (WSGI)                  | Excellent (ASGI, async)       |
| **Data validation**  | Manual or with extensions     | Built-in (Pydantic)           |
| **API docs**         | Manual (Swagger via plugin)   | Automatic (Swagger + ReDoc)   |
| **Async support**    | Limited (Flask 2.0+)         | Native                        |
| **Learning curve**   | Low                          | Low-Medium                    |
| **Ecosystem**        | Mature, huge                 | Growing rapidly               |
| **Best for**         | Traditional web apps, Jinja  | APIs, microservices, async    |
| **Type safety**      | Optional                     | Strong (type hints enforced)  |
| **Dependency injection** | Manual                    | Built-in                      |

---

## 11.5 Django Basics (Overview)

Django is a high-level, "batteries-included" web framework that provides everything you need to build production web applications out of the box: ORM, admin panel, authentication, forms, and more.

### Django's Batteries-Included Philosophy

Django follows the principle that common web development tasks should be simple, not reinvented. It includes:

- **ORM** for database access without raw SQL
- **Admin interface** auto-generated from your models
- **Authentication system** with login, registration, password reset
- **Form handling and validation**
- **URL routing, templates, and static file management**
- **Security protections** against CSRF, XSS, SQL injection, and clickjacking
- **Internationalization** support

### Project vs App Structure

A Django **project** is the overall website. A **project** contains one or more **apps**, each handling a specific feature:

```
myproject/                  # Project root
├── manage.py               # Command-line utility
├── myproject/              # Project configuration
│   ├── __init__.py
│   ├── settings.py         # Global settings
│   ├── urls.py             # Root URL configuration
│   └── wsgi.py             # WSGI entry point
├── blog/                   # An app
│   ├── __init__.py
│   ├── models.py           # Database models
│   ├── views.py            # Request handlers
│   ├── urls.py             # App-specific routes
│   ├── admin.py            # Admin registration
│   └── templates/          # HTML templates
└── users/                  # Another app
    ├── models.py
    ├── views.py
    └── ...
```

Create a project and app:

```bash
uv add django
uv run django-admin startproject myproject
cd myproject
uv run python manage.py startapp blog
```

### URL Routing

Define URL patterns in `urls.py`:

```python
from django.urls import path
from . import views

urlpatterns = [
    path("", views.home, name="home"),
    path("posts/", views.post_list, name="post-list"),
    path("posts/<int:pk>/", views.post_detail, name="post-detail"),
    path("posts/create/", views.post_create, name="post-create"),
]
```

### Views

**Function-based views** are straightforward:

```python
from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from .models import Post

def post_detail(request, pk):
    post = get_object_or_404(Post, pk=pk)
    return render(request, "blog/post_detail.html", {"post": post})
```

**Class-based views** provide reusable patterns:

```python
from django.views.generic import ListView, DetailView
from .models import Post

class PostListView(ListView):
    model = Post
    template_name = "blog/post_list.html"
    context_object_name = "posts"
    paginate_by = 10

class PostDetailView(DetailView):
    model = Post
    template_name = "blog/post_detail.html"
    context_object_name = "post"
```

### Django ORM Basics

Define models that map to database tables:

```python
from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)

    class Meta:
        verbose_name_plural = "categories"

    def __str__(self):
        return self.name

class Post(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    content = models.TextField()
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name="posts")
    author = models.ForeignKey("auth.User", on_delete=models.CASCADE)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    published = models.BooleanField(default=False)

    def __str__(self):
        return self.title
```

Query the database:

```python
# Create
post = Post.objects.create(title="Hello", content="World", author=user, category=cat)

# Read
published = Post.objects.filter(published=True).order_by("-created")
one_post = Post.objects.get(pk=1)

# Update
post.title = "Updated Title"
post.save()

# Delete
post.delete()

# Aggregation
from django.db.models import Count
categories = Category.objects.annotate(post_count=Count("posts"))
```

### Admin Interface

Register models to get a full CRUD admin panel:

```python
from django.contrib import admin
from .models import Post, Category

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ("title", "author", "category", "published", "created")
    list_filter = ("published", "category", "created")
    search_fields = ("title", "content")
    prepopulated_fields = {"slug": ("title",)}

admin.site.register(Category)
```

Visit `/admin/` to manage your data through a clean, auto-generated interface.

### When to Choose Django

Choose Django when you need:
- A full-featured web application (not just an API)
- Rapid prototyping with built-in admin and auth
- A large team that benefits from opinionated conventions
- Strong security defaults
- Long-term maintainability with proven patterns

---

## 11.6 Building REST APIs

### RESTful Design Principles

A well-designed REST API communicates clearly through its URIs, methods, and status codes:

```python
# Resource naming: use nouns, not verbs
# ✅ Good
GET    /api/articles
POST   /api/articles
GET    /api/articles/42
PUT    /api/articles/42
DELETE /api/articles/42

# ❌ Bad
GET    /api/getArticle
POST   /api/createArticle
```

**Nesting resources** to show relationships:

```
GET /api/authors/5/books          → Books by author 5
GET /api/authors/5/books/12       → Book 12 by author 5
POST /api/authors/5/books         → Create a book for author 5
```

### API Versioning

Include the version in the URL path:

```python
from fastapi import APIRouter

router_v1 = APIRouter(prefix="/api/v1")
router_v2 = APIRouter(prefix="/api/v2")

@router_v1.get("/users")
def list_users_v1():
    return [{"id": 1, "name": "Alice"}]  # v1: flat list

@router_v2.get("/users")
def list_users_v2():
    return {"data": [{"id": 1, "name": "Alice"}], "meta": {"count": 1}}  # v2: envelope
```

### Serialization and Deserialization

Transform database models to API responses and back:

```python
from pydantic import BaseModel
from datetime import datetime

class ArticleSerializer(BaseModel):
    id: int
    title: str
    content: str
    author: str
    created: datetime

    model_config = {"from_attributes": True}

class ArticleCreate(BaseModel):
    title: str
    content: str

@app.post("/api/articles", response_model=ArticleSerializer, status_code=201)
def create_article(article: ArticleCreate):
    db_article = ArticleModel(**article.model_dump(), author=current_user, created=datetime.now())
    db.save(db_article)
    return db_article
```

### Pagination

Avoid returning thousands of records in a single response:

```python
from fastapi import Query

@app.get("/api/articles")
def list_articles(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    offset = (page - 1) * limit
    articles = ArticleModel.query.offset(offset).limit(limit).all()
    total = ArticleModel.query.count()

    return {
        "data": articles,
        "meta": {
            "page": page,
            "limit": limit,
            "total": total,
            "pages": (total + limit - 1) // limit,
        },
    }
```

### Filtering and Searching

```python
@app.get("/api/articles")
def list_articles(
    search: str | None = None,
    category: str | None = None,
    sort_by: str = "created",
    order: str = "desc",
):
    query = ArticleModel.query

    if search:
        query = query.filter(ArticleModel.title.contains(search))
    if category:
        query = query.filter(ArticleModel.category == category)

    sort_column = getattr(ArticleModel, sort_by, ArticleModel.created)
    if order == "desc":
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())

    return query.all()
```

### Authentication: Token-Based and JWT

**Token-based authentication** requires clients to include a token in the `Authorization` header:

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

@app.get("/api/profile")
def get_profile(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    user = verify_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    return {"username": user.username}
```

**JWT (JSON Web Token)** is a common token format. We'll cover implementation in detail in Section 11.8.

### Rate Limiting

Protect your API from abuse:

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.get("/api/articles")
@limiter.limit("100/minute")
def list_articles(request: Request):
    return ArticleModel.query.all()
```

---

## 11.7 Databases with ORMs

### SQLAlchemy Basics

SQLAlchemy is Python's most powerful and flexible ORM. It works with Flask, FastAPI, and standalone Python scripts.

**Installation:**

```bash
uv add sqlalchemy
```

**Engine, Session, and Declarative Base:**

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

# Create an engine (connects to the database)
engine = create_engine("sqlite:///app.db", echo=True)

# Create a session factory
SessionLocal = sessionmaker(bind=engine)

# Base class for all models
class Base(DeclarativeBase):
    pass
```

### Defining Models

```python
from sqlalchemy import String, Text, ForeignKey, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(120), unique=True)
    created_at: Mapped[str] = mapped_column(DateTime, server_default=func.now())

    # One-to-many relationship
    posts: Mapped[list["Post"]] = relationship(back_populates="author")

    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}')>"

class Post(Base):
    __tablename__ = "posts"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    content: Mapped[str] = mapped_column(Text)
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[str] = mapped_column(DateTime, server_default=func.now())

    # Relationships
    author: Mapped["User"] = relationship(back_populates="posts")
    tags: Mapped[list["Tag"]] = relationship(secondary="post_tags", back_populates="posts")

class Tag(Base):
    __tablename__ = "tags"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50), unique=True)

    # Many-to-many relationship
    posts: Mapped[list["Post"]] = relationship(secondary="post_tags", back_populates="tags")

# Association table for many-to-many
from sqlalchemy import Table, Column, Integer
post_tags = Table(
    "post_tags",
    Base.metadata,
    Column("post_id", Integer, ForeignKey("posts.id"), primary_key=True),
    Column("tag_id", Integer, ForeignKey("tags.id"), primary_key=True),
)

# Create all tables
Base.metadata.create_all(engine)
```

### CRUD Operations

```python
def get_session():
    return SessionLocal()

# CREATE
def create_user(username: str, email: str) -> User:
    with get_session() as session:
        user = User(username=username, email=email)
        session.add(user)
        session.commit()
        session.refresh(user)  # Reload from DB to get defaults
        return user

# READ
def get_user_by_id(user_id: int) -> User | None:
    with get_session() as session:
        return session.get(User, user_id)

def get_users_by_email(email: str) -> list[User]:
    with get_session() as session:
        return session.query(User).filter(User.email == email).all()

# UPDATE
def update_username(user_id: int, new_name: str) -> User | None:
    with get_session() as session:
        user = session.get(User, user_id)
        if user:
            user.username = new_name
            session.commit()
            session.refresh(user)
        return user

# DELETE
def delete_user(user_id: int) -> bool:
    with get_session() as session:
        user = session.get(User, user_id)
        if user:
            session.delete(user)
            session.commit()
            return True
        return False
```

### Relationships

**One-to-Many**: A user has many posts.

```python
user = session.get(User, 1)
print(user.posts)  # List of Post objects

post = session.get(Post, 1)
print(post.author)  # Single User object
```

**Many-to-Many**: Posts can have many tags, and tags can belong to many posts.

```python
tag_python = Tag(name="Python")
tag_web = Tag(name="Web")
post = Post(title="Flask Tips", content="...", author_id=1)
post.tags.extend([tag_python, tag_web])
session.commit()

# Query tags for a post
post = session.get(Post, 1)
for tag in post.tags:
    print(tag.name)  # "Python", "Web"
```

### Migrations with Alembic

Alembic tracks database schema changes over time:

```bash
uv add alembic
uv run alembic init alembic
```

Configure `alembic.ini` to point to your database, then create and apply migrations:

```bash
# Auto-generate a migration from model changes
uv run alembic revision --autogenerate -m "add users table"

# Apply the migration
uv run alembic upgrade head

# Roll back one step
uv run alembic downgrade -1

# Roll back to a specific revision
uv run alembic downgrade abc123
```

### Raw SQL vs SQLAlchemy vs Django ORM

| Feature              | Raw SQL              | SQLAlchemy             | Django ORM             |
|----------------------|----------------------|------------------------|------------------------|
| **Learning curve**   | SQL knowledge needed  | Medium-High            | Low-Medium             |
| **Type safety**      | None                 | Strong (mapped columns)| Moderate               |
| **Performance**      | Optimal (manual)     | Very good              | Good                   |
| **Complexity**       | Manual everything    | Flexible, powerful     | Convention over config |
| **Relationships**    | Manual JOINs         | Declarative            | Declarative            |
| **Migrations**       | Manual DDL           | Alembic                | Built-in (Django Migrations) |
| **Database support** | All                  | All (via drivers)      | All major databases    |
| **Best for**         | One-off queries      | Complex apps, flexibility | Rapid development   |

---

## 11.8 Authentication and Authorization

### Password Hashing

Never store plain-text passwords. Use a hashing library with salting:

```python
from werkzeug.security import generate_password_hash, check_password_hash
# OR use bcrypt:
# from bcrypt import hashpw, gensalt, checkpw

# Hash a password
hashed = generate_password_hash("my_secure_password", method="scrypt")
# Store 'hashed' in the database

# Verify a password
is_valid = check_password_hash(hashed, "my_secure_password")  # True
is_valid = check_password_hash(hashed, "wrong_password")      # False
```

Using bcrypt directly:

```python
import bcrypt

def hash_password(password: str) -> bytes:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt())

def verify_password(password: str, hashed: bytes) -> bool:
    return bcrypt.checkpw(password.encode(), hashed)
```

### Login and Session Management

**Flask session-based login:**

```python
from flask import Flask, session, redirect, url_for, request, flash
from werkzeug.security import check_password_hash
from functools import wraps

app = Flask(__name__)
app.secret_key = "change-this-in-production"

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "user_id" not in session:
            flash("Please log in to access this page.", "warning")
            return redirect(url_for("login"))
        return f(*args, **kwargs)
    return decorated_function

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]

        user = db.query_user(username=username)
        if user and check_password_hash(user.password_hash, password):
            session["user_id"] = user.id
            session["username"] = user.username
            flash("Logged in successfully!", "success")
            return redirect(url_for("dashboard"))

        flash("Invalid credentials.", "error")

    return render_template("login.html")

@app.route("/logout")
def logout():
    session.clear()
    flash("You have been logged out.", "info")
    return redirect(url_for("index"))

@app.route("/dashboard")
@login_required
def dashboard():
    return render_template("dashboard.html", username=session["username"])
```

### JWT Tokens (PyJWT)

JWTs are self-contained tokens that carry user identity and claims:

```bash
uv add PyJWT
```

```python
import jwt
from datetime import datetime, timedelta, timezone

SECRET_KEY = "your-secret-key-change-this"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def create_access_token(user_id: int, role: str = "user") -> str:
    payload = {
        "sub": str(user_id),
        "role": role,
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str) -> dict | None:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None  # Token has expired
    except jwt.InvalidTokenError:
        return None  # Invalid token

# Usage in FastAPI
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer

security = HTTPBearer()

def get_current_user(credentials = Depends(security)):
    payload = verify_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return payload
```

### OAuth2 Basics

OAuth2 allows third-party applications to access user data without sharing credentials. The most common flow for API authentication is the **Authorization Code** flow:

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client   │────▶│ Auth     │────▶│ Resource │
│  App      │     │ Server   │     │ Server   │
│           │◀────│ (Google) │◀────│ (API)    │
└──────────┘     └──────────┘     └──────────┘
     │                  │
     │  1. Redirect to  │
     │     login page   │
     │  2. User logs in │
     │  3. Get auth code│
     │  4. Exchange for │
     │     access token │
```

Using Google OAuth2 with FastAPI:

```python
from fastapi import FastAPI
from httpx import AsyncClient

app = FastAPI()

GOOGLE_CLIENT_ID = "your-client-id"
GOOGLE_CLIENT_SECRET = "your-client-secret"
GOOGLE_REDIRECT_URI = "http://localhost:8000/auth/google/callback"

@app.get("/auth/google")
async def google_login():
    """Redirect user to Google's login page."""
    auth_url = (
        "https://accounts.google.com/o/oauth2/v2/auth"
        f"?client_id={GOOGLE_CLIENT_ID}"
        f"&redirect_uri={GOOGLE_REDIRECT_URI}"
        "&response_type=code"
        "&scope=openid email profile"
    )
    return RedirectResponse(auth_url)

@app.get("/auth/google/callback")
async def google_callback(code: str):
    """Exchange authorization code for tokens."""
    async with AsyncClient() as client:
        token_response = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "redirect_uri": GOOGLE_REDIRECT_URI,
                "grant_type": "authorization_code",
            },
        )
    tokens = token_response.json()

    # Use access_token to fetch user info
    async with AsyncClient() as client:
        user_response = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {tokens['access_token']}"},
        )
    user_info = user_response.json()

    # Find or create user in your database
    return {"user": user_info}
```

### Role-Based Access Control (RBAC)

Implement different permission levels for different user roles:

```python
from enum import Enum

class Role(str, Enum):
    VIEWER = "viewer"
    EDITOR = "editor"
    ADMIN = "admin"

ROLE_HIERARCHY = {
    Role.VIEWER: 1,
    Role.EDITOR: 2,
    Role.ADMIN: 3,
}

def require_role(minimum_role: Role):
    """Decorator that checks if the current user has the required role."""
    def decorator(f):
        @wraps(f)
        async def decorated(request: Request, *args, **kwargs):
            user_role = Role(request.state.user.get("role", "viewer"))
            if ROLE_HIERARCHY[user_role] < ROLE_HIERARCHY[minimum_role]:
                raise HTTPException(
                    status_code=403,
                    detail=f"Requires role: {minimum_role.value} or higher",
                )
            return await f(request, *args, **kwargs)
        return decorated
    return decorator

@app.get("/admin/dashboard")
@require_role(Role.ADMIN)
async def admin_dashboard(request: Request):
    return {"message": "Welcome to the admin dashboard"}

@app.put("/articles/{id}")
@require_role(Role.EDITOR)
async def edit_article(request: Request, id: int):
    return {"message": f"Article {id} updated"}
```

---

## 11.9 Deployment

Building a working application locally is only half the battle. Deploying it safely and efficiently is what makes it a product.

### WSGI with Gunicorn

**WSGI** (Web Server Gateway Interface) is the standard interface between Python web applications and web servers. Gunicorn (Green Unicorn) is the most popular WSGI server:

```bash
uv add gunicorn
```

```bash
# Basic usage
uv run gunicorn app:app --bind 0.0.0.0:8000 --workers 4

# With config file (gunicorn.conf.py)
uv run gunicorn -c gunicorn.conf.py app:app
```

`gunicorn.conf.py`:

```python
import multiprocessing

bind = "0.0.0.0:8000"
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "sync"
timeout = 120
accesslog = "access.log"
errorlog = "error.log"
loglevel = "info"
```

### ASGI with Uvicorn

**ASGI** (Asynchronous Server Gateway Interface) is the async successor to WSGI, used by FastAPI:

```bash
uv add uvicorn[standard]

# Basic usage
uv run uvicorn app:app --host 0.0.0.0 --port 8000 --workers 4

# Production with Gunicorn managing Uvicorn workers
uv add gunicorn
uv run gunicorn app:app -k uvicorn.workers.UvicornWorker --workers 4 --bind 0.0.0.0:8000
```

### Nginx as Reverse Proxy

Nginx sits in front of your application server, handling TLS termination, static files, and load balancing:

```nginx
server {
    listen 80;
    server_name example.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name example.com;

    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    # Serve static files directly
    location /static/ {
        alias /app/static/;
        expires 30d;
    }

    # Proxy to application server
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Docker Basics for Python Web Apps

Containerize your application for consistent deployment:

```dockerfile
FROM python:3.12-slim

WORKDIR /app

# Install dependencies first (for layer caching)
COPY pyproject.toml uv.lock ./
RUN pip install uv
RUN uv sync --no-dev

# Copy application code
COPY . .

EXPOSE 8000

CMD ["uv", "run", "gunicorn", "-c", "gunicorn.conf.py", "app:app"]
```

Build and run:

```bash
docker build -t myapp .
docker run -p 8000:8000 -e DATABASE_URL="postgresql://..." myapp
```

A `docker-compose.yml` for local development with a database:

```yaml
services:
  app:
    build: .
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://user:pass@db:5432/mydb
    depends_on:
      - db

  db:
    image: postgres:16
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: mydb
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

### Environment Variables and Configuration

Never hardcode secrets. Use environment variables:

```python
import os

class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///dev.db")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-only-key-change-me")
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    CORS_ORIGINS: list[str] = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
```

### Deployment Checklist

```
✅ Environment variables set (secrets, database URLs)
✅ DEBUG mode disabled
✅ Gunicorn/Uvicorn running with multiple workers
✅ Database migrations applied
✅ Static files collected (Django: collectstatic)
✅ HTTPS configured (TLS certificates)
✅ Nginx reverse proxy configured
✅ Logging configured (stdout/file-based)
✅ Health check endpoint available
✅ Rate limiting enabled
✅ CORS configured for production origins
✅ Database backups scheduled
✅ Monitoring and alerting configured
```

---

## 11.10 Web Scraping Basics

Web scraping extracts data from websites programmatically. It's useful for data collection, price monitoring, research, and more.

### Installation

```bash
uv add requests beautifulsoup4
```

### Fetching a Web Page

```python
import requests
from bs4 import BeautifulSoup

# Fetch a page
response = requests.get("https://example.com", timeout=10)
response.raise_for_status()  # Raise an error for bad status codes

# Parse the HTML
soup = BeautifulSoup(response.text, "html.parser")

# Get the title
print(soup.title.string)  # "Example Domain"
```

### Finding Elements

BeautifulSoup provides multiple ways to locate elements:

```python
# Find a single element
first_paragraph = soup.find("p")
print(first_paragraph.text)

# Find all elements of a type
all_paragraphs = soup.find_all("p")
for p in all_paragraphs:
    print(p.text)

# Find by CSS class
articles = soup.find_all("div", class_="article")
for article in articles:
    print(article.find("h2").text)

# Find by ID
header = soup.find("header", id="main-header")

# CSS selectors (most flexible)
links = soup.select("nav ul li a")              # Nested selectors
headings = soup.select("h1, h2, h3")            # Multiple selectors
active = soup.select("a.active")                 # By class
sidebar = soup.select_one("#sidebar > .content") # Direct children
```

### Extracting Data

```python
# Extract text
title = soup.find("h1").text.strip()

# Extract attributes
link = soup.find("a")
href = link["href"]            # Get href attribute
all_attrs = link.attrs         # Get all attributes as dict

# Extract data from structured content
rows = soup.find_all("tr")
for row in rows:
    cells = row.find_all("td")
    if len(cells) >= 2:
        name = cells[0].text.strip()
        value = cells[1].text.strip()
        print(f"{name}: {value}")
```

### Parsing Different Formats

```python
# Parse a page with an encoding issue
response = requests.get("https://example.com")
response.encoding = "utf-8"  # Force encoding

# Parse HTML from a file
with open("page.html", "r") as f:
    soup = BeautifulSoup(f, "html.parser")

# Parse malformed HTML
soup = BeautifulSoup("<html><body><p>Unclosed paragraph", "html.parser")
# BeautifulSoup handles this gracefully
```

### Complete Scraping Example

```python
import requests
from bs4 import BeautifulSoup
import json
import time

def scrape_book_prices(url: str) -> list[dict]:
    """Scrape book titles and prices from a sample bookstore."""
    headers = {
        "User-Agent": "Mozilla/5.0 (Educational Bot)"
    }

    response = requests.get(url, headers=headers, timeout=10)
    response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")
    books = []

    for article in soup.select("article.product_pod"):
        title_el = article.select_one("h3 a")
        price_el = article.select_one(".price_color")

        if title_el and price_el:
            books.append({
                "title": title_el["title"],
                "url": title_el["href"],
                "price": price_el.text.strip(),
            })

    return books

# Usage
if __name__ == "__main__":
    url = "https://books.toscrape.com/catalogue/page-1.html"
    books = scrape_book_prices(url)
    for book in books:
        print(f"{book['title']}: {book['price']}")

    # Save to JSON
    with open("books.json", "w") as f:
        json.dump(books, f, indent=2)
```

### Robots.txt and Ethics

Always check a website's `robots.txt` before scraping:

```python
from urllib.robotparser import RobotFileParser

def can_scrape(url: str, user_agent: str = "*") -> bool:
    """Check if scraping is allowed by robots.txt."""
    from urllib.parse import urlparse
    parsed = urlparse(url)
    robots_url = f"{parsed.scheme}://{parsed.netloc}/robots.txt"

    rp = RobotFileParser()
    rp.set_url(robots_url)
    rp.read()

    return rp.can_fetch(user_agent, url)

# Usage
if can_scrape("https://example.com/data"):
    response = requests.get("https://example.com/data")
else:
    print("Scraping not allowed by robots.txt")
```

**Ethical scraping guidelines:**

1. **Respect robots.txt**: If it disallows crawling, don't scrape.
2. **Rate limit your requests**: Add delays between requests (`time.sleep(1)`) to avoid overwhelming servers.
3. **Identify your bot**: Use a descriptive User-Agent string.
4. **Don't scrape personal data**: Respect privacy laws (GDPR, CCPA).
5. **Cache results**: Don't fetch the same page repeatedly.
6. **Check the Terms of Service**: Some sites explicitly prohibit scraping.
7. **Handle errors gracefully**: Don't retry endlessly if a site blocks you.

---

## Key Takeaways

1. **HTTP is the foundation** of all web communication: clients send requests with methods and headers, servers respond with status codes and data.
2. **REST APIs** use HTTP methods semantically (GET, POST, PUT, PATCH, DELETE) with resource-based URIs and stateless request handling.
3. **Flask** is a lightweight micro-framework ideal for small to medium web apps, with Jinja2 templates and a simple routing system.
4. **FastAPI** excels for building APIs with built-in validation (Pydantic), automatic documentation, dependency injection, and native async support.
5. **Django** provides a batteries-included approach with ORM, admin, authentication, and security built in—perfect for large, complex applications.
6. **SQLAlchemy** is a powerful ORM that lets you define models as Python classes and interact with databases using Pythonic queries instead of raw SQL.
7. **Alembic** tracks database schema migrations, allowing you to evolve your database structure safely alongside your code.
8. **Never store plain-text passwords**—always hash them with werkzeug, bcrypt, or similar libraries with proper salting.
9. **JWT tokens** enable stateless authentication by encoding user identity and claims directly in the token, suitable for APIs and microservices.
10. **Deployment requires multiple layers**: application server (Gunicorn/Uvicorn), reverse proxy (Nginx), containerization (Docker), and proper configuration management.
11. **Web scraping** with requests and BeautifulSoup is powerful but must be done ethically—respect robots.txt, rate-limit requests, and follow terms of service.
12. **Choose the right tool** for the job: Flask for simple apps, FastAPI for APIs and async workloads, Django for feature-rich applications with complex models and admin needs.

---

## Practice Exercises

### Exercise 1: Build a REST API with FastAPI

Create a CRUD API for managing a book collection. Each book has an `id`, `title`, `author`, `year`, and `genre`. Include proper validation, error handling, and pagination.

```python
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel, Field

app = FastAPI(title="Book API")

class Book(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    author: str = Field(min_length=1, max_length=100)
    year: int = Field(ge=0, le=2030)
    genre: str

# Your task: implement these endpoints
# POST   /books        → Create a new book (return 201)
# GET    /books        → List all books (with pagination: page, limit)
# GET    /books/{id}   → Get a single book
# PUT    /books/{id}   → Update a book entirely
# DELETE /books/{id}   → Delete a book
# GET    /books/search?q=flask → Search by title
```

### Exercise 2: Build a Flask Application with Templates

Create a Flask blog application with:
- A base template with navigation
- A home page listing all posts (title, excerpt, date)
- A post detail page
- A form to create new posts with flash messages for validation errors
- Template inheritance from a base template

```python
from flask import Flask, render_template, request, redirect, url_for, flash

app = Flask(__name__)
app.secret_key = "change-me"

posts = []  # In-memory storage for simplicity

# Implement:
# @app.route("/") → home page with post list
# @app.route("/post/<int:id>") → post detail
# @app.route("/new", methods=["GET", "POST"]) → create post form + handler
```

### Exercise 3: Implement JWT Authentication

Build a complete JWT authentication flow:

```python
import jwt
from datetime import datetime, timedelta, timezone
from werkzeug.security import generate_password_hash, check_password_hash

SECRET_KEY = "your-secret-key"

# Implement these functions:
def create_user(username: str, password: str) -> dict:
    """Create a user with a hashed password. Return the user dict."""
    pass

def authenticate(username: str, password: str) -> str | None:
    """Verify credentials. Return a JWT token if valid, None otherwise."""
    pass

def verify_token(token: str) -> dict | None:
    """Decode and validate a JWT. Return the payload or None if invalid."""
    pass

# Test your implementation:
user = create_user("alice", "secure_password123")
token = authenticate("alice", "secure_password123")
assert token is not None
payload = verify_token(token)
assert payload["sub"] == "alice"
assert authenticate("alice", "wrong") is None
```

### Exercise 4: Web Scraping Challenge

Write a scraper that extracts all headlines from a news website and saves them as a JSON file:

```python
import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime

def scrape_headlines(url: str) -> list[dict]:
    """
    Scrape headlines from a news website.

    Requirements:
    - Check robots.txt before scraping
    - Use a descriptive User-Agent header
    - Add a 1-second delay between requests
    - Handle network errors gracefully
    - Return a list of dicts with 'title', 'url', and 'scraped_at' fields
    """
    pass

# Test with https://news.ycombinator.com
headlines = scrape_headlines("https://news.ycombinator.com")
with open("headlines.json", "w") as f:
    json.dump(headlines, f, indent=2)
print(f"Scraped {len(headlines)} headlines")
```

### Exercise 5: Deploy a Flask App with Docker

Write a complete Dockerfile and docker-compose.yml for a Flask application:

```python
# app.py - A minimal Flask app with a health check
from flask import Flask, jsonify

app = Flask(__name__)

@app.route("/")
def index():
    return jsonify({"status": "running", "version": "1.0.0"})

@app.route("/health")
def health():
    return jsonify({"healthy": True})

# Your tasks:
# 1. Write a Dockerfile with multi-stage build
# 2. Write a docker-compose.yml with PostgreSQL
# 3. Configure the app to use environment variables for database connection
# 4. Add a .dockerignore file
# 5. Write a Makefile with targets: build, run, stop, logs
```

---

In the next chapter, we'll explore **Testing**, learning how to write unit tests, integration tests, and end-to-end tests to ensure your Python web applications are reliable and maintainable.
