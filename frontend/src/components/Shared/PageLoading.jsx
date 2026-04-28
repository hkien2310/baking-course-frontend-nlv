import React from 'react';

const PageLoading = ({ compact = false }) => {
  const padding = compact ? '100px 0' : '150px 0';

  return (
    <section className="ls" style={{ padding }} aria-busy="true" aria-live="polite">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="page-loading-shell">
              <div className="page-loading-header">
                <span className="page-loading-line page-loading-line-sm"></span>
                <span className="page-loading-line page-loading-line-lg"></span>
              </div>
              <div className="page-loading-body">
                <span className="page-loading-block"></span>
                <span className="page-loading-block"></span>
                <span className="page-loading-block page-loading-block-short"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PageLoading;
