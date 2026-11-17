import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

let player: AudioPlayer | null = null;

/** Plays the "new order" chime for staff. Safe to call anywhere — never throws. */
export async function playNewOrderChime() {
  try {
    if (!player) {
      await setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      player = createAudioPlayer(require('../../assets/sounds/new-order.wav'));
    }
    player.seekTo(0);
    player.play();
  } catch {
    // sound is a nice-to-have; ignore any device problems
  }
}
