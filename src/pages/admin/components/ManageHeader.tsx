import React from 'react';
import { Link } from 'react-router-dom';
import { PREFIX } from '@/config/constants';

const ManageHeader: React.FC = () => {
  return (
    <header className="manage-header">
      <div className="container">
        <div className="manage-header-content">
          <Link to={`${PREFIX}/`} className="btn-back">
            ← 블로그로 돌아가기
          </Link>
          <h1>블로그 관리</h1>
        </div>
      </div>
    </header>
  );
};

export { ManageHeader };
