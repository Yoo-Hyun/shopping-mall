# 재고 관리 플랫폼 PRD 작성

> 작성일: 2025-12-22 18:13

## 프로젝트 개요
- **이름**: Inventory Management Platform
- **유형**: B2B SaaS
- **목표**: 온라인/오프라인 통합 재고 관리

## 핵심 기능
- 멀티테넌트 관리
- 상품/SKU 관리
- 창고/매장 관리
- 재고 CRUD (예약/확정/복구/이동/조정)
- Webhook 알림
- 대시보드

## 데이터 모델
- Tenant (고객사)
- Product (상품)
- Location (위치)
- Inventory (재고)
- InventoryLog (이력)
- Webhook

## 연동 방식
- REST API 기반
- 주문 시: reserve → confirm 2단계
- 취소 시: release로 복구
- 실시간 알림: Webhook

## 개발 로드맵
- Phase 1: 핵심 API (2주)
- Phase 2: 멀티테넌트, 대시보드 (2주)
- Phase 3: Webhook, 알림 (2주)
- Phase 4: 쇼핑몰 연동 (2주)
