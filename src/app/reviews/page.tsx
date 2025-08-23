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
            방문한 음식점들의 솔직한 리뷰와 위치 정보를 확인해보세요.
          </p>
        </div>

        {/* Sample Reviews */}
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          <article className='bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden'>
            <div className='p-6'>
              <h2 className='text-xl font-semibold mb-2'>할머니 손맛 김치찌개</h2>
              <p className='text-gray-600 dark:text-gray-400 mb-4'>
                강남역 근처에 위치한 이 작은 한식당은 정말 숨은 보석 같은 곳입니다.
              </p>
              <div className='flex items-center justify-between text-sm text-gray-500 dark:text-gray-400'>
                <span>⭐⭐⭐⭐ 4/5</span>
                <span>2024-01-15</span>
              </div>
            </div>
          </article>

          <article className='bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden'>
            <div className='p-6'>
              <h2 className='text-xl font-semibold mb-2'>스시 마스터</h2>
              <p className='text-gray-600 dark:text-gray-400 mb-4'>
                서초동에 위치한 고급 일식당으로, 정통 오마카세를 경험할 수 있는 곳입니다.
              </p>
              <div className='flex items-center justify-between text-sm text-gray-500 dark:text-gray-400'>
                <span>⭐⭐⭐⭐⭐ 5/5</span>
                <span>2024-02-20</span>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
