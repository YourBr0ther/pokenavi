"use client";

import React, { useState, useEffect } from 'react';
import Professor from '../../components/Professor';
import TextBox from '../../components/TextBox';
import MusicControl from '../../components/MusicControl';
import Overlay from '../../components/Overlay';
import FileUpload from '../../components/FileUpload';
import StatsModal from '../../components/StatsModal';
import { processPk3File } from '../../utils/processPk3File';
import { loadCharmap } from '../../utils/loadCharmap';

interface PlayerInfo {
  name: string;
  gender: string;
  pokemonName?: string;
  pokemonSpecies?: string;
}

export default function Home() {
  const [showOverlay, setShowOverlay] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [playerInfo, setPlayerInfo] = useState<PlayerInfo | null>(null);
  const [text, setText] = useState<string[]>([
    "Welcome to the wondrous world of Pokémon! My name is Professor Thorn, and I am the head researcher here at PokeCORE.",
    "Our team at PokeCORE has developed an extraordinary new technology, the PokeNavi.",
    "With it, you'll be able to transfer a real Pokémon from their universe into ours, where it will reside within this virtual console.",
    "Imagine the possibilities! You'll be able to communicate with your Pokémon using your native language, forming a bond like never before.",
    "But before we dive into this incredible adventure, I need to gather some basic information from you.",
    "Let's get started, shall we?"
  ]);
  const [charmap, setCharmap] = useState<Record<number, string>>({});
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [pokemonData, setPokemonData] = useState(null);

  useEffect(() => {
    const savedData = localStorage.getItem('userData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setPlayerInfo(parsedData);
      setText((prevText) => [
        ...prevText,
        `Great to see you again, ${parsedData.name}! Let's continue our adventure.`
      ]);
    }

    loadCharmap('/charmap.csv')
      .then(setCharmap)
      .catch(console.error);
  }, []);

  const handleOverlayComplete = (data: { name: string; gender: string }) => {
    setPlayerInfo(data);
    setShowOverlay(false);
    setText((prevText) => [
      ...prevText,
      `Nice to meet you, ${data.name}! Let's get started on your adventure.`
    ]);
    setShowFileUpload(true);
  };

  const handleTextComplete = () => {
    if (!playerInfo) {
      setShowOverlay(true);
    } else {
      setShowFileUpload(true);
    }
  };

  const handleFileUpload = async (file: File) => {
    const reader = new FileReader();

    reader.onload = async (event) => {
      if (event.target?.result) {
        const fileBuffer = new Uint8Array(event.target.result as ArrayBuffer);
        const jsonData = await processPk3File(fileBuffer, charmap);

        if (jsonData) {
          setPlayerInfo((prevInfo) => ({
            ...prevInfo,
            pokemonName: jsonData.Nickname,
            pokemonSpecies: jsonData.Species.Name,
            name: prevInfo?.name || '',
            gender: prevInfo?.gender || '',
          }));

          setPokemonData({
            nickname: jsonData.Nickname,
            species: jsonData.Species.Name,
            level: jsonData.Level,
            type1: jsonData.Type1,
            type2: jsonData.Type2,
            ability: jsonData.Ability,
            nature: jsonData.Nature,
            stats: {
              hp: jsonData.Stats.HP,
              attack: jsonData.Stats.Attack,
              defense: jsonData.Stats.Defense,
              spAttack: jsonData.Stats.SpAttack,
              spDefense: jsonData.Stats.SpDefense,
              speed: jsonData.Stats.Speed,
            }
          });

          setText((prevText) => [
            ...prevText,
            `Ah! It looks like you've transferred in a ${jsonData.Species.Name} named ${jsonData.Nickname}.`,
            `Hello, ${jsonData.Nickname}! Welcome to PokeCORE.`,
          ]);

          setShowStatsModal(true); // Show the stats modal after processing
        } else {
          setText((prevText) => [
            ...prevText,
            "Hmm, there was an issue processing your file. Please try again."
          ]);
        }

        setShowFileUpload(false); // Hide the file upload after processing
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div style={{
      position: 'relative',
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column'
    }}>
      <Professor />
      <TextBox text={text} onTextComplete={handleTextComplete} />
      {showOverlay && <Overlay onComplete={handleOverlayComplete} />}
      {showFileUpload && <FileUpload onFileUpload={handleFileUpload} />}
      {showStatsModal && (
        <StatsModal
          isOpen={showStatsModal}
          onClose={() => setShowStatsModal(false)}
          pokemonData={pokemonData}
        />
      )}
      <MusicControl />
    </div>
  );
}
