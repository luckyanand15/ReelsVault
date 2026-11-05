package com.client

import android.content.Intent
import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

/**
 * Share-sheet target: shows only the Add Reel drawer (the "ShareReel" JS component)
 * over the app that shared the link, and closes back to it.
 */
class ShareActivity : ReactActivity() {

  override fun getMainComponentName(): String = "ShareReel"

  override fun createReactActivityDelegate(): ReactActivityDelegate =
      object : DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled) {
        override fun getLaunchOptions(): Bundle =
            Bundle().apply {
              putString("sharedText", this@ShareActivity.intent?.getStringExtra(Intent.EXTRA_TEXT))
            }
      }
}
