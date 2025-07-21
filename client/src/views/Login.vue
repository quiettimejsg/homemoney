<template>
  <div class="login-container">
    <div class="login-card">
      <div class="language-selector">
  <el-select v-model="currentLanguage" @change="handleLanguageChange" size="small">
    <el-option label="中文" value="zh-CL"></el-option>
    <el-option label="English" value="en-US"></el-option>
  </el-select>
</div>
<h1 class="title">{{ t('login.title') }}</h1>
      <el-form ref="loginFormRef" :model="loginForm" :rules="rules" class="login-form">
        <el-form-item prop="account">
          <el-input
            v-model="loginForm.account"
            :placeholder="t('login.account_placeholder')"
            prefix-icon="User"
            autocomplete="off"
          ></el-input>
        </el-form-item>
        <el-form-item prop="code">
          <el-input
            v-model="loginForm.code"
            :placeholder="t('login.code_placeholder')"
            prefix-icon="Key"
            maxlength="6"
            autocomplete="off"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            class="login-button"
            :loading="loading"
            @click="handleLogin"
          >
            {{ t('login.submit') }}
          </el-button>
          <div class="register-link">
            {{ t('login.noAccount') }} <router-link to="/register">{{ t('login.registerHere') }}</router-link>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n';
import { changeLanguage } from '@/locales/i18n';
import { loginWith2FA } from '@/api/auth';
import { STORAGE_KEYS } from '@/utils/constants';
import axios from 'axios'; // Added axios import
defineOptions({ name: 'LoginView' });
const loginFormRef = ref(null);

const router = useRouter();
const { t, locale } = useI18n();
const currentLanguage = ref(locale.value);

const handleLanguageChange = (lang) => {
  currentLanguage.value = lang;
  changeLanguage(lang);
};
const loading = ref(false);
const loginForm = reactive({
  account: '',
  code: ''
});

const rules = {
  account: [
    { required: true, message: t('login.account_required'), trigger: 'blur' }
  ],
  code: [
    { required: true, message: t('login.code_required'), trigger: ['submit'] }
  ]
};

const handleLogin = async () => {
  const valid = await loginFormRef.value.validate();
  if (valid) {
    // 手动验证验证码长度
    if (loginForm.code.length !== 6) {
      ElMessage.error(t('login.code_length'));
      return;
    }
    try {
      loading.value = true;
      const response = await loginWith2FA(loginForm);
      if (response.success) {
        // 确保令牌已存储
        const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
        console.log('Before navigation - Stored token exists:', !!storedToken);
        if (!storedToken) {
          console.error('Token missing before navigation!');
          ElMessage.error(t('login.token_storage_failed'));
          return;
        }
        ElMessage.success(t('login.success'));
        localStorage.setItem(STORAGE_KEYS.AUTHENTICATED, 'true');
        // 登录成功后，获取完整用户信息并存储
        try {
          const userRes = await axios.get('/api/auth/user', {
            headers: { Authorization: `Bearer ${storedToken}` }
          });
          console.log('获取到的用户信息:', userRes.data);
          if (userRes.data && userRes.data.data) {
            console.log('准备存储userInfo:', userRes.data.data);
            localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userRes.data.data));
            console.log('userInfo已存储:', localStorage.getItem(STORAGE_KEYS.USER_INFO));
          } else {
            console.error('userRes.data.data 不存在');
          }
        } catch (e) {
          console.error('登录后获取用户信息失败:', e);
        }
        // 使用nextTick确保存储操作完成
        await nextTick();
        router.push('/');
      } else {
        ElMessage.error(response.message || t('login.failed'));
      }
    } catch (error) {
      ElMessage.error(t('login.network_error'));
      console.error('Login error:', error);
    } finally {
      loading.value = false;
    }
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.login-card {
  width: 400px;
  padding: 2rem;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.language-selector {
  text-align: right;
  margin-bottom: 1rem;
}

.title {
  text-align: center;
  margin-bottom: 2rem;
  color: #1890ff;
}

.login-button {
  width: 100%;
}
</style>
