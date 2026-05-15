import React, { useState, useEffect } from 'react';
import Pagination from '../Shared/Pagination';
import AdminConfirmModal from './AdminConfirmModal';
import AdminButton from './Shared/AdminButton';
import AdminLoadingBlock from './AdminLoadingBlock';
import AdminActionBtn from './Shared/AdminActionBtn';

const AdminTable = ({ 
  columns, 
  data, 
  onEdit, 
  onDelete, 
  title, 
  onCreate, 
  itemsPerPage = 10, 
  loading = false, 
  deletingId = null, 
  deleteConfirmTitle = 'Xác nhận Xóa', 
  deleteConfirmMessage = 'Bạn có chắc chắn muốn xóa mục này? Hành động này không thể hoàn tác.',
  filters = null,
  serverSidePagination = false,
  totalItems = 0,
  totalPages: serverTotalPages = 1,
  currentPage: serverCurrentPage = 1,
  onPageChange: serverOnPageChange = null,
  customActions = null,
  onRowClick = null
}) => {
  const [localCurrentPage, setLocalCurrentPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const isServer = serverSidePagination;

  // Pagination Logic
  const totalPages = isServer ? serverTotalPages : Math.ceil(data.length / itemsPerPage);
  const currentPage = isServer ? serverCurrentPage : localCurrentPage;
  const safePage = Math.min(currentPage, Math.max(1, totalPages));
  
  const startIndex = (safePage - 1) * itemsPerPage;
  const paginatedData = isServer 
    ? data 
    : (Array.isArray(data) ? data.slice(startIndex, startIndex + itemsPerPage) : []);

  const handlePageChange = (page) => {
    if (isServer && serverOnPageChange) {
      serverOnPageChange(page);
    } else {
      setLocalCurrentPage(page);
    }
  };

  return (
    <div className="admin-paper fade-in" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
      <div className="admin-paper-header">
        <h4>{title}</h4>
        {onCreate && (
          <AdminButton variant="primary" icon="plus" label="Thêm Mới" onClick={onCreate} />
        )}
      </div>

      {filters && (
        <div className="admin-table-filters px-4 pt-3 pb-2 border-bottom">
          {filters}
        </div>
      )}

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
                    <tr 
                      key={row.id} 
                      onClick={onRowClick ? () => onRowClick(row) : undefined}
                      style={onRowClick ? { cursor: 'pointer' } : undefined}
                    >
                      {columns.map(col => (
                        <td key={col.key || col.label}>
                          {col.render ? col.render(row) : row[col.key]}
                        </td>
                      ))}
                      <td className="text-center">
                        <div className="d-flex justify-content-center" style={{ gap: '4px' }}>
                          {customActions ? customActions(row) : (
                            <>
                              {onEdit && (
                                <AdminActionBtn 
                                  variant="edit" 
                                  onClick={() => onEdit(row)} 
                                  title="Sửa" 
                                  disabled={deletingId === row.id} 
                                />
                              )}
                              {onDelete && (
                                <AdminActionBtn 
                                  variant="delete" 
                                  onClick={() => setDeleteTarget(row)} 
                                  title="Xóa" 
                                  disabled={deletingId === row.id}
                                  loading={deletingId === row.id} 
                                />
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {(totalPages > 1 || (isServer && totalItems > 0)) && (
            <div className="admin-pagination-wrapper pt-4 pb-2" style={{ borderTop: '1px solid var(--admin-border-subtle)' }}>
              <Pagination 
                currentPage={safePage} 
                totalPages={totalPages} 
                onPageChange={handlePageChange} 
              />
            </div>
          )}
        </>
      )}

      <AdminConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => onDelete(deleteTarget.id)}
        title={deleteConfirmTitle}
        message={deleteConfirmMessage}
        loading={deletingId === deleteTarget?.id}
        confirmLabel="Xóa"
        cancelLabel="Hủy"
      />
    </div>
  );
};

export default AdminTable;
