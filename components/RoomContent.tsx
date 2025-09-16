import { StyleSheet, Text, View, ScrollView, Dimensions } from 'react-native';
import { useTracks } from '@livekit/react-native';
import { Track } from 'livekit-client';
import YoutubePlayer from "react-native-youtube-iframe";
import TrackCard from './TrackCard';

function RoomContent() {
  // Get all camera tracks from participants
  const tracks = useTracks([Track.Source.Camera], { onlySubscribed: false });

  const { width: screenWidth } = Dimensions.get('window');
  const videoWidth = (screenWidth - 60) / 2; // 2 columns with padding

  return (
    <View style={styles.roomContainer}>
      <View style={styles.youtubeContainer}>
        <YoutubePlayer
          height={300}
          videoId={"oaRZAI8XDyA"}
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
          {tracks.map((track, index) => (
            <TrackCard 
              key={`${track.participant?.identity || 'unknown'}-${index}`}
              track={track} 
              index={index} 
              width={videoWidth} 
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  roomContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  youtubeContainer: {
    width: '100%',
    backgroundColor: 'black',
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
});

export default RoomContent;