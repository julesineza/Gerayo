import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, TextInput, Image } from 'react-native';
import { COLORS } from '../theme/colors';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import apiService from '../services/api';

export default function DriverRegistration({ onComplete, onCancel, pendingApproval = false }) {
  const [step, setStep] = useState(pendingApproval ? 4 : 1);
  const [agreed, setAgreed] = useState(false);
  const [idUploaded, setIdUploaded] = useState(false);
  const [licenseUploaded, setLicenseUploaded] = useState(false);
  const [selfieTaken, setSelfieTaken] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Input fields
  const [licenseNumber, setLicenseNumber] = useState('');
  const [nidNumber, setNidNumber] = useState('');

  const nextStep = async () => {
    if (step === 1 && !agreed) {
      alert('You must consent to the background screening policy.');
      return;
    }
    if (step === 2 && (!licenseNumber || !nidNumber || !idUploaded || !licenseUploaded)) {
      alert('Please fill out document numbers and upload files.');
      return;
    }
    if (step === 3) {
      if (!selfieTaken) {
        alert('Please perform the biometric selfie check.');
        return;
      }
      setIsLoading(true);
      try {
        await apiService.createDriverProfile({
          nationalId: nidNumber,
          driversLicense: licenseNumber,
        });
      } catch (error) {
        alert(error.message || 'Failed to submit application');
        setIsLoading(false);
        return;
      }
      setIsLoading(false);
    }

    setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      onCancel();
    }
  };

  const handleUploadId = () => {
    setIdUploaded(true);
  };

  const handleUploadLicense = () => {
    setLicenseUploaded(true);
  };

  const handleCaptureSelfie = () => {
    setSelfieTaken(true);
  };

  return (
    <View style={styles.container}>
      {/* Registration Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={prevStep} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Driver Verification</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Progress Indicator */}
      {step <= 3 && (
        <View style={styles.progressRow}>
          {[1, 2, 3].map((num) => (
            <View key={num} style={styles.progressStepWrapper}>
              <View style={[
                styles.stepCircle,
                step === num && styles.stepCircleActive,
                step > num && styles.stepCircleCompleted
              ]}>
                {step > num ? (
                  <Ionicons name="checkmark" size={14} color={COLORS.black} />
                ) : (
                  <Text style={[styles.stepNumText, step === num && styles.stepNumTextActive]}>{num}</Text>
                )}
              </View>
              {num < 3 && <View style={[styles.stepConnector, step > num && styles.stepConnectorActive]} />}
            </View>
          ))}
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
        {step === 1 && (
          <View style={styles.stepContent}>
            <Text style={styles.sectionTitle}>1. Vetting Consent</Text>
            <Text style={styles.sectionDesc}>
              To join Gerayo as a premium sober driver, we verify all credentials to guarantee client safety.
            </Text>

            {/* Vetting Criteria List */}
            <View style={styles.criteriaCard}>
              <Text style={styles.criteriaTitle}>DRIVER REQUIREMENTS:</Text>
              <View style={styles.criteriaRow}>
                <Ionicons name="shield-checkmark" size={16} color={COLORS.primary} />
                <Text style={styles.criteriaText}>Clean criminal record (Background scan)</Text>
              </View>
              <View style={styles.criteriaRow}>
                <Ionicons name="card" size={16} color={COLORS.primary} />
                <Text style={styles.criteriaText}>Valid Class B Driving License (Min. 3 years)</Text>
              </View>
              <View style={styles.criteriaRow}>
                <Ionicons name="person" size={16} color={COLORS.primary} />
                <Text style={styles.criteriaText}>Age 25 years or older</Text>
              </View>
              <View style={styles.criteriaRow}>
                <Ionicons name="phone-portrait" size={16} color={COLORS.primary} />
                <Text style={styles.criteriaText}>Smartphone with active GPS connectivity</Text>
              </View>
            </View>

            {/* Checkbox */}
            <TouchableOpacity style={styles.checkboxRow} onPress={() => setAgreed(!agreed)}>
              <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
                {agreed && <Ionicons name="checkmark" size={16} color={COLORS.black} />}
              </View>
              <Text style={styles.checkboxText}>
                I authorize Gerayo and its security affiliates to run background checks and verify my driving license credentials.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.primaryBtn} onPress={nextStep}>
              <Text style={styles.primaryBtnText}>CONSENT & CONTINUE</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContent}>
            <Text style={styles.sectionTitle}>2. Document Credentials</Text>
            <Text style={styles.sectionDesc}>
              Input card data and upload high-resolution scans of your documents.
            </Text>

            {/* Form Fields */}
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>National ID / Passport Number</Text>
              <TextInput
                placeholder="1 1990 8 0054321 0 54"
                placeholderTextColor={COLORS.textSecondary}
                style={styles.textInput}
                value={nidNumber}
                onChangeText={setNidNumber}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Driving License Serial Number</Text>
              <TextInput
                placeholder="DL-8092-2026-RW"
                placeholderTextColor={COLORS.textSecondary}
                style={styles.textInput}
                value={licenseNumber}
                onChangeText={setLicenseNumber}
              />
            </View>

            {/* Document upload rows */}
            <Text style={styles.uploadTitle}>Scan Uploads</Text>
            
            <TouchableOpacity 
              style={[styles.uploadItem, idUploaded && styles.uploadItemSuccess]}
              onPress={handleUploadId}
            >
              <View style={styles.uploadLeft}>
                <Ionicons 
                  name={idUploaded ? "checkmark-circle" : "cloud-upload-outline"} 
                  size={24} 
                  color={idUploaded ? COLORS.secondary : COLORS.textSecondary} 
                />
                <View style={styles.uploadInfo}>
                  <Text style={styles.uploadLabel}>National ID Card Scan</Text>
                  <Text style={styles.uploadSub}>{idUploaded ? 'national_id_scan.jpg • Ready' : 'Front & Back photo file'}</Text>
                </View>
              </View>
              {!idUploaded && <Text style={styles.uploadActionText}>Upload</Text>}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.uploadItem, licenseUploaded && styles.uploadItemSuccess]}
              onPress={handleUploadLicense}
            >
              <View style={styles.uploadLeft}>
                <Ionicons 
                  name={licenseUploaded ? "checkmark-circle" : "cloud-upload-outline"} 
                  size={24} 
                  color={licenseUploaded ? COLORS.secondary : COLORS.textSecondary} 
                />
                <View style={styles.uploadInfo}>
                  <Text style={styles.uploadLabel}>Driving License Scan</Text>
                  <Text style={styles.uploadSub}>{licenseUploaded ? 'driving_license_scan.jpg • Ready' : 'Front face photo file'}</Text>
                </View>
              </View>
              {!licenseUploaded && <Text style={styles.uploadActionText}>Upload</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={styles.primaryBtn} onPress={nextStep}>
              <Text style={styles.primaryBtnText}>SAVE & CONTINUE</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 3 && (
          <View style={styles.stepContent}>
            <Text style={styles.sectionTitle}>3. Selfie Verification</Text>
            <Text style={styles.sectionDesc}>
              This confirms your identity matches your documentation.
            </Text>

            {/* Simulated camera capture frame */}
            <View style={styles.cameraFrameContainer}>
              <View style={styles.cameraOuterFrame}>
                {selfieTaken ? (
                  <View style={styles.selfieMockBg}>
                    <Ionicons name="person" size={100} color={COLORS.secondary} />
                    <View style={styles.selfieApprovedBadge}>
                      <Ionicons name="checkmark-sharp" size={20} color={COLORS.black} />
                    </View>
                  </View>
                ) : (
                  <View style={styles.viewfinder}>
                    <View style={styles.reticleTopLeft} />
                    <View style={styles.reticleTopRight} />
                    <View style={styles.reticleBottomLeft} />
                    <View style={styles.reticleBottomRight} />
                    <Ionicons name="camera-outline" size={36} color="rgba(255,255,255,0.4)" />
                    <Text style={styles.viewfinderText}>Align face here</Text>
                  </View>
                )}
              </View>
            </View>

            {selfieTaken ? (
              <View style={styles.selfieSuccessMsg}>
                <Ionicons name="checkmark-done" size={16} color={COLORS.success} />
                <Text style={styles.selfieSuccessText}>Biometric selfie locked. Ready for review.</Text>
              </View>
            ) : (
              <TouchableOpacity style={styles.captureBtn} onPress={handleCaptureSelfie}>
                <Ionicons name="aperture-sharp" size={20} color={COLORS.black} style={{ marginRight: 8 }} />
                <Text style={styles.captureBtnText}>CAPTURE SELFIE CHECK</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.primaryBtn} onPress={nextStep}>
              <Text style={styles.primaryBtnText}>SUBMIT APPLICATION</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 4 && (
          <View style={[styles.stepContent, { alignItems: 'center', paddingVertical: 25 }]}>
            <View style={styles.receivedIconContainer}>
              <MaterialCommunityIcons name="clipboard-text-clock-outline" size={54} color={COLORS.primary} />
            </View>
            
            <Text style={styles.receivedTitle}>APPLICATION UNDER REVIEW</Text>
            <Text style={styles.receivedDesc}>
              We have received your verification uploads! Our safety review board is validating your credentials.
            </Text>

            {/* ETA Info Badge */}
            <View style={styles.etaBadge}>
              <Ionicons name="time" size={16} color={COLORS.black} />
              <Text style={styles.etaText}>EXPECTED VETTING ETA: 2 - 4 HOURS</Text>
            </View>

            {/* Information Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>DOCUMENTS RECEIVED:</Text>
              <View style={styles.summaryRow}>
                <Ionicons name="checkbox" size={14} color={COLORS.secondary} />
                <Text style={styles.summaryText}>Background Check Consent</Text>
              </View>
              <View style={styles.summaryRow}>
                <Ionicons name="checkbox" size={14} color={COLORS.secondary} />
                <Text style={styles.summaryText}>National ID Card Verification</Text>
              </View>
              <View style={styles.summaryRow}>
                <Ionicons name="checkbox" size={14} color={COLORS.secondary} />
                <Text style={styles.summaryText}>Driving License Serial Scan</Text>
              </View>
              <View style={styles.summaryRow}>
                <Ionicons name="checkbox" size={14} color={COLORS.secondary} />
                <Text style={styles.summaryText}>Biometric Identity Selfie</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.finishedBtn} onPress={onComplete}>
              <Text style={styles.finishedText}>RETURN TO ONBOARDING</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  backBtn: {
    padding: 6,
    backgroundColor: COLORS.surface,
    borderRadius: 15,
  },
  headerTitle: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  progressStepWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  stepCircleActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.background,
  },
  stepCircleCompleted: {
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.secondary,
  },
  stepNumText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: 'bold',
  },
  stepNumTextActive: {
    color: COLORS.primary,
  },
  stepConnector: {
    width: 40,
    height: 2,
    backgroundColor: COLORS.border,
    marginHorizontal: 8,
  },
  stepConnectorActive: {
    backgroundColor: COLORS.secondary,
  },
  scrollBody: {
    padding: 24,
    paddingBottom: 40,
  },
  stepContent: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 6,
  },
  sectionDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 25,
  },
  criteriaCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 20,
  },
  criteriaTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    letterSpacing: 1,
    marginBottom: 15,
  },
  criteriaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  criteriaText: {
    color: COLORS.white,
    marginLeft: 12,
    fontSize: 12,
    fontWeight: '600',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 30,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  checkboxText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 4 },
  },
  primaryBtnText: {
    color: COLORS.black,
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  formGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    color: COLORS.white,
    paddingHorizontal: 16,
    height: 52,
    fontSize: 14,
  },
  uploadTitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 10,
  },
  uploadItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    height: 72,
  },
  uploadItemSuccess: {
    borderColor: COLORS.secondary,
    borderStyle: 'solid',
    backgroundColor: 'rgba(0,210,184,0.04)',
  },
  uploadLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  uploadInfo: {
    marginLeft: 15,
  },
  uploadLabel: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 13,
  },
  uploadSub: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginTop: 2,
  },
  uploadActionText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 12,
  },
  cameraFrameContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  cameraOuterFrame: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
  },
  viewfinder: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  reticleTopLeft: {
    position: 'absolute',
    left: 40,
    top: 40,
    width: 15,
    height: 15,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: COLORS.primary,
  },
  reticleTopRight: {
    position: 'absolute',
    right: 40,
    top: 40,
    width: 15,
    height: 15,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: COLORS.primary,
  },
  reticleBottomLeft: {
    position: 'absolute',
    left: 40,
    bottom: 40,
    width: 15,
    height: 15,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: COLORS.primary,
  },
  reticleBottomRight: {
    position: 'absolute',
    right: 40,
    bottom: 40,
    width: 15,
    height: 15,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: COLORS.primary,
  },
  viewfinderText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 10,
    fontWeight: 'bold',
  },
  selfieMockBg: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,210,184,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  selfieApprovedBadge: {
    position: 'absolute',
    bottom: 30,
    backgroundColor: COLORS.secondary,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selfieSuccessMsg: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(48,209,88,0.1)',
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 30,
  },
  selfieSuccessText: {
    color: COLORS.success,
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  captureBtn: {
    backgroundColor: COLORS.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 30,
    height: 48,
  },
  captureBtnText: {
    color: COLORS.black,
    fontWeight: 'bold',
    fontSize: 13,
  },
  receivedIconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  receivedTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  receivedDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  etaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 30,
  },
  etaText: {
    color: COLORS.black,
    fontWeight: '900',
    fontSize: 11,
    marginLeft: 8,
  },
  summaryCard: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 30,
  },
  summaryTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    letterSpacing: 1,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 10,
  },
  finishedBtn: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
  },
  finishedText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 13,
  },
});
