import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, ScrollView, ActivityIndicator, Linking, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { theme } from '../theme';
import { insertReport } from '../services/db';

const STEPS = ['Photo', 'GPS', 'Details', 'Done'];

const detailsSchema = z.object({
  category: z.enum(['TRACK', 'SIGNAL', 'TRACTION_OHE', 'OTHER'], {
    message: 'Please select a category',
  }),
  description: z.string().min(10, 'Description must be at least 10 characters'),
});

type DetailsFormData = z.infer<typeof detailsSchema>;

export const ReportProblemScreen = ({ navigation }: any) => {
  const [step, setStep] = useState(0);

  // Permissions
  const [camPermission, requestCamPermission] = useCameraPermissions();
  const [locPermission, requestLocPermission] = Location.useForegroundPermissions();

  // Step 1: Photo
  const cameraRef = useRef<CameraView>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  // Step 2: GPS
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isFetchingGps, setIsFetchingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Step 3: Details & Audio
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [voiceNoteUri, setVoiceNoteUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdReportId, setCreatedReportId] = useState<string | null>(null);

  const { control, handleSubmit, formState: { errors } } = useForm<DetailsFormData>({
    resolver: zodResolver(detailsSchema),
    mode: 'onChange',
  });

  // Fetch initial permissions on mount
  useEffect(() => {
    if (!camPermission?.granted && camPermission?.canAskAgain) {
      requestCamPermission();
    }
  }, []);

  // --- Actions ---

  const handleCapture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
        if (photo) {
          setPhotoUri(photo.uri);
        }
      } catch (e) {
        Alert.alert('Camera Error', 'Failed to take photo');
      }
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const fetchGps = async () => {
    setIsFetchingGps(true);
    setGpsError(null);
    try {
      if (!locPermission?.granted) {
        const req = await requestLocPermission();
        if (!req.granted) {
          setGpsError('Location permission denied.');
          setIsFetchingGps(false);
          return;
        }
      }
      
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLocation(loc);
      if (loc.coords.accuracy && loc.coords.accuracy > 50) {
        setGpsError(`Poor accuracy (${Math.round(loc.coords.accuracy)}m)`);
      }
    } catch (e) {
      setGpsError('Failed to capture GPS');
    } finally {
      setIsFetchingGps(false);
    }
  };

  const goToGpsStep = () => {
    setStep(1);
    fetchGps();
  };

  const toggleRecording = async () => {
    try {
      if (recording) {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setVoiceNoteUri(uri);
        setRecording(null);
      } else {
        const perm = await Audio.requestPermissionsAsync();
        if (perm.granted) {
          await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
          const { recording: newRecording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
          setRecording(newRecording);
        } else {
          Alert.alert('Permission Denied', 'Microphone permission is required to record audio.');
        }
      }
    } catch (err) {
      Alert.alert('Recording Error', 'Failed to start/stop recording.');
    }
  };

  const onSubmit = async (data: DetailsFormData) => {
    try {
      setIsSubmitting(true);
      const report = await insertReport({
        category: data.category as any,
        description: data.description,
        latitude: location?.coords.latitude || 0,
        longitude: location?.coords.longitude || 0,
        gpsAccuracy: location?.coords.accuracy || 0,
        photoUri: photoUri || '',
        voiceNoteUri: voiceNoteUri,
        capturedAt: new Date().toISOString(),
      });
      setCreatedReportId(report.id);
      setStep(3); // Done
    } catch (e: any) {
      Alert.alert('Submission Failed', e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Renders ---

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      {STEPS.map((s, i) => (
        <View key={s} style={styles.progressStep}>
          <View style={[styles.progressDot, step >= i && styles.progressDotActive]} />
          <Text style={[styles.progressText, step >= i && styles.progressTextActive]}>{s}</Text>
        </View>
      ))}
    </View>
  );

  const renderStep0 = () => (
    <View style={styles.stepContainer}>
      {!camPermission?.granted ? (
        <View style={styles.centerBox}>
          <Text style={styles.warningText}>Camera permission is required to take photos.</Text>
          <TouchableOpacity style={styles.btnSecondary} onPress={requestCamPermission}>
            <Text style={styles.btnSecondaryText}>Grant Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btnOutline, {marginTop: 16}]} onPress={() => Linking.openSettings()}>
            <Text style={styles.btnOutlineText}>Open Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btnOutline, {marginTop: 24}]} onPress={handlePickImage}>
            <Text style={styles.btnOutlineText}>Pick from Gallery instead</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btnSecondary, {marginTop: 24}]} onPress={goToGpsStep}>
            <Text style={styles.btnSecondaryText}>Skip Photo</Text>
          </TouchableOpacity>
        </View>
      ) : photoUri ? (
        <View style={styles.centerBox}>
          <Image source={{ uri: photoUri }} style={styles.previewImage} />
          <View style={styles.row}>
            <TouchableOpacity style={[styles.btnOutline, { flex: 1, marginRight: 8 }]} onPress={() => setPhotoUri(null)}>
              <Text style={styles.btnOutlineText}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btnPrimary, { flex: 1, marginLeft: 8 }]} onPress={goToGpsStep}>
              <Text style={styles.btnPrimaryText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.cameraWrapper}>
          <CameraView style={styles.camera} ref={cameraRef} facing="back">
            <View style={styles.cameraControls}>
              <TouchableOpacity style={styles.captureBtn} onPress={handleCapture} />
            </View>
          </CameraView>
          <TouchableOpacity style={[styles.btnOutline, { marginTop: theme.spacing.md }]} onPress={handlePickImage}>
            <Text style={styles.btnOutlineText}>Pick from Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btnSecondary, { marginTop: theme.spacing.md }]} onPress={goToGpsStep}>
            <Text style={styles.btnSecondaryText}>Skip Photo</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.centerBox}>
        {isFetchingGps ? (
          <>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.infoText}>Acquiring GPS Signal...</Text>
          </>
        ) : (
          <>
            {location ? (
              <View style={styles.gpsCard}>
                <Text style={styles.gpsTitle}>Location Captured</Text>
                <Text style={styles.gpsData}>Lat: {location.coords.latitude.toFixed(6)}</Text>
                <Text style={styles.gpsData}>Lng: {location.coords.longitude.toFixed(6)}</Text>
                <Text style={[styles.gpsData, location.coords.accuracy && location.coords.accuracy > 50 ? {color: theme.colors.warning} : {color: theme.colors.success}]}>
                  Accuracy: {Math.round(location.coords.accuracy || 0)}m
                </Text>
              </View>
            ) : (
              <View style={[styles.gpsCard, { borderColor: theme.colors.critical }]}>
                <Text style={[styles.gpsTitle, { color: theme.colors.critical }]}>Location not captured</Text>
                <Text style={styles.gpsData}>{gpsError}</Text>
              </View>
            )}

            {(gpsError || (location && location.coords.accuracy && location.coords.accuracy > 50)) && (
              <TouchableOpacity style={styles.btnOutline} onPress={fetchGps}>
                <Text style={styles.btnOutlineText}>Retry GPS</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={[styles.btnPrimary, { marginTop: theme.spacing.xl }]} onPress={() => setStep(2)}>
              <Text style={styles.btnPrimaryText}>Next: Details</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  const renderStep2 = () => (
    <ScrollView contentContainerStyle={styles.scrollStep}>
      <Text style={styles.label}>Category</Text>
      <Controller
        control={control}
        name="category"
        render={({ field: { onChange, value } }) => (
          <View style={styles.categoryGrid}>
            {['TRACK', 'SIGNAL', 'TRACTION_OHE', 'OTHER'].map((cat) => (
              <TouchableOpacity 
                key={cat} 
                style={[styles.categoryBtn, value === cat && styles.categoryBtnActive]}
                onPress={() => onChange(cat)}
              >
                <Text style={[styles.categoryBtnText, value === cat && styles.categoryBtnTextActive]}>{cat.replace('_', ' ')}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      />
      {errors.category && <Text style={styles.errorText}>{errors.category.message}</Text>}

      <Text style={[styles.label, { marginTop: theme.spacing.lg }]}>Description</Text>
      <Controller
        control={control}
        name="description"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[styles.inputMulti, errors.description && styles.inputError]}
            placeholder="Describe the issue in detail..."
            placeholderTextColor={theme.colors.textMuted}
            multiline
            numberOfLines={4}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            textAlignVertical="top"
          />
        )}
      />
      {errors.description && <Text style={styles.errorText}>{errors.description.message}</Text>}

      <Text style={[styles.label, { marginTop: theme.spacing.lg }]}>Voice Note (Optional)</Text>
      <TouchableOpacity 
        style={[styles.btnSecondary, recording && { backgroundColor: theme.colors.critical }]} 
        onPress={toggleRecording}
      >
        <Text style={styles.btnSecondaryText}>
          {recording ? 'Stop Recording...' : voiceNoteUri ? 'Re-record Voice Note' : 'Record Voice Note'}
        </Text>
      </TouchableOpacity>
      {voiceNoteUri && !recording && <Text style={styles.successText}>Voice note saved.</Text>}

      <TouchableOpacity 
        style={[styles.btnPrimary, { marginTop: theme.spacing.xxl }]} 
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
      >
        {isSubmitting ? <ActivityIndicator color={theme.colors.surface} /> : <Text style={styles.btnPrimaryText}>Submit Report</Text>}
      </TouchableOpacity>
    </ScrollView>
  );

  const renderStep3 = () => (
    <View style={styles.centerBox}>
      <View style={styles.successCircle}>
        <Text style={styles.successCheck}>✓</Text>
      </View>
      <Text style={styles.successTitle}>Report Submitted</Text>
      <Text style={styles.successSubtitle}>ID: {createdReportId}</Text>
      
      <TouchableOpacity 
        style={[styles.btnPrimary, { marginTop: theme.spacing.xl }]} 
        onPress={() => {
          navigation.navigate('MainTabs', { screen: 'My Reports' });
        }}
      >
        <Text style={styles.btnPrimaryText}>View My Reports</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.btnOutline, { marginTop: theme.spacing.md }]} 
        onPress={() => {
          // Reset
          setStep(0);
          setPhotoUri(null);
          setLocation(null);
          setVoiceNoteUri(null);
        }}
      >
        <Text style={styles.btnOutlineText}>Report Another Issue</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderProgressBar()}
      <View style={styles.content}>
        {step === 0 && renderStep0()}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </View>
    </View>
  );
};

// --- Styles ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  progressStep: {
    alignItems: 'center',
    flex: 1,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.border,
    marginBottom: 4,
  },
  progressDotActive: {
    backgroundColor: theme.colors.primary,
  },
  progressText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  progressTextActive: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    flex: 1,
    padding: theme.spacing.md,
  },
  scrollStep: {
    padding: theme.spacing.md,
    flexGrow: 1,
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  cameraWrapper: {
    flex: 1,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
  },
  camera: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  cameraControls: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  captureBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.surface,
    borderWidth: 4,
    borderColor: theme.colors.border,
  },
  previewImage: {
    width: '100%',
    height: '70%',
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.xl,
    resizeMode: 'cover',
  },
  row: {
    flexDirection: 'row',
    width: '100%',
  },
  gpsCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    width: '100%',
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
  },
  gpsTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  gpsData: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    marginVertical: 2,
  },
  infoText: {
    ...theme.typography.body,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
  },
  warningText: {
    ...theme.typography.body,
    color: theme.colors.warning,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  label: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryBtn: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    marginBottom: theme.spacing.sm,
  },
  categoryBtnActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryBtnText: {
    ...theme.typography.button,
    color: theme.colors.text,
  },
  categoryBtnTextActive: {
    color: theme.colors.surface,
  },
  inputMulti: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    ...theme.typography.body,
    color: theme.colors.text,
    minHeight: 120,
  },
  inputError: {
    borderColor: theme.colors.critical,
  },
  errorText: {
    ...theme.typography.caption,
    color: theme.colors.critical,
    marginTop: theme.spacing.xs,
  },
  successText: {
    ...theme.typography.caption,
    color: theme.colors.success,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  successCheck: {
    fontSize: 40,
    color: theme.colors.surface,
    fontWeight: 'bold',
  },
  successTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  successSubtitle: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  btnPrimary: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    width: '100%',
  },
  btnPrimaryText: {
    ...theme.typography.button,
    color: theme.colors.surface,
  },
  btnSecondary: {
    backgroundColor: theme.colors.secondary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    width: '100%',
  },
  btnSecondaryText: {
    ...theme.typography.button,
    color: theme.colors.surface,
  },
  btnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    width: '100%',
  },
  btnOutlineText: {
    ...theme.typography.button,
    color: theme.colors.text,
  },
});
