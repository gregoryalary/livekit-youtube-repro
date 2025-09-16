import { Button, StyleSheet, TextInput, View } from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import { AudioSession, LiveKitRoom } from '@livekit/react-native';
import RoomContent from './RoomContent.tsx';

const registerUser = async (username: string): Promise<string> => {
  console.log(JSON.stringify({ username }))

  return fetch('http://10.0.2.2:3000/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username }),
  }).then(res => res.json()).then(data => data.token);
};

function RoomScreen() {
  const [username, setUsername] = useState('');
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
      setToken(await registerUser(validatedUsername));
    }
  }, []);

  useEffect(() => {
    const randomUsername = 'user' + Math.random().toString(36).substring(2, 15);
    setUsername(randomUsername);
    doRegisterUser(randomUsername);
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
      <View style={styles.inputContainer}>
        <TextInput style={styles.input} placeholder="Enter your username" value={username} onChangeText={setUsername} />
        <Button title="Validate" onPress={() => doRegisterUser(username)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: 'black',
    padding: 10,
    margin: 10,
    width: '80%',
  },
});

export default RoomScreen;