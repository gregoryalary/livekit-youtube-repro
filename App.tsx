/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { Button, StatusBar, StyleSheet, Text, TextInput, useColorScheme, View, ScrollView, Dimensions } from 'react-native';
import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import { useCallback, useState } from 'react';
import { LiveKitRoom, useTracks, VideoTrack, isTrackReference, TrackReferenceOrPlaceholder } from '@livekit/react-native';
import { Track } from 'livekit-client';
import YoutubePlayer from "react-native-youtube-iframe";

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

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

function RoomContent() {
  // Get all camera tracks from participants
  const tracks = useTracks([Track.Source.Camera], { onlySubscribed: false });
  
  const { width: screenWidth } = Dimensions.get('window');
  const videoWidth = (screenWidth - 60) / 2; // 2 columns with padding
  
  const renderVideoTrack = (track: TrackReferenceOrPlaceholder, index: number) => {
    if (isTrackReference(track)) {
      return (
        <View key={`${track.participant.identity}-${index}`} style={[styles.videoContainer, { width: videoWidth }]}>
          <VideoTrack 
            trackRef={track} 
            style={styles.videoTrack}
            objectFit="cover"
          />
          <View style={styles.participantInfo}>
            <Text style={styles.participantName} numberOfLines={1}>
              {track.participant.identity || `Participant ${index + 1}`}
            </Text>
            {track.participant.isSpeaking && (
              <View style={styles.speakingIndicator} />
            )}
          </View>
        </View>
      );
    } else {
      // Placeholder for participant without video
      return (
        <View key={`placeholder-${index}`} style={[styles.videoContainer, styles.placeholderContainer, { width: videoWidth }]}>
          <View style={styles.placeholderContent}>
            <Text style={styles.placeholderText}>
              {track.participant?.identity || `Participant ${index + 1}`}
            </Text>
            <Text style={styles.placeholderSubtext}>No video</Text>
          </View>
        </View>
      );
    }
  };

  return (
    <View style={styles.roomContainer}>
      <View style={{width: '100%', backgroundColor: 'black'}}>
        <YoutubePlayer
          height={300}
          videoId={"iee2TATGMyI"}
        />
      </View>


        <Text style={styles.roomTitle}>Live Room</Text>
        <Text style={styles.participantCount}>
          {tracks.length} participant{tracks.length !== 1 ? 's' : ''}
        </Text>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.videoGrid}>
          {tracks.map((track, index) => renderVideoTrack(track, index))}
        </View>
      </ScrollView>
    </View>
  );
}

function AppContent() {
  const [username, setUsername] = useState(
    'user' + Math.random().toString(36).substring(2, 15)
  );
  const [token, setToken] = useState<string | null>(null);

  const doRegisterUser = useCallback(async (validatedUsername: string) => {
    if (validatedUsername) {
      setToken(await registerUser(validatedUsername));
    }
  }, []);

  if (token) {
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
  // Room content styles
  roomContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  roomTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
    marginTop: 5,
    color: '#333',
  },
  participantCount: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  videoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  videoContainer: {
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  videoTrack: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
  },
  participantInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  participantName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  speakingIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginLeft: 8,
  },
  // Placeholder styles for participants without video
  placeholderContainer: {
    aspectRatio: 16 / 9,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderContent: {
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  placeholderSubtext: {
    fontSize: 12,
    color: '#999',
  },
});

export default App;
