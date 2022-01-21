import { useCookies } from "react-cookie";
import { AUDIO_ENABLED } from "../constants/AppConstants";

export default function useLegacySound(sourceFile, volume = 1) {
  // const [cookies] = useCookies([AUDIO_ENABLED])
  const sound = new Audio(sourceFile)
  sound.volume = volume

  const playSound = () => {
    // sound.muted = cookies[AUDIO_ENABLED] !== 'true'
    sound.play()
  }

  return playSound
}