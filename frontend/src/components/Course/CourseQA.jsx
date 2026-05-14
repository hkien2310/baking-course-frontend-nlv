import React, { useState, useEffect } from 'react';
import { getMyQuestions, submitQuestion, getAdminQuestions, answerQuestion } from '../../services/api';
import { toast } from 'react-toastify';

const CourseQA = ({ programId, currentLessonTitle, isAdmin }) => {
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [replyText, setReplyText] = useState({});
  const [loading, setLoading] = useState(false);
  const [submittingReply, setSubmittingReply] = useState(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, [programId]);

  const fetchQuestions = async () => {
    try {
      const data = isAdmin ? await getAdminQuestions({ programId }) : await getMyQuestions(programId);
      setQuestions(isAdmin ? (data.data || data) : data);
    } catch (err) {
      console.error("Failed to fetch Q&A:", err);
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    setLoading(true);
    try {
      const newQA = await submitQuestion({
        programId,
        lessonTitle: currentLessonTitle,
        question: newQuestion
      });
      setQuestions([newQA, ...questions]);
      setNewQuestion('');
      toast.success("Đã gửi câu hỏi cho giảng viên!");
    } catch (error) {
      toast.error("Lỗi khi gửi câu hỏi!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleReplyChange = (id, text) => {
    setReplyText(prev => ({ ...prev, [id]: text }));
  };

  const handleAnswer = async (id) => {
    const text = replyText[id];
    if (!text || !text.trim()) {
      toast.warning('Vui lòng nhập câu trả lời!');
      return;
    }

    setSubmittingReply(id);
    try {
      const updatedQA = await answerQuestion(id, text);
      setQuestions(prev => prev.map(qa => qa.id === id ? { ...qa, answer: updatedQA.answer, status: 'ANSWERED' } : qa));
      toast.success('Đã gửi câu trả lời!');
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi trả lời');
    } finally {
      setSubmittingReply(null);
    }
  };

  return (
    <div className="course-qa-section mt-5 p-4" style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
      {/* QA Form */}
      <div className="qa-form mb-5">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <textarea 
              className="form-control" 
              rows="3" 
              placeholder={`Bạn có thắc mắc gì về bài học ${currentLessonTitle ? `"${currentLessonTitle}"` : 'này'} không?`}
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              style={{ borderRadius: '8px', border: '1px solid #eee', padding: '15px' }}
            ></textarea>
          </div>
          <button type="submit" className="btn btn-maincolor mt-3" disabled={loading || !newQuestion.trim()} style={{ borderRadius: '6px' }}>
            {loading ? <i className="fa fa-spinner fa-spin mr-2"></i> : <i className="fa fa-paper-plane mr-2"></i>}
            Gửi câu hỏi
          </button>
        </form>
      </div>

      {/* QA List */}
      <div className="qa-list">
        <h6 className="mb-4">{isAdmin ? `Toàn bộ câu hỏi (${questions.length})` : `Câu hỏi của bạn (${questions.length})`}</h6>
        {fetching ? (
          <p className="text-muted"><i className="fa fa-spinner fa-spin mr-2"></i>Đang tải...</p>
        ) : questions.length === 0 ? (
          <div className="alert alert-light border text-center p-4">
            <i className="fa fa-question-circle fa-2x mb-2 text-muted"></i>
            <p className="mb-0 text-muted">Bạn chưa có câu hỏi nào cho khoá học này.</p>
          </div>
        ) : (
          <div className="qa-items">
            {questions.map((qa) => (
              <div key={qa.id} className="qa-item mb-4 p-4" style={{ background: '#fff', borderRadius: '12px', border: '1px solid #edf2f7', borderLeft: qa.status === 'ANSWERED' ? '4px solid #00a651' : '4px solid #f2a654', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)' }}>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <span className={`badge ${qa.status === 'ANSWERED' ? 'badge-success' : 'badge-warning'} mb-2`} style={{ padding: '5px 10px', fontWeight: '500' }}>
                      {qa.status === 'ANSWERED' ? 'Đã trả lời' : 'Chờ trả lời'}
                    </span>
                    {qa.lessonTitle && <span className="badge badge-light ml-2 text-muted" style={{ padding: '5px 10px', border: '1px solid #eee' }}>Bài: {qa.lessonTitle}</span>}
                  </div>
                  <small className="text-muted" style={{ fontSize: '13px' }}>{new Date(qa.createdAt).toLocaleDateString('vi-VN')} {new Date(qa.createdAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</small>
                </div>
                
                <div className="mb-3" style={{ color: '#2d3e50', fontSize: '15px', lineHeight: '1.6', fontFamily: 'var(--font-family-sans-serif), sans-serif' }}>
                  {isAdmin && qa.user && <strong className="text-primary mr-2">[{qa.user.fullName}]:</strong>}
                  {qa.question}
                </div>
                
                {qa.answer ? (
                  <div className="qa-answer p-3" style={{ background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                    <div className="d-flex align-items-center mb-2 pb-2" style={{ borderBottom: '1px dashed #dee2e6' }}>
                      <div className="mr-2" style={{ width: '28px', height: '28px', background: '#c19a5b', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                        <i className="fa fa-graduation-cap"></i>
                      </div>
                      <span className="font-weight-bold" style={{ color: '#c19a5b', fontSize: '14px' }}>Giảng viên</span>
                    </div>
                    <p className="mb-0 text-dark" style={{ whiteSpace: 'pre-line', fontSize: '14.5px', lineHeight: '1.6' }}>{qa.answer}</p>
                    
                    {isAdmin && (
                      <div className="mt-3 border-top pt-3">
                        <textarea 
                          className="form-control mb-2" 
                          rows="2" 
                          defaultValue={qa.answer}
                          onChange={(e) => handleReplyChange(qa.id, e.target.value)}
                        ></textarea>
                        <button 
                          className="btn btn-sm btn-primary" 
                          onClick={() => handleAnswer(qa.id)}
                          disabled={submittingReply === qa.id}
                        >
                          Cập nhật lại
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  isAdmin && (
                    <div className="admin-reply-box p-3 bg-white border rounded">
                      <textarea 
                        className="form-control mb-2" 
                        rows="2" 
                        placeholder="Nhập câu trả lời..."
                        value={replyText[qa.id] || ''}
                        onChange={(e) => handleReplyChange(qa.id, e.target.value)}
                      ></textarea>
                      <button 
                        className="btn btn-sm btn-success" 
                        onClick={() => handleAnswer(qa.id)}
                        disabled={submittingReply === qa.id}
                      >
                        {submittingReply === qa.id ? <i className="fa fa-spin fa-spinner mr-1"></i> : <i className="fa fa-paper-plane mr-1"></i>}
                        Trả lời
                      </button>
                    </div>
                  )
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseQA;
