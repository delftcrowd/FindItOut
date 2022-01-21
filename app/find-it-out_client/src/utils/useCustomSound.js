import { useCookies } from "react-cookie";
import useSound from "use-sound";
import { AUDIO_ENABLED } from "../constants/AppConstants";

export default function useCustomSound(sound, volume = 1, speed = 1) {
  const [cookies] = useCookies([AUDIO_ENABLED])

  const [playSound] = useSound(sound,
    {
      // soundEnabled: cookies[AUDIO_ENABLED] ? cookies[AUDIO_ENABLED] === 'true' : true,
      soundEnabled: true,
      volume: volume,
      playbackRate: speed
    })

  return playSound
}