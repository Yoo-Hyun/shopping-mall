# 쇼핑몰 기술 설계서 (Technical Specification)

> 작성일: 2025-12-22

## 1. 시스템 아키텍처
- 클라이언트: React + Vite (Vercel)
- 서버: Express.js (Heroku)
- 데이터베이스: MongoDB Atlas

## 2. 데이터 모델
- User: email, name, password(bcrypt), user_type, address
- Product: sku, name, price, category, image, description, tags
- Cart: user, items (가상필드: totalPrice, totalItems)
- Order: orderNumber, user, items, shippingAddress, payment, status

## 3. API 엔드포인트 (22개)
- Auth: 2개 (login, me)
- Product: 7개 (CRUD + SKU/태그 검색)
- Cart: 5개 (CRUD + 비우기)
- Order: 8개 (생성, 조회, 상태/운송장 업데이트, 취소)

## 4. 인증/보안
- JWT Bearer Token
- 미들웨어: protect (토큰 검증), admin (관리자 확인)

## 5. 프론트엔드 라우트 (15개)
- 사용자: /, /signup, /login, /product/:id, /cart, /order, /orders
- 관리자: /admin, /admin/products, /admin/orders
