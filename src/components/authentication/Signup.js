import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import {useFormik} from 'formik';
import * as Yup from 'yup';

import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faEye, faEyeSlash} from '@fortawesome/free-solid-svg-icons';
import Colors from '../../colors/Colors';
import {faGoogle} from '@fortawesome/free-brands-svg-icons';

const SignUp = ({navigation}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleNextPress = () => {
    navigation.navigate('Login'); // Navigate to the Login screen
  };

  // Form validation schema
  const validationSchema = Yup.object().shape({
    fullName: Yup.string().required('Full Name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/,
        'Password must include at least one uppercase letter, one lowercase letter, and one number',
      )
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm Password is required'),
  });

  // Form handling with Formik
  const formik = useFormik({
    initialValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema,
    onSubmit: values => {
      const {confirmPassword, ...formData} = values;
      console.log('Submitted Data:', formData);
    },
  });

  return (
    <SafeAreaView style={{flex: 1}}>
      <StatusBar backgroundColor={Colors.primary} />
      <ScrollView>
        <View
          style={{
            backgroundColor: Colors.primary,
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}>
          <Text style={styles.title}>User Sign Up</Text>
        </View>
        <View style={styles.container}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            onChangeText={formik.handleChange('fullName')}
            onBlur={formik.handleBlur('fullName')}
            value={formik.values.fullName}
          />
          {formik.touched.fullName && formik.errors.fullName ? (
            <Text style={styles.errorText}>{formik.errors.fullName}</Text>
          ) : null}

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            onChangeText={formik.handleChange('email')}
            onBlur={formik.handleBlur('email')}
            value={formik.values.email}
          />
          {formik.touched.email && formik.errors.email ? (
            <Text style={styles.errorText}>{formik.errors.email}</Text>
          ) : null}

          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="Password"
              secureTextEntry={!showPassword}
              onChangeText={formik.handleChange('password')}
              onBlur={formik.handleBlur('password')}
              value={formik.values.password}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}>
              <FontAwesomeIcon
                icon={showPassword ? faEyeSlash : faEye}
                size={20}
                color="gray"
              />
            </TouchableOpacity>
          </View>
          {formik.touched.password && formik.errors.password ? (
            <Text style={styles.errorText}>{formik.errors.password}</Text>
          ) : null}

          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="ConfirmPassword"
              secureTextEntry={!showConfirmPassword}
              onChangeText={formik.handleChange('confirmPassword')}
              onBlur={formik.handleBlur('confirmPassword')}
              value={formik.values.confirmPassword}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeIcon}>
              <FontAwesomeIcon
                icon={showConfirmPassword ? faEyeSlash : faEye}
                size={20}
                color="gray"
              />
            </TouchableOpacity>
          </View>
          {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
            <Text style={styles.errorText}>
              {formik.errors.confirmPassword}
            </Text>
          ) : null}

          <Text
            style={{
              marginVertical: 25,
              paddingRight: 20,
              fontWeight: '500',
              fontSize: 12,
            }}>
            Password must include both uppercase and lowercase letters and
            numbers and minimum 6 characters
          </Text>

          <TouchableOpacity style={styles.button} onPress={formik.handleSubmit}>
            <Text style={{fontSize: 16, color: 'white'}}>Sign Up</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              marginTop: 10,
              backgroundColor: 'blue',
              borderRadius: 10,
              justifyContent: 'center',
              paddingHorizontal: 10,
              paddingVertical: 13,
            }}>
            <FontAwesomeIcon size={25} icon={faGoogle} color="red" />
            <Text
              style={{color: Colors.white, fontSize: 16, fontWeight: '600'}}>
              Sign up with google
            </Text>
          </TouchableOpacity>
          <View style={styles.loginContainer}>
            <Text style={{fontSize: 14}}>Already have an account?</Text>
            <TouchableOpacity onPress={handleNextPress}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginVertical: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  label: {
    fontSize: 16,
    marginVertical: 3,
  },
  input: {
    height: 47,
    borderColor: 'gray',
    borderWidth: 0.5,
    marginTop: 5,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 5,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  passwordInput: {
    flex: 1,
  },
  eyeIcon: {
    position: 'absolute',
    right: 10,
    top: 18,
  },
  errorText: {
    color: 'red',
    marginBottom: 8,
    marginTop: 4,
  },
  button: {
    marginTop: 8,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 12,
    marginVertical: 5,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  loginLink: {
    color: Colors.primary,
    marginLeft: 5,
  },
});

export default SignUp;
