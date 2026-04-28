import React, { useState, useEffect } from 'react';
import Pagination from '../Shared/Pagination';
import AdminConfirmModal from './AdminConfirmModal';
import AdminButton from './Shared/AdminButton';
import AdminLoadingBlock from './AdminLoadingBlock';

const AdminTable = ({ columns, data, onEdit, onDelete, title, onCreate, itemsPerPage = 10, loading = false }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const safePage = Math.min(currentPage, Math.max(1, totalPages));
  
  const startIndex = (safePage - 1) * itemsPerPage;
  const paginatedData = Array.isArray(data) ? data.slice(startIndex, startIndex + itemsPerPage) : [];

  return (
    <div className="admin-paper fade-in">
      <div className="admin-paper-header">
        <h4>{title}</h4>
        {onCreate && (
          <AdminButton variant="primary" icon="plus" label="Thêm Mới" onClick={onCreate} />
        )}
      </div>

      {loading ? (
        <AdminLoadingBlock compact />
      ) : (
        <>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  {columns.map(col => (
                    <th key={col.key || col.label}>{col.label}</th>
                  ))}
                  <th width="150" className="text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + 1} className="text-center py-4" style={{color: '#888'}}>
                      <i>Chưa có dữ liệu.</i>
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((row) => (
                    <tr key={row.id}>
                      {columns.map(col => (
                        <td key={col.key || col.label}>
                          {col.render ? col.render(row) : row[col.key]}
                        </td>
                      ))}
                      <td className="text-center">
                        <button onClick={() => onEdit(row)} className="admin-btn-icon edit" title="Sửa">
                          <i className="fa fa-pencil"></i>
                        </button>
                        <button onClick={() => setDeleteTarget(row)} className="admin-btn-icon delete" title="Xóa">
                          <i className="fa fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="admin-pagination-wrapper pt-4 pb-2" style={{ borderTop: '1px solid var(--admin-border-subtle)' }}>
            <Pagination 
              currentPage={safePage} 
              totalPages={totalPages} 
              onPageChange={(page) => setCurrentPage(page)} 
            />
          </div>
        </>
      )}

      <AdminConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => { onDelete(deleteTarget.id); setDeleteTarget(null); }}
        title="Xác nhận Xóa"
        message={`Bạn có chắc chắn muốn xóa mục này? Hành động này không thể hoàn tác.`}
      />
    </div>
  );
};

export default AdminTable;
