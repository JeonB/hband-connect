# hband 데이터 연동

hband의 라이프로그데이터를 연동하여 가공하는 것이 목적

## Architecture (경계 규칙)

- **한 줄 규칙**: BLE/기기 접근은 `services/hband.service.ts`와 `lib/types/hband.types.ts`로만 한다. `app/`, `hooks/`, `contexts/`에서는 `hband-ble`을 import하지 않는다.
- **확장 규칙 (수면·심박 등 새 데이터 추가 시)**: 1) `lib/types/hband.types.ts`에 타입 추가, 2) `services/hband.service.ts`에 read API 추가 (필요 시 네이티브 모듈에도), 3) UI는 서비스/타입만 사용.
