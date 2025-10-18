package com.vitrinedecraques.app.ui.auth

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.vitrinedecraques.app.data.auth.AuthData
import com.vitrinedecraques.app.data.auth.AuthRepository
import com.vitrinedecraques.app.data.auth.InvalidCredentialsException
import com.vitrinedecraques.app.data.auth.SessionUser
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch

data class AuthUiState(
    val isLoading: Boolean = true,
    val isAuthenticated: Boolean = false,
    val user: SessionUser? = null,
)

data class LoginUiState(
    val isSubmitting: Boolean = false,
    val error: String? = null,
)

class AuthViewModel(
    application: Application,
    private val repository: AuthRepository = AuthRepository(application.applicationContext)
) : AndroidViewModel(application) {

    private val _authState = MutableStateFlow(AuthUiState())
    val authState: StateFlow<AuthUiState> = _authState.asStateFlow()

    private val _loginState = MutableStateFlow(LoginUiState())
    val loginState: StateFlow<LoginUiState> = _loginState.asStateFlow()

    init {
        viewModelScope.launch {
            repository.authState.collectLatest { data ->
                updateAuthState(data)
            }
        }
    }

    private fun updateAuthState(data: AuthData) {
        _authState.value = AuthUiState(
            isLoading = false,
            isAuthenticated = data.cookie != null,
            user = data.user,
        )
    }

    fun login(email: String, password: String) {
        if (_loginState.value.isSubmitting) return
        _loginState.value = LoginUiState(isSubmitting = true, error = null)
        viewModelScope.launch {
            val result = repository.login(email.trim(), password)
            result.onSuccess {
                _loginState.value = LoginUiState(isSubmitting = false, error = null)
            }.onFailure { error ->
                val message = when (error) {
                    is InvalidCredentialsException -> error.message ?: "E-mail ou senha inválidos."
                    else -> error.message ?: "Não foi possível entrar. Tente novamente."
                }
                _loginState.value = LoginUiState(isSubmitting = false, error = message)
            }
        }
    }

    fun clearLoginError() {
        if (_loginState.value.error != null) {
            _loginState.value = _loginState.value.copy(error = null)
        }
    }
}
