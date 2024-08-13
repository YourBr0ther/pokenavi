import Professor from '../../components/Professor';
import TextBox from '../../components/TextBox';
import MusicControl from '../../components/MusicControl'; // Import the new MusicControl component

export default function Home() {
  const text = [
    "Welcome to the wondrous world of Pokémon! My name is Professor Thorn, and I am the head researcher here at PokeCORE.",
    "Our team at PokeCORE has developed an extraordinary new technology, the PokeNavi.",
    "With it, you'll be able to transfer a real Pokémon from their universe into ours, where it will reside within this virtual console.",
    "Imagine the possibilities! You'll be able to communicate with your Pokémon using your native language, forming a bond like never before.",
    "But before we dive into this incredible adventure, I need to gather some basic information from you.",
    "Let's get started, shall we?"
  ];

  return (
    <div style={{ position: 'relative', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ position: 'relative' }}>
        <Professor /> {/* The professor will be anchored to the top of the text box */}
        <TextBox text={text} /> {/* Text box will be displayed below the professor */}
      </div>
      <MusicControl /> {/* The music control button will be fixed in the top-right corner */}
    </div>
  );
}
