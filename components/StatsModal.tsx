"use client";

import React from 'react';
import styles from './StatsModal.module.css';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  pokemonData: {
    nickname: string;
    species: string;
    level: number;
    type1: string;
    type2?: string;
    ability: string;
    nature: string;
    stats: {
      hp: number;
      attack: number;
      defense: number;
      spAttack: number;
      spDefense: number;
      speed: number;
    };
  } | null;
}

const StatsModal: React.FC<StatsModalProps> = ({ isOpen, onClose, pokemonData }) => {
  if (!isOpen || !pokemonData) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Pokémon Details</h2>
        <p><strong>Nickname:</strong> {pokemonData.nickname}</p>
        <p><strong>Species:</strong> {pokemonData.species}</p>
        <p><strong>Level:</strong> {pokemonData.level}</p>
        <p><strong>Type:</strong> {pokemonData.type1} {pokemonData.type2 && `/ ${pokemonData.type2}`}</p>
        <p><strong>Ability:</strong> {pokemonData.ability}</p>
        <p><strong>Nature:</strong> {pokemonData.nature}</p>
        <h3>Stats</h3>
        <p><strong>HP:</strong> {pokemonData.stats.hp}</p>
        <p><strong>Attack:</strong> {pokemonData.stats.attack}</p>
        <p><strong>Defense:</strong> {pokemonData.stats.defense}</p>
        <p><strong>Sp. Attack:</strong> {pokemonData.stats.spAttack}</p>
        <p><strong>Sp. Defense:</strong> {pokemonData.stats.spDefense}</p>
        <p><strong>Speed:</strong> {pokemonData.stats.speed}</p>
        <button className={styles.closeButton} onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default StatsModal;
