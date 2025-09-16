import { StyleSheet, Text, View } from 'react-native';
import { VideoTrack, isTrackReference, TrackReferenceOrPlaceholder } from '@livekit/react-native';

interface TrackCardProps {
  track: TrackReferenceOrPlaceholder;
  index: number;
  width: number;
}

function TrackCard({ track, index, width }: TrackCardProps) {
  if (isTrackReference(track)) {
    return (
      <View key={`${track.participant.identity}-${index}`} style={[styles.videoContainer, { width }]}>
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
      <View key={`placeholder-${index}`} style={[styles.videoContainer, styles.placeholderContainer, { width }]}>
        <View style={styles.placeholderContent}>
          <Text style={styles.placeholderText}>
            {track.participant?.identity || `Participant ${index + 1}`}
          </Text>
          <Text style={styles.placeholderSubtext}>No video</Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
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
    aspectRatio: 1 / 1,
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
    aspectRatio: 1 / 1,
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

export default TrackCard;