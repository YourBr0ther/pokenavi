import axios from 'axios';

type Charmap = Record<number, string>;

type PokemonData = {
  "Personality Value": string;
  "Nickname": string;
  "Species": {
    "ID": number;
    "Name": string;
    "Number": number;
  };
};

async function getPokemonData(speciesIdentifier: number): Promise<{ species_name: string; species_number: number } | null> {
  try {
    const speciesUrl = `https://pokeapi.co/api/v2/pokemon-species/${speciesIdentifier}`;

    const speciesResponse = await axios.get(speciesUrl);
    const speciesData = speciesResponse.data;

    const speciesName = speciesData.name;
    const speciesNumber = speciesData.id;

    return {
      species_name: speciesName.charAt(0).toUpperCase() + speciesName.slice(1),
      species_number: speciesNumber,
    };
  } catch (error) {
    console.error(`Error fetching data for species ${speciesIdentifier}: ${error}`);
    return null;
  }
}

function readPersonalityValue(buffer: ArrayBuffer): number {
  return new DataView(buffer).getUint32(0, true);
}

function readOtId(buffer: ArrayBuffer): number {
  return new DataView(buffer).getUint32(4, true);
}

function readNicknameRaw(buffer: ArrayBuffer): Uint8Array {
  return new Uint8Array(buffer.slice(8, 18));
}

function decodeNickname(nicknameRaw: Uint8Array, charmap: Charmap): string {
  let nickname = '';
  for (let i = 0; i < nicknameRaw.length; i++) {
    const byte = nicknameRaw[i];
    if (byte === 0x00 || !charmap[byte]) break;
    nickname += charmap[byte] || '?';
  }
  return nickname || "Unknown";
}

function readSpecies(buffer: ArrayBuffer): number {
  return new DataView(buffer).getUint16(0x20, true);
}

export async function processPk3File(fileBuffer: Uint8Array, charmap: Charmap): Promise<PokemonData | null> {
  try {
    const personalityValue = readPersonalityValue(fileBuffer.buffer);
    const otId = readOtId(fileBuffer.buffer);
    const nicknameRaw = readNicknameRaw(fileBuffer.buffer);
    const nickname = decodeNickname(nicknameRaw, charmap);
    const species = readSpecies(fileBuffer.buffer);

    const additionalData = await getPokemonData(species);

    if (!additionalData) {
      return null;
    }

    const data: PokemonData = {
      "Personality Value": personalityValue.toString(16).toUpperCase().padStart(8, '0'),
      "Nickname": nickname,
      "Species": {
        "ID": species,
        "Name": additionalData.species_name,
        "Number": additionalData.species_number,
      },
    };

    return data;
  } catch (error) {
    console.error('Error processing pk3 file:', error);
    return null;
  }
}
