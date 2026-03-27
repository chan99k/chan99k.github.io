-- Loss Adjuster interview question seed data
-- Categories: loss-adjuster-law, loss-adjuster-claim, loss-adjuster-medical

INSERT INTO interview_questions (title, question, category, difficulty, tags, source)
VALUES
  (
    '고지의무 위반 효과',
    '보험계약법상 고지의무 위반 시 보험자의 권리와 그 행사 요건을 설명하시오.',
    'loss-adjuster-law', 2,
    ARRAY['보험계약법', '고지의무', '계약 해지'],
    'curated'
  ),
  (
    '손해사정사의 법적 의무',
    '손해사정사의 법적 의무와 금지행위를 보험업법 조문을 근거로 설명하시오.',
    'loss-adjuster-law', 2,
    ARRAY['보험업법', '손해사정사', '금지행위'],
    'curated'
  ),
  (
    '보험금 지급 기한과 지연이자',
    '보험업법상 보험금 지급 기한 및 지연이자 규정을 설명하고, 손해사정 완료 후 지급 절차를 서술하시오.',
    'loss-adjuster-law', 3,
    ARRAY['보험업법', '보험금 지급', '지연이자'],
    'curated'
  ),
  (
    '보험계약의 면책사유',
    '상법 보험편에서 규정하는 주요 면책사유를 유형별로 분류하고 각각의 법적 효과를 설명하시오.',
    'loss-adjuster-law', 3,
    ARRAY['상법', '면책사유', '보험금 청구'],
    'curated'
  ),
  (
    '과실 비율 산정 기준',
    '교통사고 과실 비율 산정 시 적용되는 기준과 원칙을 설명하고, 주요 판례 경향을 서술하시오.',
    'loss-adjuster-claim', 3,
    ARRAY['과실 비율', '교통사고', '손해배상'],
    'curated'
  ),
  (
    '대물 손해액 산정',
    '자동차 대물사고 시 손해액 산정 방법(수리비, 시가, 대차료 등)을 설명하시오.',
    'loss-adjuster-claim', 2,
    ARRAY['대물 손해', '손해액 산정', '수리비'],
    'curated'
  ),
  (
    '대인 손해배상 항목',
    '교통사고 대인배상에서 적극적 손해, 소극적 손해, 위자료의 구분과 각 항목의 산정 방법을 설명하시오.',
    'loss-adjuster-claim', 3,
    ARRAY['대인배상', '적극적 손해', '소극적 손해', '위자료'],
    'curated'
  ),
  (
    '후유장해 등급 판정',
    '맥브라이드 장해평가법의 기본 원리와 노동능력상실률 산정 방법을 설명하시오.',
    'loss-adjuster-medical', 3,
    ARRAY['의학이론', '후유장해', 'McBride'],
    'curated'
  ),
  (
    '경추부 손상의 분류와 후유증',
    '경추부 손상의 유형(염좌, 추간판 탈출, 골절)별 특징과 예상되는 후유장해를 설명하시오.',
    'loss-adjuster-medical', 3,
    ARRAY['의학이론', '경추', '후유장해'],
    'curated'
  ),
  (
    '노동능력상실률과 가동연한',
    '노동능력상실률 산정 시 고려사항과 가동연한 판단 기준을 판례를 근거로 설명하시오.',
    'loss-adjuster-medical', 4,
    ARRAY['노동능력상실률', '가동연한', '판례'],
    'curated'
  );
