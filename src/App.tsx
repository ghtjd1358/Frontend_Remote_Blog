import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { BlogList, PostDetail, PostEditor } from './pages';
import './global.css';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<BlogList />} />
      <Route path="/post/:slug" element={<PostDetail />} />
      <Route path="/write" element={<PostEditor />} />
      <Route path="/edit/:slug" element={<PostEditor />} />
    </Routes>
  );
};

export default App;
