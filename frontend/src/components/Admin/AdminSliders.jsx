import React, { useState, useEffect } from 'react';
import { getPrograms, toggleProgramFeature } from '../../services/api';
import { toast } from 'react-toastify';
import AdminLoadingBlock from './AdminLoadingBlock';

const AdminSliders = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      // We pass limit=100 to get a good chunk of programs for the admin to select from
      const data = await getPrograms({ page: 1, limit: 100 });
      setPrograms(data.data || []);
    } catch (err) {
      toast.error('Failed to load programs for slider management');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleToggle = async (id, currentStatus) => {
    try {
      await toggleProgramFeature(id, !currentStatus);
      toast.success(`Program ${!currentStatus ? 'added to' : 'removed from'} Hero Slider`);
      fetchData();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const featuredPrograms = programs.filter(p => p.isFeatured);
  const unfeaturedPrograms = programs.filter(p => !p.isFeatured);
  const limitReached = featuredPrograms.length >= 3;

  const isUpComing = (program) => {
    if (!program || !program.classSessions || program.classSessions.length === 0) return false;
    return program.classSessions.some(cs => cs.startDate && new Date(cs.startDate) > new Date());
  };

  return (
    <div className="admin-paper fade-in">
      <div className="admin-paper-header">
        <div>
          <h4>Hero Slider Manager</h4>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
            Select which programs to feature on the homepage hero slider.
          </p>
        </div>
        <a href="#programs" className="btn btn-outline-secondary btn-sm">
          <i className="fa fa-book mr-2"></i> Manage Content
        </a>
      </div>

      <div className="row" style={{ marginTop: '20px' }}>
        <div className="col-12 mb-4">
          <h5><i className="fa fa-star text-warning mr-2"></i> Currently Featured ({featuredPrograms.length})</h5>
          <div className="row mt-3">
            {featuredPrograms.length === 0 && <p className="col-12 text-muted">No programs are currently featured on the slider.</p>}
            {featuredPrograms.map(prog => (
              <div key={prog.id} className="col-md-4 col-sm-6 mb-4">
                <div className="card shadow-sm h-100" style={{ border: '2px solid #2ecc71' }}>
                  <img src={prog.thumbnail || `${import.meta.env.BASE_URL}images/gallery/01.jpg`} className="card-img-top" alt={prog.title} style={{ height: '180px', objectFit: 'cover' }} />
                  <div className="card-body">
                    <h6 className="card-title">{prog.title}</h6>
                    <p className="small text-muted mb-1">{prog.authorName || 'No instructor'}</p>
                    {!isUpComing(prog) && <span className="badge badge-warning mb-2">Started/No Date</span>}
                    <button 
                      className="btn btn-danger btn-sm w-100 mt-2" 
                      onClick={() => handleToggle(prog.id, true)}
                    >
                      Remove from Slider
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-12">
          <hr />
          <h5 className="mt-4"><i className="fa fa-list mr-2"></i> Available Programs</h5>
          <div className="row mt-3">
            {loading && (
              <div className="col-12">
                <AdminLoadingBlock compact rows={4} />
              </div>
            )}
            {!loading && unfeaturedPrograms.length === 0 && <p className="col-12 text-muted">All loaded programs are already featured.</p>}
            {!loading && limitReached && <div className="col-12 alert alert-warning">You have reached the maximum limit of 3 featured programs. Please remove one before adding another.</div>}
            
            {!loading && unfeaturedPrograms.map(prog => {
              const eligible = isUpComing(prog);
              return (
                <div key={prog.id} className="col-md-3 col-sm-6 mb-4">
                  <div className={`card shadow-sm h-100 ${!eligible ? 'opacity-50' : ''}`}>
                    <img src={prog.thumbnail || `${import.meta.env.BASE_URL}images/gallery/01.jpg`} className="card-img-top" alt={prog.title} style={{ height: '140px', objectFit: 'cover' }} />
                    <div className="card-body p-3">
                      <h6 className="card-title" style={{ fontSize: '14px', marginBottom: '5px' }}>{prog.title}</h6>
                      {!eligible && <small className="text-danger d-block mb-1">Has started or lacks date</small>}
                      <button 
                        className="btn btn-outline-success btn-sm w-100 mt-2 text-uppercase" 
                        style={{ fontSize: '12px' }}
                        onClick={() => handleToggle(prog.id, false)}
                        disabled={!eligible || limitReached}
                      >
                        Add to Slider
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSliders;
