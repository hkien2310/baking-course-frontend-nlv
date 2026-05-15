import React, { useState, useEffect } from 'react';
import { getAdminQuestions, answerQuestion, getPrograms } from '../../services/api';
import { toast } from 'react-toastify';
import AdminLoadingBlock from './AdminLoadingBlock';
import AdminButton from './Shared/AdminButton';
import AdminTable from './AdminTable';

const AdminQnA = () => {
  const [questions, setQuestions] = useState([]);
  const [programsList, setProgramsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Filters
  const [filterProgram, setFilterProgram] = useState('');
  const [filterStatus, setFilterStatus] = useState('PENDING'); // Default is PENDING

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // Modal State
  const [selectedQA, setSelectedQA] = useState(null);
  const [replyText, setReplyText] = useState('');

  // Initial fetch for programs list
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const progData = await getPrograms();
        setProgramsList(progData.programs || progData);
      } catch (err) {
        console.error("Lỗi lấy danh sách khoá học", err);
      }
    };
    fetchPrograms();
  }, []);

  useEffect(() => {
    fetchData();
  }, [currentPage, filterProgram, filterStatus]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const qaData = await getAdminQuestions({
        page: currentPage,
        limit: itemsPerPage,
        programId: filterProgram || undefined,
        status: filterStatus
      });
      setQuestions(qaData.data || []);
      setTotalPages(qaData.pagination?.totalPages || 1);
      setTotalItems(qaData.pagination?.total || 0);
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi tải danh sách Hỏi Đáp');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (qa) => {
    setSelectedQA(qa);
    setReplyText(qa.answer || '');
  };

  const handleCloseModal = () => {
    setSelectedQA(null);
    setReplyText('');
  };

  const handleAnswer = async () => {
    if (!selectedQA) return;
    if (!replyText || !replyText.trim()) {
      toast.warning('Vui lòng nhập câu trả lời!');
      return;
    }

    setSubmitting(true);
    try {
      await answerQuestion(selectedQA.id, replyText);
      toast.success('Đã lưu câu trả lời!');
      fetchData(); // Refetch to get updated status and answer
      handleCloseModal();
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi trả lời');
    } finally {
      setSubmitting(false);
    }
  };

  const displayStatus = (status) => {
    switch(status) {
      case 'PENDING': return 'Chưa trả lời';
      case 'ANSWERED': return 'Đã trả lời';
      default: return status;
    }
  };

  const textClampStyle = {
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxHeight: '4.5em',
    lineHeight: '1.5'
  };

  const columns = [
    { label: 'Học Viên', render: qa => <div style={{ fontWeight: '500' }}>{qa.user?.fullName}</div> },
    { label: 'Thời Gian', render: qa => (
      <div>
        <div style={{ color: '#88929e' }}>{new Date(qa.createdAt).toLocaleDateString('vi-VN')}</div>
        <small style={{ color: '#aaa' }}>{new Date(qa.createdAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</small>
      </div>
    )},
    { label: 'Khoá Học', render: qa => (
      <div style={{ fontWeight: '500' }}>
        <i className="fa fa-book mr-1 text-muted"></i>{qa.program?.title}
      </div>
    )},
    { label: 'Câu Hỏi', render: qa => (
      <div style={{ ...textClampStyle, color: 'var(--admin-text)' }} title={qa.question}>
        {qa.question}
      </div>
    )},
    { label: 'Câu Trả Lời', render: qa => (
      <div title={qa.answer}>
        {qa.answer ? (
          <div style={{ ...textClampStyle, color: 'var(--admin-text)', opacity: 0.9 }}>
            {qa.answer}
          </div>
        ) : (
          <span style={{ color: '#aaa', fontStyle: 'italic' }}>Chưa trả lời</span>
        )}
      </div>
    )},
    { label: 'Trạng Thái', render: qa => (
      qa.status === 'ANSWERED' ? (
        <span className="badge bg-success text-white" style={{ padding: '5px 8px', fontWeight: 'normal' }}>
          Đã trả lời
        </span>
      ) : (
        <span className="badge bg-warning text-dark" style={{ padding: '5px 8px', fontWeight: 'normal' }}>
          Chờ xử lý
        </span>
      )
    )}
  ];

  const customActions = (qa) => (
    <AdminButton 
      variant={qa.status === 'ANSWERED' ? 'secondary' : 'success'}
      outline={qa.status === 'ANSWERED'}
      onClick={() => handleOpenModal(qa)}
      label={qa.status === 'ANSWERED' ? 'Cập nhật' : 'Trả lời'}
      size="sm"
      icon={qa.status === 'ANSWERED' ? 'pencil' : 'reply'}
    />
  );

  const filterNodes = (
    <div className="d-flex align-items-center" style={{ gap: '15px', flexWrap: 'wrap' }}>
      <select 
        className="form-control" 
        style={{ minWidth: '200px', maxWidth: '300px', backgroundColor: 'var(--admin-bg)', color: 'var(--admin-text)', border: '1px solid #ced4da', borderRadius: '6px' }}
        value={filterProgram}
        onChange={(e) => {
          setFilterProgram(e.target.value);
          setCurrentPage(1); // Reset page on filter
        }}
      >
        <option value="">-- Tất cả khoá học --</option>
        {programsList.map(p => (
          <option key={p.id} value={p.id}>{p.title}</option>
        ))}
      </select>

      <div className="d-flex" style={{ gap: '8px', flexWrap: 'wrap' }}>
        {['ALL', 'PENDING', 'ANSWERED'].map((key) => (
          <AdminButton
            key={key}
            variant={filterStatus === key ? 'dark' : 'secondary'}
            outline={filterStatus !== key}
            size="sm"
            onClick={() => {
              setFilterStatus(key);
              setCurrentPage(1); // Reset page on filter
            }}
            style={{ borderRadius: '20px', padding: '6px 16px' }}
            label={key === 'ALL' ? 'Tất cả trạng thái' : displayStatus(key)}
          />
        ))}
      </div>
      
      <span className="ml-auto text-muted" style={{ fontSize: '13px' }}>
        Tổng cộng: <strong>{totalItems}</strong> câu hỏi
      </span>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <AdminTable 
        title="Quản Lý Hỏi Đáp (Q&A)"
        columns={columns}
        data={questions}
        loading={loading}
        filters={filterNodes}
        customActions={customActions}
        serverSidePagination={true}
        totalItems={totalItems}
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={(p) => setCurrentPage(p)}
      />

      {/* Reply Modal */}
      {selectedQA && (
        <div className="admin-modal-overlay" onClick={handleCloseModal}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '650px', padding: 0, overflow: 'hidden' }}>
            <div className="admin-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--admin-border-subtle)', backgroundColor: 'var(--admin-bg)' }}>
              <h5 style={{ margin: 0, fontFamily: 'inherit', fontWeight: '600', fontSize: '18px', color: 'var(--admin-text)' }}>
                {selectedQA.status === 'ANSWERED' ? 'Cập nhật câu trả lời' : 'Trả lời học viên'}
              </h5>
              <button 
                onClick={handleCloseModal} 
                className="admin-modal-close-icon-only"
                style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', fontSize: '20px', color: 'var(--admin-text)', opacity: 0.5 }}
              >
                <i className="fa fa-times"></i>
              </button>
            </div>
            
            <div className="admin-modal-body" style={{ padding: '24px' }}>
              <div className="mb-4 p-3" style={{ backgroundColor: 'var(--admin-bg-secondary)', borderRadius: '12px', border: '1px solid var(--admin-border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--admin-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--admin-text)', fontWeight: 'bold' }}>
                      {selectedQA.user?.fullName?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <strong style={{ fontSize: '14px', display: 'block', color: 'var(--admin-text)' }}>{selectedQA.user?.fullName}</strong>
                      <small style={{ color: '#88929e' }}>{selectedQA.user?.email}</small>
                    </div>
                  </div>
                  <small style={{ color: '#88929e', whiteSpace: 'nowrap' }}>
                    {new Date(selectedQA.createdAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})} - {new Date(selectedQA.createdAt).toLocaleDateString('vi-VN')}
                  </small>
                </div>
                
                <div style={{ fontSize: '12px', color: '#88929e', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px dashed var(--admin-border-subtle)' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', marginRight: '15px' }}><i className="fa fa-book mr-1"></i>{selectedQA.program?.title}</span>
                  {selectedQA.lessonTitle && <span style={{ display: 'inline-flex', alignItems: 'center' }}><i className="fa fa-play-circle mr-1"></i>{selectedQA.lessonTitle}</span>}
                </div>
                
                <div style={{ fontSize: '15px', lineHeight: '1.6', color: 'var(--admin-text)' }}>
                  {selectedQA.question}
                </div>
              </div>

              <div className="form-group mb-0">
                <label style={{ fontWeight: '600', marginBottom: '10px', display: 'flex', alignItems: 'center', color: 'var(--admin-text)' }}>
                  <i className="fa fa-reply mr-2" style={{ color: '#c19a5b' }}></i>
                  Nội dung trả lời
                </label>
                <textarea
                  className="form-control"
                  style={{ 
                    minHeight: '160px', 
                    backgroundColor: 'var(--admin-bg)', 
                    color: 'var(--admin-text)', 
                    border: '1px solid var(--admin-border)', 
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                  placeholder="Nhập câu trả lời của bạn ở đây..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            <div className="admin-modal-footer d-flex justify-content-end" style={{ padding: '16px 24px', backgroundColor: 'var(--admin-bg-secondary)', borderTop: '1px solid var(--admin-border-subtle)', gap: '10px' }}>
              <AdminButton 
                variant="secondary" 
                outline 
                onClick={handleCloseModal} 
                label="Hủy thao tác" 
                disabled={submitting} 
              />
              <AdminButton 
                variant="success" 
                onClick={handleAnswer} 
                label={selectedQA.status === 'ANSWERED' ? 'Cập nhật' : 'Gửi câu trả lời'} 
                icon="paper-plane"
                loading={submitting}
                disabled={submitting} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQnA;
