/**
 * 연동 화면용 상태 한글화 및 단계 안내 상수.
 */

import type { ConnectionStatus } from '@/lib/types/hband.types';

/** 연결 상태 한글 라벨 */
export const CONNECTION_STATUS_LABELS: Record<ConnectionStatus, string> = {
  disconnected: '연결 안 됨',
  scanning: '기기 검색 중',
  connecting: '연결 중',
  connected: '연결됨',
  ready: '연동 완료',
};

/** 연동 단계 한 건 */
export interface ConnectionStepItem {
  step: number;
  title: string;
  description: string;
  /** 이 단계에 해당하는 status (여러 개 가능) */
  statuses: ConnectionStatus[];
}

/** 연동 단계 목록 (1~5). 현재 status로 활성 단계 판별용 */
export const CONNECTION_STEPS: ConnectionStepItem[] = [
  {
    step: 1,
    title: '초기화 및 검색',
    description: 'SDK를 초기화한 뒤 기기 검색을 시작하세요.',
    statuses: ['disconnected'],
  },
  {
    step: 2,
    title: '기기 선택',
    description: '목록에서 연결할 HBand 기기를 탭하세요.',
    statuses: ['scanning'],
  },
  {
    step: 3,
    title: '비밀번호 입력',
    description: '기기 비밀번호(4자)를 입력하고 확인하세요.',
    statuses: ['connecting'],
  },
  {
    step: 4,
    title: '개인정보 동기화',
    description: '키, 몸무게, 목표 걸음 등을 기기와 맞춥니다.',
    statuses: ['connected'],
  },
  {
    step: 5,
    title: '연동 완료',
    description: '데이터 탭에서 걸음수 등을 동기화할 수 있습니다.',
    statuses: ['ready'],
  },
];

const TOTAL_STEPS = CONNECTION_STEPS.length;

/** 현재 연결 상태에 해당하는 단계 번호(1-based) */
export function getConnectionStepIndex(status: ConnectionStatus): number {
  const idx = CONNECTION_STEPS.findIndex((s) => s.statuses.includes(status));
  return idx >= 0 ? idx + 1 : 1;
}

export { TOTAL_STEPS as CONNECTION_TOTAL_STEPS };
