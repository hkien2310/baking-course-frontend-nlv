import React, { useEffect, useState } from 'react';
import { useInitOnLoaded } from '../hooks/useInitOnLoaded';
import PageTitle from '../components/Shared/PageTitle';
import { getApprovedStudentWorks } from '../services/api';
import { ROUTES } from '../constants/routes';
import { Link } from 'react-router-dom';
import { imageUrl } from '../utils/imageUrl';
import Pagination from '../components/Shared/Pagination';

const StudentWork = () => {
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    getApprovedStudentWorks(page, 9)
      .then(res => {
        const worksData = res.data || res || [];
        setWorks(Array.isArray(worksData) ? worksData : []);
        setTotalPages(res.totalPages || 1);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [page]);

  useInitOnLoaded(loading);

  const imgSrc = (src) => imageUrl(src, `${import.meta.env.BASE_URL}images/gallery/09.jpg`);

  return (
    <>
      <PageTitle
        title="Sản Phẩm Của Học Viên"
        breadcrumbs={[
          { label: 'Trang Chủ', link: '/' },
          { label: 'Sản Phẩm Của Học Viên' }
        ]}
      />

      <section className="ls s-pt-60 s-pb-75 s-pt-lg-50 s-pb-lg-100 container-px-0">
        <div className="container">
          <div className="row">
            <div className="d-none d-lg-block divider-65"></div>

            <div className="col-lg-12">


              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border" role="status"></div>
                  <p className="mt-2">Đang tải sản phẩm...</p>
                </div>
              ) : works.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fa fa-image" style={{ fontSize: '60px', color: '#ddd' }}></i>
                  <h4 className="mt-3" style={{ color: '#aaa' }}>Chưa có sản phẩm nào</h4>
                  <p className="text-muted">Các sản phẩm của học viên sẽ được hiển thị ở đây sau khi được duyệt.</p>
                </div>
              ) : (
                <div className="row c-mb-30">
                  {works.map(work => (
                    <div key={work.id} className="col-xl-4 col-sm-6">
                      <div className="vertical-item text-center bordered">
                        <div className="item-media">
                          <img src={imgSrc(work.imageUrl)} alt={work.studentName} style={{ width: '100%', height: '280px', objectFit: 'cover' }} />
                        </div>
                        <div className="item-content" style={{ padding: '20px' }}>
                          <div className="small-text tag color-main">
                            {work.program?.title || 'Khóa học'}
                          </div>
                          <h5 style={{ marginTop: '8px' }}>{work.studentName}</h5>
                          <p style={{ 
                            color: '#666', 
                            fontSize: '14px', 
                            display: '-webkit-box', 
                            WebkitLineClamp: 2, 
                            WebkitBoxOrient: 'vertical', 
                            overflow: 'hidden', 
                            minHeight: '42px',
                            marginBottom: '10px'
                          }}>
                            {work.description}
                          </p>
                          <small className="text-muted">
                            <i className="fa fa-calendar mr-1"></i>
                            {new Date(work.createdAt).toLocaleDateString('vi-VN')}
                          </small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <div className="row mt-5">
                  <div className="col-12 text-center">
                    <Pagination 
                      currentPage={page} 
                      totalPages={totalPages} 
                      onPageChange={(p) => setPage(p)} 
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default StudentWork;
