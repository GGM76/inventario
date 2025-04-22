// src/pages/EditProjectProducts.jsx
import React from 'react';
import { useParams } from 'react-router-dom';
import AddProject from './AddProject';

const EditProjectProducts = () => {
  const { projectId } = useParams();

  return <AddProject editProjectId={projectId} />;
};

export default EditProjectProducts;
