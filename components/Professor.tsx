import React from 'react';
import styles from './Professor.module.css';

const Professor = () => {
  return (
    <div className={styles.professorContainer}>
      <img src="/professor.png" alt="Professor" className={styles.professorImage} />
    </div>
  );
};

export default Professor;
