import { RestaurantReviewsList } from '@/components/reviews';
import { RestaurantReview } from '@/types';
import { generateMapLinks } from '@/lib/map-utils';

// Sample restaurant data for demonstration
const sampleReviews: RestaurantReview[] = [
  {
    id: 'sample-korean-restaurant',
    name: '할머니 손맛 김치찌개',
    location: {
      address: '서울시 강남구 테헤란로 123',
      coordinates: {
        lat: 37.5665,
        lng: 126.978,
      },
      region: '강남구',
    },
    rating: 4,
    visitDate: '2024-01-15',
    cuisine: 'korean',
    priceRange: 2,
    tags: ['김치찌개', '한식', '맛집', '점심', '가성비'],
    mapLinks: {
      naver: '',
      kakao: '',
      google: '',
    },
    images: [
      {
        src: '/images/reviews/sample-korean-1.jpg',
        alt: '김치찌개 사진',
      },
      {
        src: '/images/reviews/sample-korean-2.jpg',
        alt: '반찬 사진',
      },
    ],
    review:
      '강남역 근처에 위치한 이 작은 한식당은 정말 숨은 보석 같은 곳입니다. 특히 김치찌개가 일품이에요!',
  },
  {
    id: 'sample-japanese-restaurant',
    name: '스시 마스터',
    location: {
      address: '서울시 서초구 서초대로 456',
      coordinates: {
        lat: 37.4979,
        lng: 127.0276,
      },
      region: '서초구',
    },
    rating: 5,
    visitDate: '2024-02-20',
    cuisine: 'japanese',
    priceRange: 4,
    tags: ['스시', '일식', '고급', '오마카세', '신선한 회'],
    mapLinks: {
      naver: '',
      kakao: '',
      google: '',
    },
    images: [
      {
        src: '/images/reviews/sample-japanese-1.jpg',
        alt: '오마카세 스시 세트',
      },
      {
        src: '/images/reviews/sample-japanese-2.jpg',
        alt: '참치 사시미',
      },
      {
        src: '/images/reviews/sample-japanese-3.jpg',
        alt: '레스토랑 내부',
      },
    ],
    review:
      '서초동에 위치한 고급 일식당으로, 정통 오마카세를 경험할 수 있는 곳입니다.',
  },
];

// Generate map links for sample data
const reviewsWithMapLinks = sampleReviews.map(review => ({
  ...review,
  mapLinks: generateMapLinks(review),
}));

export default function ReviewsPage() {
  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='max-w-7xl mx-auto'>
        {/* Page Header */}
        <div className='text-center mb-12'>
          <h1 className='text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4'>
            음식점 리뷰
          </h1>
          <p className='text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto'>
            방문한 음식점들의 솔직한 리뷰와 위치 정보를 확인해보세요. 지도에서
            위치를 확인하고 네비게이션 앱으로 바로 이동할 수 있습니다.
          </p>
        </div>

        {/* Restaurant Reviews List with Map Integration */}
        <RestaurantReviewsList
          reviews={reviewsWithMapLinks}
          className='mb-12'
        />

        {/* Additional Information */}
        <div className='bg-blue-50 dark:bg-blue-950 rounded-lg p-6 mt-8'>
          <h2 className='text-xl font-semibold text-blue-900 dark:text-blue-100 mb-3'>
            지도 기능 안내
          </h2>
          <div className='text-blue-800 dark:text-blue-200 space-y-2'>
            <p>
              • <strong>목록/지도 전환:</strong> 상단의 버튼으로 목록 보기와
              지도 보기를 전환할 수 있습니다.
            </p>
            <p>
              • <strong>지도에서 음식점 선택:</strong> 지도의 마커를 클릭하여
              해당 음식점의 상세 정보를 확인할 수 있습니다.
            </p>
            <p>
              • <strong>외부 지도 앱:</strong> 네이버맵, 카카오맵, 구글맵 링크를
              통해 더 자세한 정보를 확인할 수 있습니다.
            </p>
            <p>
              • <strong>내비게이션:</strong> 모바일에서는 내비게이션 앱으로 바로
              연결됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
