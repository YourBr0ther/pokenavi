import TextBox from '../../components/TextBox';

export default function Home() {
  const text = [
    "Hello, Trainer! I'm Professor Thorn, and I'm here to help you with your Pokémon. I hope you have a wonderful day. I really enjoy life. It i one of th.",
    "In this world, you'll find many challenges."
    
  ];

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', height: '100vh', backgroundColor: '#000' }}>
      <TextBox text={text} />
    </div>
  );
}
