# <img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/electric.png" width="100%"/>

<div align="center">

![ProFit Banner](https://img.shields.io/badge/ProFit-Ecommerce%20%2B%20AI%20Chatbot-0EA5E9?style=for-the-badge&logo=rocket&logoColor=white)
![Java](https://img.shields.io/badge/Java-21-ED8B00?style=flat-square&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0-6DB33F?style=flat-square&logo=spring&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python&logoColor=white)
![LangChain](https://img.shields.io/badge/LangChain-0.3-LINE?style=flat-square&logoColor=white)
![LangGraph](https://img.shields.io/badge/LangGraph-Agentic%20RAG-FF6B6B?style=flat-square&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker&logoColor=white)

# **ProFit** — Nền tảng Thương mại Điện tử Thông minh & Chatbot AI Tư vấn Sản phẩm

> *Nâng cấp cơ thể của bạn — Hiệu quả thật, Giá cả thật.*

---

<p align="center">
  <img src="https://img.shields.io/badge/500+%20Sản%20phẩm-0EA5E9?style=flat-square" />
  <img src="https://img.shields.io/badge/20K+%20Khách%20hàng-06B6D4?style=flat-square" />
  <img src="https://img.shields.io/badge/50+%20Thương%20hiệu-8B5CF6?style=flat-square" />
  <img src="https://img.shields.io/badge/100%25-Chính%20hãng-22C55E?style=flat-square" />
</p>

<p align="center">
  <a href="#-tổng-quan">Tổng quan</a>&nbsp;&bull;&nbsp;
  <a href="#-kiến-trúc-hệ-thống">Kiến trúc</a>&nbsp;&bull;&nbsp;
  <a href="#-các-tính-năng-chính">Tính năng</a>&nbsp;&bull;&nbsp;
  <a href="#-công-nghệ-sử-dụng">Công nghệ</a>&nbsp;&bull;&nbsp;
  <a href="#-bắt-đầu-nhanh">Bắt đầu</a>&nbsp;&bull;&nbsp;
  <a href="#-chatbot-ai-agentic-rag">Chatbot AI</a>&nbsp;&bull;&nbsp;
  <a href="#-hướng-phát-triển-tương-lai">Lộ trình</a>
</p>

</div>

---

<p align="center">
  <img src="https://img.shields.io/badge/✨-Xem%20Demo%20Live-0EA5E9?style=for-the-badge&logo=vercel&logoColor=white" />
</p>

---

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" width="100%"/>

## 🏆 Tổng quan

**ProFit** là nền tảng Thương mại Điện tử chuyên biệt cho ngành **thực phẩm bổ sung (supplement)** — Whey Protein, Creatine, Pre-Workout, Vitamin/BCAA. Điểm khác biệt cốt lõi của ProFit so với các sàn TMĐT truyền thống là việc tích hợp **AI Chatbot tư vấn thông minh** dựa trên kỹ thuật **Agentic RAG**, mang lại trải nghiệm mua sắm cá nhân hóa, giảm tải CSKH và nâng cao tỉ lệ chốt đơn.

### 🌟 Điểm nổi bật

- **AI Chatbot Tư vấn Cá nhân hóa** — Hỏi intake (mục tiêu, ngân sách, tình trạng sức khỏe) rồi đề xuất tối đa 3 sản phẩm phù hợp kèm lý do
- **Agentic RAG Pipeline** — LangGraph xử lý đa bước: route → retrieve → generate → reflect (tự kiểm tra chất lượng câu trả lời)
- **Hybrid Search** — Kết hợp BM25 + Vector Search + Reciprocal Rank Fusion cho kết quả tìm kiếm tối ưu
- **Thanh toán đa phương thức** — COD, Chuyển khoản ngân hàng (QR), VNPAY
- **UI/UX Premium Dark Theme** — Glassmorphism, Aurora Background, Particle Effects
- **Docker-Ready** — Triển khai toàn bộ hệ thống bằng Docker Compose

---

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/electric.png" width="100%"/>

## 🏗️ Kiến trúc Hệ thống

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│                                                                   │
│  ┌──────────────────────────┐    ┌──────────────────────────┐   │
│  │   React 18 + Vite SPA     │    │   ChatWidget (AI Chat)   │   │
│  │   Frontend (Port 5173)    │    │   Streaming SSE Response │   │
│  │   Dark Theme Premium UI    │    │   React Component        │   │
│  └──────────┬────────────────┘    └──────────┬───────────────┘   │
└─────────────┼─────────────────────────────────┼─────────────────┘
              │         REST API                │   WebSocket/SSE
              │                                 │
┌─────────────┼─────────────────────────────────┼─────────────────┐
│             │     BACKEND LAYER (Spring Boot)  │                 │
│             │                                 │                 │
│  ┌──────────▼──────────┐         ┌────────────▼─────────────┐   │
│  │   REST Controllers   │         │   Chat Integration API   │   │
│  │   JWT Auth / OAuth2  │         │   POST /chat/stream      │   │
│  │   Product / Order    │         └────────────┬─────────────┘   │
│  └──────────┬──────────┘                      │                 │
│             │                                 │                 │
│  ┌──────────▼──────────┐         ┌────────────▼─────────────┐   │
│  │   Service Layer      │         │   Chatbot (FastAPI)       │   │
│  │   Business Logic     │         │   LangGraph Agentic RAG   │   │
│  └──────────┬──────────┘         │   Python / LangChain      │   │
│             │                    └────────────┬─────────────┘   │
│  ┌──────────▼──────────┐                      │                 │
│  │   Spring Data JPA    │         ┌───────────▼──────────────┐  │
│  │   MySQL Database     │         │   PGVector Collection     │  │
│  │   ProFitSuppsDB     │         │   Vector + BM25 Hybrid    │  │
│  └─────────────────────┘         └────────────────────────────┘  │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

### 🗂️ Cấu trúc Project

```
ProFit/
│
├── backend/                          # Spring Boot 4.0 (Java 21)
│   ├── src/main/java/com/doan/ProFit/
│   │   ├── config/                  # Cấu hình: VNPay, Security, Web
│   │   ├── controller/              # REST API Controllers
│   │   ├── dto/                     # Data Transfer Objects
│   │   ├── entity/                  # JPA Entities (Product, Order, User...)
│   │   ├── enums/                   # Enum types
│   │   ├── repository/              # Spring Data JPA Repositories
│   │   ├── security/                # JWT, OAuth2, UserDetails
│   │   └── service/                 # Business logic layer
│   ├── src/main/resources/
│   │   ├── application.yml          # Cấu hình Spring
│   │   └── static/uploads/         # Uploaded images
│   ├── pom.xml                      # Maven dependencies
│   └── Dockerfile                    # Containerize backend
│
├── frontend/                         # React 18 + Vite
│   ├── src/
│   │   ├── components/              # UI components (Navbar, ProductCard...)
│   │   │   ├── ChatWidget.jsx      # 🤖 AI Chat Widget (floating)
│   │   │   ├── ChatWidget.css      # Chat styling + animations
│   │   │   ├── Particles.jsx       # Aurora background particles
│   │   │   └── ...
│   │   ├── pages/                  # Page components
│   │   │   ├── HomePage.jsx       # Trang chủ + Hero + Stats
│   │   │   ├── ProductsPage.jsx   # Danh sách sản phẩm
│   │   │   ├── ProductDetailPage.jsx
│   │   │   ├── CartPage.jsx
│   │   │   ├── CheckoutPage.jsx   # Thanh toán COD/Banking/VNPAY
│   │   │   ├── OrderPage.jsx      # Theo dõi đơn hàng
│   │   │   ├── admin/              # Dashboard admin
│   │   │   └── ...
│   │   ├── services/               # API configuration (axios)
│   │   ├── styles/                 # global.css (2000+ dòng)
│   │   ├── utils/                  # Helpers (formatPrice, orderHelpers...)
│   │   └── App.jsx                 # Router + State management
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
│
├── chatbot/                          # Python AI (FastAPI + LangGraph)
│   ├── src/agentic_rag/
│   │   ├── core/
│   │   │   ├── graph.py            # 🧠 LangGraph pipeline (MAIN)
│   │   │   ├── state.py            # GraphState definition
│   │   │   └── message_filter.py   # Message trimming + formatting
│   │   ├── retrieval/
│   │   │   ├── fusion.py           # Hybrid search (BM25 + Vector + RRF)
│   │   │   ├── products.py         # Product doc post-processing
│   │   │   └── context.py         # Document → LLM context formatting
│   │   ├── config/
│   │   │   ├── routes.yaml         # 4 route definitions
│   │   │   └── prompts.yaml        # System prompts per route
│   │   ├── api/
│   │   │   └── main.py             # FastAPI endpoints (/chat, /health)
│   │   ├── schemas/                # Pydantic models
│   │   └── llm/                    # LLM factory (OpenAI)
│   ├── data/                       # Knowledge base JSON (product, shipping...)
│   ├── scripts/
│   │   ├── ingest_pgvector.py      # Ingest data → PGVector
│   │   └── patch_rag_notebook.py
│   ├── notebooks/
│   │   └── rag.ipynb               # Lab notebook (BM25, Self-Query...)
│   ├── docs/                       # Architecture docs
│   │   ├── PROJECT_MAP.md
│   │   ├── REQUEST_FLOW.md
│   │   ├── AI_PIPELINE.md
│   │   └── CHATBOT_WHEY_SPEC.md   # Chatbot specification
│   ├── requirements.txt
│   └── Dockerfile
│
├── docker-compose.yml               # Orchestrate all services
├── README.md                        # This file
└── BAO_CAO_CUOI_KY_PROFIT.md       # Final report
```

---

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/fire.png" width="100%"/>

## ✨ Các Tính năng Chính

### 🛍️ E-Commerce Platform

| Tính năng | Mô tả |
|---|---|
| **Duyệt sản phẩm** | Lọc theo danh mục, tìm kiếm, phân trang, sắp xếp |
| **Chi tiết sản phẩm** | Hình ảnh, mô tả, đánh giá, chọn vị (flavor), số lượng |
| **Giỏ hàng** | Thêm/sửa/xóa, tự động tính tổng, persist localStorage |
| **Đặt hàng** | Tạo đơn (khách đăng nhập hoặc vãng lai/guest) |
| **Thanh toán đa phương** | COD, Banking QR (ATM/Ví), VNPAY (QR/ATM) |
| **Theo dõi đơn hàng** | Trạng thái PENDING → CONFIRMED → SHIPPED → DELIVERED |
| **Xác thực** | Đăng ký/đăng nhập, JWT, OAuth2 (Google), quên mật khẩu |
| **Trang Admin** | Dashboard (biểu đồ Recharts), CRUD sản phẩm, quản lý đơn hàng, người dùng |
| **Liên hệ** | Form gửi tin nhắn đến admin |

### 🤖 AI Chatbot — Điểm nhấn của ProFit

| Tính năng | Mô tả |
|---|---|
| **4 Route thông minh** | `product` / `nutrition` / `shipping` / `general` — LLM tự phân loại ý định |
| **Hỏi Intake (2-4 câu)** | Mục tiêu tập luyện → Ngân sách → Nhạy lactose → Lịch tập |
| **Đề xuất cá nhân hóa** | Tối đa 3 sản phẩm: 1 Best Pick + 2 Alternatives |
| **Hybrid Search** | BM25 (keyword) + PGVector (semantic) → Reciprocal Rank Fusion |
| **Reflection Loop** | Tự kiểm tra chất lượng câu trả lời (tối đa 3 vòng) |
| **Streaming Response** | SSE real-time — hiển thị từng token, không cần chờ full response |
| **Không hallucinate** | Luôn dựa trên RAG context; nếu không có data thì nói rõ |
| **Disclaimer tự động** | Kèm cảnh báo y tế khi liên quan đến sức khỏe/lactose |
| **Memory (Session)** | LangGraph MemorySaver ghi nhớ ngữ cảnh cuộc hội thoại |
| **Product Cards** | Hiển thị sản phẩm đề xuất với ảnh, giá, link trong chat |

---

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/aqua.png" width="100%"/>

## 🔧 Công nghệ Sử dụng

### Backend — Spring Boot
```
Java 21  •  Spring Boot 4.0.5  •  Spring Data JPA  •  Spring Security
Spring MVC  •  Spring Validation  •  MySQL Connector  •  Lombok
JWT (jjwt 0.11.5)  •  OAuth2 Client  •  Thymeleaf (admin templates)
```

### Frontend — React Ecosystem
```
React 18.2  •  Vite 4.4  •  React Router DOM 7
Axios 1.16  •  Lucide React (icons)  •  Recharts 3.8 (biểu đồ)
ESLint  •  JSX  •  CSS3 (Glassmorphism, Animations)
```

### Chatbot — AI / Python
```
Python 3.11  •  FastAPI 0.110+  •  Uvicorn
LangChain 0.3  •  LangGraph 0.2  •  LangChain Community
LangChain OpenAI  •  LangChain Postgres (PGVector)
OpenAI GPT-4o-mini  •  Pydantic 2.0
BM25 (rank-bm25)  •  SSE-Starlette
```

### Database & Infrastructure
```
MySQL 8.0  (Main DB — Products, Orders, Users)
PGVector / PostgreSQL 16  (Vector DB — Chatbot RAG)
Docker Compose  (4 services: backend, frontend, pgvector, chatbot)
NGINX  (Serve frontend production build)
```

---

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/dark.png" width="100%"/>

## 🚀 Bắt đầu Nhanh

### Yêu cầu

- **Docker Desktop** (recommended)
- Hoặc: JDK 21+, Node.js 18+, Python 3.11+, MySQL 8.0

### Cách 1 — Docker Compose (Khuyến nghị)

```bash
# Clone hoặc cd vào thư mục ProFit
cd ProFit

# Chạy full stack (Backend + Frontend + MySQL)
docker compose up -d --build

# Muốn thêm Chatbot AI? (cần OPENAI_API_KEY)
docker compose --profile chatbot up -d --build
```

Sau khi chạy:
- 🌐 **Frontend**: [http://localhost:5173](http://localhost:5173)
- 🔧 **Backend API**: [http://localhost:8080/ProFitSuppsDB](http://localhost:8080/ProFitSuppsDB)
- 🤖 **Chatbot API**: [http://localhost:8000](http://localhost:8000)
- 📊 **Health Check**: `GET http://localhost:8000/health`

### Cách 2 — Chạy từng thành phần

**Backend:**
```bash
cd backend
cp src/main/resources/application-local.yaml.example src/main/resources/application-local.yaml
# Sửa username/password MySQL trong file vừa tạo
./mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=local"
# Backend chạy tại http://localhost:8080/ProFitSuppsDB
```

**Frontend:**
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
# Frontend chạy tại http://localhost:5173
```

**Chatbot (Python):**
```bash
cd chatbot
python -m venv venv
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate
pip install -r requirements.txt

# Copy và sửa .env (cần OPENAI_API_KEY)
cp venv/.env.example .env  # hoặc tạo thủ công

# Ingest data vào PGVector
python scripts/ingest_pgvector.py

# Chạy chatbot
uvicorn agentic_rag.api.main:app --reload --port 8000
```

### Tài khoản Demo

| Role | Email | Password |
|------|-------|----------|
| 👑 **Admin** | `admin@profit.com` | Xem trong `application-local.yaml` |
| 👤 **Customer** | `khachhang@gmail.com` | Xem trong `application-local.yaml` |

---

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/solar.png" width="100%"/>

## 🤖 Chatbot AI — Agentic RAG

> **Đây là điểm khác biệt cốt lõi và là điểm nhấn hoành tráng nhất của dự án ProFit.**

### 🧠 Kiến trúc Agentic Pipeline (LangGraph)

```
User Input
    │
    ▼
┌──────────────────────┐
│  prepare_memory      │ ← Trim lịch sử chat (token budget)
│  (trim_messages)     │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  route_query         │ ← LLM phân loại intent
│  (Router LLM)       │   Structured Output → RouteDecision
└──────────┬───────────┘
           │
     ┌─────┼──────────┐
     │     │          │
     ▼     ▼          ▼
  product nutrition shipping  general
     │     │          │
     └─────┼──────────┘
           │
           ▼
┌──────────────────────┐
│  retrieve            │ ← Hybrid Search
│  (BM25 + PGVector)  │   Reciprocal Rank Fusion → k=6 docs
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  generate            │ ← LLM sinh câu trả lời
│  (Route-specific     │   System Prompt + Retrieved Context
│   System Prompt)     │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  reflect             │ ← Critique kiểm tra chất lượng
│  (Reflection Loop)   │   NEEDS_FIX → quay lại generate
│  (max 3 iterations) │   OK → finish
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  finish              │ ← Map docs → ProductItem[]
│  (Final Answer)      │   Trả về JSON response
└──────────────────────┘
           │
           ▼
   JSON Response
{ answer, route_id, products[] }
```

### 🎯 4 Route — Phân loại ý định thông minh

```
┌─────────────────────────────────────────────────────────────┐
│  PRODUCT ROUTE  (Ưu tiên cao nhất khi có SKU/giá/brand)    │
│  → Hỏi intake tối đa 4 câu                                │
│  → Đề xuất: 1 Best Pick + 2 Alternatives                   │
│  → Mỗi sản phẩm: tên + giá + khối lượng + link           │
├─────────────────────────────────────────────────────────────┤
│  SHIPPING ROUTE  (Ưu tiên khi hỏi ship/đổi trả/chính sách)│
│  → Trả lời theo chính sách trong knowledge base           │
│  → Nếu không có: xin lỗi + đề nghị kênh hỗ trợ           │
├─────────────────────────────────────────────────────────────┤
│  NUTRITION ROUTE  (Hỏi kiến thức whey/protein/cách dùng)  │
│  → Giải thích thuật ngữ, thành phần, cách dùng chung     │
│  → Không tư vấn y tế; kèm disclaimer nếu liên quan       │
├─────────────────────────────────────────────────────────────┤
│  GENERAL ROUTE  (Câu hỏi chung ngoài 3 nhóm trên)         │
│  → Giờ mở cửa, tư vấn 1-1, chương trình ưu đãi...       │
└─────────────────────────────────────────────────────────────┘
```

### 🔍 Hybrid Search — BM25 + Vector + RRF

```
Query: "whey nào ít lactose mà giá dưới 1 triệu"

BM25 Search (keyword)           Vector Search (semantic)
┌──────────────────┐            ┌──────────────────┐
│ Tìm: whey,       │            │ Hiểu: sản phẩm  │
│ lactose, gía     │            │ phù hợp cho     │
│ (exact match)    │            │ người nhạy cảm  │
└────────┬─────────┘            └────────┬─────────┘
         │                              │
         └──────────┬───────────────────┘
                    ▼
          Reciprocal Rank Fusion
          Score = Σ 1/(k + rank)
          Merge & Sort → Top 6 docs
                    │
                    ▼
           Retriever Result
```

### 💬 Giao diện Chat Widget

ChatWidget là **floating widget** xuất hiện ở góc phải màn hình:

- Gradient toggle button với animation pulse
- Cửa sổ chat với glassmorphism effect
- Streaming response token-by-token (SSE)
- Typing indicator (3 dots bouncing)
- Product cards trong chat (ảnh, giá, link)
- Dark mode tự động theo hệ thống
- Responsive mobile

### 📁 Knowledge Base — Data Files

```
chatbot/data/
├── 01_tong_quan_whey.json          # Kiến thức tổng quan whey
├── 02_chi_phi_van_chuyen.json      # Chính sách vận chuyển
├── 06_tong_quan_creatine.json      # Kiến thức creatine
├── 08_tong_quan_protein_bar.json  # Kiến thức protein bar
└── ... (nhiều file theo chủ đề)
```

---

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/gradient.png" width="100%"/>

## 🔮 Hướng Phát triển Tương lai

### Giai đoạn tiếp theo (Đang triển khai)

- [ ] **Hoàn thiện AI Chatbot** — Ingest toàn bộ catalog sản phẩm vào PGVector
- [ ] **Đa ngôn ngữ** — Chatbot trả lời được cả tiếng Anh
- [ ] **User Profiling** — Lưu lịch sử chat + mua hàng để cá nhân hóa tốt hơn
- [ ] **Review & Rating** — Người dùng đánh giá sản phẩm sau mua hàng

### Giai đoạn mở rộng

- [ ] **Recommendation Engine** — Gợi ý sản phẩm dựa trên hành vi mua hàng (collaborative filtering)
- [ ] **Phân tích hành vi** — Dashboard analytics: heatmap, conversion rate, drop-off
- [ ] **Chatbot đa kênh** — Mở rộng sang Zalo OA, Facebook Messenger, Telegram
- [ ] **Push Notification** — Thông báo đơn hàng, khuyến mãi qua email/SMS
- [ ] **Tích hợp GHN/GHTK** — Tự động tạo vận đơn, track shipping thời gian thực
- [ ] **Membership System** — Điểm thưởng, cấp bậc VIP, voucher cá nhân hóa
- [ ] **Blog / Content Marketing** — Bài viết về dinh dưỡng, kết nối với chatbot để tư vấn
- [ ] **AI Image Search** — Tìm sản phẩm bằng cách chụp ảnh
- [ ] **Voice Chatbot** — Điều khiển chatbot bằng giọng nói

---

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/electric.png" width="100%"/>

## 📋 API Endpoints

### Public API
| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api/public/products` | Danh sách sản phẩm (filter, search, pagination) |
| GET | `/api/public/products/{id}` | Chi tiết sản phẩm |
| GET | `/api/public/categories` | Danh sách danh mục |
| GET | `/api/public/reviews/product/{id}` | Đánh giá sản phẩm |
| POST | `/api/guest-orders` | Tạo đơn hàng (khách vãng lai) |
| POST | `/api/contact` | Gửi tin nhắn liên hệ |

### Auth API
| Method | Endpoint | Mô tả |
|--------|----------|--------|
| POST | `/api/auth/register` | Đăng ký tài khoản |
| POST | `/api/auth/login` | Đăng nhập |
| POST | `/api/auth/forgot-password` | Quên mật khẩu |
| POST | `/api/auth/reset-password` | Đặt lại mật khẩu |
| GET | `/api/auth/me` | Thông tin user hiện tại |

### Order & Payment API
| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api/orders` | Danh sách đơn hàng (JWT required) |
| GET | `/api/orders/{id}` | Chi tiết đơn hàng |
| PUT | `/api/orders/{id}/status` | Cập nhật trạng thái (Admin) |
| POST | `/api/payment/vnpay/create` | Tạo thanh toán VNPAY |
| GET | `/api/payment/vnpay/return` | Callback từ VNPAY |

### Chatbot API
| Method | Endpoint | Mô tả |
|--------|----------|--------|
| POST | `/chat` | Full RAG pipeline (routing + retrieval + generation + reflection) |
| POST | `/chat/stream` | Streaming response (SSE) — Khuyến nghị dùng |
| GET | `/health` | Health check + config status |

---

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/spark.png" width="100%"/>

## 🧪 Demo Screenshots

> Website ProFit với giao diện Dark Premium Theme, hiệu ứng Aurora và Glassmorphism.

| Trang chủ | Chi tiết sản phẩm | Thanh toán |
|-----------|-------------------|------------|
| Hero banner với hiệu ứng floating | Hình ảnh, giá, mô tả, đánh giá | COD / Banking / VNPAY |
| Danh mục sản phẩm nổi bật | Chọn vị (flavor) + Số lượng | Tóm tắt đơn hàng |
| Sản phẩm bán chạy | Thêm vào giỏ hàng | Xác nhận thông tin giao hàng |

> **AI Chat Widget** — Floating ở góc phải, streaming response real-time, product cards trong chat.

---

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/dark.png" width="100%"/>

## 📝 Quy tắc Đóng góp

```bash
# Luôn làm việc trên nhánh riêng
git checkout develop
git pull origin develop
git checkout -b feature/ten-tinh-nang

# Commit theo conventional commits
git commit -m "feat: thêm tính năng X"
git commit -m "fix: sửa lỗi Y"
git commit -m "docs: cập nhật README"

# Push và tạo Pull Request vào nhánh develop
git push origin feature/ten-tinh-nang
```

### Cấu trúc thư mục khi thêm tính năng

```
backend/  → Thêm Controller + Service + Repository + Entity + DTO
frontend/ → Thêm/Edit Component trong src/components/ hoặc src/pages/
chatbot/  → Thêm Config trong config/ hoặc Data trong data/
```

---

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" width="100%"/>

## 📜 License

Dự án này được phát triển cho mục đích **học tập và nghiên cứu**. MIT License.

---

## 👥 Đội ngũ

| Thành viên | Vai trò | Liên hệ |
|------------|---------|---------|
| Backend Dev | Spring Boot, MySQL, API | |
| Frontend Dev | React, UI/UX, Components | |
| AI/ML Dev | Chatbot, LangGraph, RAG | |

---

<div align="center">

**ProFit** — *Nâng cấp cơ thể của bạn*

![Made with Love](https://img.shields.io/badge/Made%20with-❤️-FF6B6B?style=for-the-badge)
![Built with](https://img.shields.io/badge/Built%20with-Java%2021%20%7C%20React%2018%20%7C%20Python%203.11-0EA5E9?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Active%20%26%20Developing-22C55E?style=for-the-badge)

</div>

---

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/electric.png" width="100%"/>
