import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import { AudioSession, LiveKitRoom } from '@livekit/react-native';
import RoomContent from './RoomContent.tsx';

const registerUser = async (username: string): Promise<string> => {
  return fetch('https://livekit-youtube-repro-server.onrender.com/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username }),
  }).then(res => res.json()).then(data => data.token).catch(console.error);
};

function RoomScreen() {
  const [token, setToken] = useState<string | null>(null);
  const [isAudioSesionReady, setIsAudioSessionRedy] = useState(false);

  useEffect(() => {
    if (!token) return

    let mounted = true

    const setupConnection = async () => {
      try {
        await AudioSession.configureAudio({
          android: {
            audioTypeOptions: {
              manageAudioFocus: false,
              audioMode: 'normal',
              audioStreamType: 'music',
              audioAttributesUsageType: 'media',
              audioAttributesContentType: 'music',
            },
            preferredOutputList: ['speaker'],
          },
          ios: {
            defaultOutput: 'speaker',
          },
        })

        await AudioSession.startAudioSession()

        if (mounted) {
          setIsAudioSessionRedy(true)
        }
      } catch (error) {
        console.error('Audio session setup failed:', error)
      }
    }

    setupConnection()

    return () => {
      mounted = false
      AudioSession.stopAudioSession()
    }
  }, [token])

  const doRegisterUser = useCallback(async (validatedUsername: string) => {
    if (validatedUsername) {
      setToken(await registerUser(validatedUsername)); // <-
    }
  }, []);

  useEffect(() => {
    doRegisterUser('user' + Math.random().toString(36).substring(2, 15));
  }, [doRegisterUser]);

  if (token && isAudioSesionReady) {
    return (
      <LiveKitRoom
        serverUrl={"wss://livekeet-youtube-repro-8qar0fgr.livekit.cloud"}
        token={token}
        connect={true}
        video={true}
        audio={true}
        options={{
          adaptiveStream: { pixelDensity: 'screen' },
        }}
      >
        <RoomContent />
      </LiveKitRoom>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default RoomScreen;