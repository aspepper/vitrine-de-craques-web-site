package com.example.vitrinedecraques

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import com.example.vitrinedecraques.ui.theme.VitrineDeCraquesTheme
import com.example.vitrinedecraques.ui.VitrineDeCraquesApp

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            VitrineDeCraquesTheme {
                Surface(modifier = Modifier.fillMaxSize()) {
                    VitrineDeCraquesApp()
                }
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun AppPreview() {
    VitrineDeCraquesTheme {
        Surface(modifier = Modifier.fillMaxSize()) {
            VitrineDeCraquesApp()
        }
    }
}