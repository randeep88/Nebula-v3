import TrackPlayer, { PlayerCommand } from "@rntp/player";

let isSetup = false;

export const setupPlayer = async () => {
  if (isSetup) return;
  isSetup = true;

  try {
    await TrackPlayer.setupPlayer({
      contentType: "music",
      handleAudioBecomingNoisy: true,
    });

    await TrackPlayer.setCommands({
      capabilities: [
        PlayerCommand.PlayPause,
        PlayerCommand.Next,
        PlayerCommand.Previous,
        PlayerCommand.Seek,
      ],
    });
  } catch (err) {
    isSetup = false;
    console.log("Player setup failed:", err);
  }
};
