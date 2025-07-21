<template>
  <div class="login-container form-container">
    <div class="login-card">
        <div class="language-selector">
        <el-select v-model="currentLanguage" @change="handleLanguageChange" size="small">
          <el-option label="中文" value="zh-CL"></el-option>
          <el-option label="English" value="en-US"></el-option>
        </el-select>
      </div>
        <h2>{{ t('register.title') }}</h2>
        <el-form ref="registerFormRef" :model="registerForm" class="register-form">
        <el-form-item :label="t('register.username')" :rules="[{ required: true, message: t('register.usernameRequired'), trigger: 'blur' }]">
          <el-input v-model="registerForm.username" :placeholder="t('register.usernamePlaceholder')"></el-input>
        </el-form-item>

        <template v-if="showQrCode">
          <el-form-item :label="t('register.scanQrCode')">
            <div class="qr-code-container">
              <VueQrcode :value="otpauthUrl" :size="160" color="#000000" type="canvas" class="qr-code"></VueQrcode>
              <div class="verification-help">{{ t('register.verificationHelp') }}</div>
            </div>
          </el-form-item>

          <el-form-item :label="t('register.verificationCode')" :rules="[{ required: true, message: t('register.codeRequired'), trigger: 'blur' }]">
            <el-input v-model="registerForm.code" :placeholder="t('register.codePlaceholder')" maxlength="6"></el-input>
          </el-form-item>
        </template>

        <el-form-item>
          <el-button :loading="loading" type="primary" class="full-width-btn" @click="handleSubmit">{{ currentStep === 'register' ? t('register.generateQrCode') : t('register.completeRegistration') }}</el-button>
          <div class="register-link" v-if="!showQrCode">
            {{ t('register.haveAccount') }} <router-link to="/login">{{ t('register.loginHere') }}</router-link>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { register, verifyRegister } from '@/api/auth';
import { changeLanguage } from '@/locales/i18n';
import VueQrcode from 'vue-qrcode';
defineOptions({ name: 'RegisterView' });

const router = useRouter();
const { t, locale } = useI18n();
const registerFormRef = ref(null);
const loading = ref(false);
const showQrCode = ref(false);
const currentStep = ref('register');
const tempId = ref('');
const otpauthUrl = ref('');
const currentLanguage = ref(locale.value);

const registerForm = reactive({
  username: '',
  code: ''
});

const handleLanguageChange = (lang) => {
  currentLanguage.value = lang;
  changeLanguage(lang);
};

const handleSubmit = async () => {
  if (currentStep.value === 'register') {
    await handleGenerateQrCode();
  } else {
    await handleVerifyCode();
  }
};

const handleGenerateQrCode = async () => {
  if (!await registerFormRef.value.validate()) return;

  loading.value = true;
  try {
    const response = await register(registerForm.username);
    if (response.success) {
      tempId.value = response.data.tempId;
      otpauthUrl.value = response.data.otpauth_url;
      showQrCode.value = true;
      currentStep.value = 'verify';
    } else {
      ElMessage.error(response.message);
    }
  } catch (error) {
    ElMessage.error(t('register.networkError'));
    console.error('Registration error:', error);
  } finally {
    loading.value = false;
  }
};

const handleVerifyCode = async () => {
  if (!await registerFormRef.value.validate()) return;

  loading.value = true;
  try {
    const response = await verifyRegister({
      tempId: tempId.value,
      code: registerForm.code
    });

    if (response.success) {
      ElMessage.success(t('register.registerSuccess'));
      router.push('/login');
    } else {
      ElMessage.error(response.message);
    }
  } catch (error) {
    ElMessage.error(t('register.networkError'));
    console.error('Verification error:', error);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* 复用登录页面样式并添加注册特有样式 */
.form-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin: 20px auto;
  max-width: 800px;
  padding: 30px;
  background-color: #fff;
  width: 90%;

}

.login-container {
  padding: 20px;
  margin: 20px auto;
  max-width: 1200px;
}

.login-card {
  padding: 20px;
  width: 100%;
}

.qr-code-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.qr-code {
  margin-bottom: 15px;
}

.verification-help {
  color: #606266;
  font-size: 14px;
  text-align: center;
  max-width: 250px;
}
</style>
