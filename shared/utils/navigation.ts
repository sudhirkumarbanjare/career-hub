export interface NavigationScreen<P = any> {
  name: string;
  params?: P;
}

export class NavigationStackManager<P = any> {
  private stack: NavigationScreen<P>[] = [];

  constructor(initialStack: NavigationScreen<P>[] = []) {
    this.stack = [...initialStack];
  }

  push(name: string, params?: P): void {
    this.stack.push({ name, params });
  }

  pop(): NavigationScreen<P> | undefined {
    return this.stack.pop();
  }

  popToTop(): void {
    if (this.stack.length > 0) {
      this.stack = [this.stack[0]];
    }
  }

  replace(name: string, params?: P): void {
    if (this.stack.length > 0) {
      this.stack[this.stack.length - 1] = { name, params };
    } else {
      this.stack.push({ name, params });
    }
  }

  current(): NavigationScreen<P> | null {
    return this.stack.length > 0 ? this.stack[this.stack.length - 1] : null;
  }

  canGoBack(): boolean {
    return this.stack.length > 0;
  }

  depth(): number {
    return this.stack.length;
  }

  clear(): void {
    this.stack = [];
  }

  getStack(): NavigationScreen<P>[] {
    return [...this.stack];
  }
}

/**
 * Handles Android double-tap to exit on root screen.
 * Shows a toast on first press, and allows exit on second press within 2000ms.
 */
let lastBackPressTime = 0;

export const handleRootBackPress = (exitMessage: string = 'Press back again to exit'): boolean => {
  try {
    const RN = require('react-native');
    const { BackHandler, ToastAndroid, Platform } = RN;

    if (Platform && Platform.OS !== 'android') return false;

    const now = Date.now();
    if (now - lastBackPressTime < 2000) {
      if (BackHandler && typeof BackHandler.exitApp === 'function') {
        BackHandler.exitApp();
      }
      return true;
    }

    lastBackPressTime = now;
    if (ToastAndroid && typeof ToastAndroid.show === 'function') {
      ToastAndroid.show(exitMessage, ToastAndroid.SHORT);
    }
    return true;
  } catch (e) {
    return false;
  }
};
