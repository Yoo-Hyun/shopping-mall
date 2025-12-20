# 리팩토링: 어드민 페이지 `pages/admin`으로 이동

## 목표 설명
프로젝트 구조 개선을 위해 `client/src/pages`에 있는 모든 `Admin*` 파일들을 새로운 하위 폴더인 `client/src/pages/admin`으로 이동합니다. 이에 따라 `App.jsx`의 import 경로와 이동된 파일 내의 상대 경로 import를 수정해야 합니다.

## 사용자 검토 필요 사항
> [!NOTE]
> 이것은 구조적인 리팩토링입니다. 기능 변경은 예상되지 않으나, 작업 완료 후 어드민 라우트가 정상 작동하는지 확인해주세요.

## 변경 제안

### 파일 이동
다음 파일들을 `client/src/pages/admin/` 폴더로 이동합니다:
- `AdminOrdersPage.css`
- `AdminOrdersPage.jsx`
- `AdminPage.css`
- `AdminPage.jsx`
- `AdminProductCreatePage.css`
- `AdminProductCreatePage.jsx`
- `AdminProductEditPage.jsx`
- `AdminProductsPage.css`
- `AdminProductsPage.jsx`

### Import 업데이트

#### [수정] [App.jsx](file:///k:/coding/vibe-coding/Shoping-mall/client/src/App.jsx)
새로운 위치를 가리키도록 import를 업데이트합니다:
```javascript
import AdminPage from "./pages/admin/AdminPage";
import AdminProductsPage from "./pages/admin/AdminProductsPage";
import AdminProductCreatePage from "./pages/admin/AdminProductCreatePage";
import AdminProductEditPage from "./pages/admin/AdminProductEditPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
```

#### [수정] 이동된 어드민 페이지들
이동된 각 파일에 대해 상대 경로 import를 업데이트합니다:
- `../components/...` -> `../../components/...`
- `../utils/...` -> `../../utils/...`
- `../context/...` -> `../../context/...`
- `../hooks/...` -> `../../hooks/...`

## 검증 계획

### 자동화 테스트
- `npm run dev`를 실행하여 빌드 에러가 없는지 확인합니다.

### 수동 검증
- `/admin` 경로로 이동하여 대시보드가 정상적으로 로드되는지 확인합니다.
- `/admin/products`, `/admin/orders`와 같은 하위 경로들이 정상 작동하는지 확인합니다.
