import React from 'react';
import { Keyboard, KeyboardAvoidingView, Platform } from 'react-native';

// KeyboardAvoidingView that also works when it mounts with the keyboard
// already open. The stock one only lifts after a keyboard "show" event, but
// moving focus from one screen's input straight to the next screen's
// autoFocus input often keeps the keyboard up, so no event fires and the new
// screen's footer stays hidden behind the keyboard until it is reopened.
// Here we seed it with the current keyboard metrics on mount; its first
// onLayout then applies the offset.
class SeededKeyboardAvoidingView extends KeyboardAvoidingView {
  componentDidMount() {
    super.componentDidMount();
    const metrics = Keyboard.isVisible() ? Keyboard.metrics() : null;
    if (metrics && this._keyboardEvent == null) {
      this._keyboardEvent = { endCoordinates: metrics, duration: 0 };
      if (this._frame) {
        this._updateBottomIfNecessary();
      }
    }
  }
}

export default function KeyboardAvoider({ behavior, ...props }) {
  return (
    <SeededKeyboardAvoidingView
      behavior={behavior ?? (Platform.OS === 'ios' ? 'padding' : 'height')}
      {...props}
    />
  );
}
