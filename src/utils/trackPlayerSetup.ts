import TrackPlayer, { PlayerCommand } from "@rntp/player";

let ready: Promise<void> | null = null;

export const ensurePlayerReady = () => {
  if (!ready) {
    ready = (async () => {
      await TrackPlayer.setupPlayer({
        contentType: "music",
        handleAudioBecomingNoisy: true,
        android: {
          taskRemovedBehavior: "stop",
        },
      });

      TrackPlayer.setCommands({
        capabilities: [
          PlayerCommand.PlayPause,
          PlayerCommand.Next,
          PlayerCommand.Previous,
          PlayerCommand.Seek,
          PlayerCommand.Stop,
        ],
      });
    })();
  }

  return ready;
};