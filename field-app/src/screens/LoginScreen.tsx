import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { theme } from '../theme';
import { authApi } from '../services/api';
import { useAuthStore } from '../store/authStore';

const loginSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginScreen = ({ navigation }: any) => {
  const [isLoading, setIsLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      employeeId: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      const response = await authApi.login(data);
      setAuth(response.token, response.user);
      navigation.replace('MainTabs');
    } catch (error: any) {
      Alert.alert('Login Failed', error?.message || 'Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Railway Field App</Text>
        <Text style={styles.subtitle}>Safety & Operations</Text>
      </View>
      
      <View style={styles.formContainer}>
        <Controller
          control={control}
          name="employeeId"
          render={({ field: { onChange, onBlur, value } }) => (
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.input, errors.employeeId && styles.inputError]}
                placeholder="Employee ID"
                placeholderTextColor={theme.colors.textMuted}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                autoCapitalize="none"
              />
              {errors.employeeId && <Text style={styles.errorText}>{errors.employeeId.message}</Text>}
            </View>
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.input, errors.password && styles.inputError]}
                placeholder="Password"
                placeholderTextColor={theme.colors.textMuted}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                secureTextEntry
              />
              {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
            </View>
          )}
        />

        <TouchableOpacity 
          style={styles.loginButton}
          onPress={handleSubmit(onSubmit)}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={theme.colors.surface} />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.surface,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.info,
  },
  formContainer: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
  },
  inputWrapper: {
    marginBottom: theme.spacing.md,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    ...theme.typography.body,
    color: theme.colors.text,
  },
  inputError: {
    borderColor: theme.colors.critical,
  },
  errorText: {
    ...theme.typography.caption,
    color: theme.colors.critical,
    marginTop: theme.spacing.xs,
  },
  loginButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  buttonText: {
    ...theme.typography.button,
    color: theme.colors.surface,
  },
});
