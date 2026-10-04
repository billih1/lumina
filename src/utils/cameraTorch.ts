/**
 * Real Device Hardware Torch Controller
 * Optimized for Android Chrome and mobile browsers with WebRTC Track Torch API.
 */

export interface TorchHardwareStatus {
  isSupported: boolean;
  isActive: boolean;
  isConnecting: boolean;
  error: string | null;
  hasTrack: boolean;
}

class CameraTorchController {
  private mediaStream: MediaStream | null = null;
  private videoTrack: MediaStreamTrack | null = null;
  private torchSupported: boolean = false;
  private isCurrentlyOn: boolean = false;
  private isConnecting: boolean = false;
  private lastErrorMessage: string | null = null;

  /**
   * Request back camera access and inspect torch capability
   */
  public async initTorch(): Promise<boolean> {
    if (this.isConnecting) return this.torchSupported;
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      this.torchSupported = false;
      this.lastErrorMessage = 'Camera API not supported on this browser';
      return false;
    }

    try {
      this.isConnecting = true;
      this.lastErrorMessage = null;

      // Request rear/back camera with environment facing mode
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });

      this.mediaStream = stream;
      const track = stream.getVideoTracks()[0];
      if (!track) {
        this.torchSupported = false;
        this.lastErrorMessage = 'No video track found';
        return false;
      }

      this.videoTrack = track;
      
      // Inspect hardware capabilities
      let hasTorchCapability = false;
      if (typeof track.getCapabilities === 'function') {
        const capabilities = track.getCapabilities() as { torch?: boolean };
        hasTorchCapability = Boolean(capabilities.torch);
      }

      // If capabilities doesn't list torch explicitly, test applyConstraints probe
      if (!hasTorchCapability) {
        try {
          // Attempt non-destructive probe
          await track.applyConstraints({
            advanced: [{ torch: false } as MediaTrackConstraintSet],
          });
          hasTorchCapability = true;
        } catch {
          hasTorchCapability = false;
        }
      }

      this.torchSupported = hasTorchCapability;
      if (!hasTorchCapability) {
        this.lastErrorMessage = 'Hardware LED flash not detected on this camera';
      }

      return this.torchSupported;
    } catch (err: unknown) {
      this.torchSupported = false;
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          this.lastErrorMessage = 'Camera permission was denied. Allow camera in Android settings to use real LED flash.';
        } else {
          this.lastErrorMessage = err.message || 'Could not access camera';
        }
      }
      return false;
    } finally {
      this.isConnecting = false;
    }
  }

  /**
   * Set torch power state on the physical LED
   */
  public async setTorchState(on: boolean): Promise<boolean> {
    this.isCurrentlyOn = on;

    if (!this.videoTrack || !this.torchSupported) {
      if (on && !this.videoTrack) {
        const supported = await this.initTorch();
        if (!supported || !this.videoTrack) return false;
      } else {
        return false;
      }
    }

    try {
      if (this.videoTrack) {
        await this.videoTrack.applyConstraints({
          advanced: [{ torch: on } as MediaTrackConstraintSet],
        });
        return true;
      }
    } catch (err: unknown) {
      console.warn('Torch constraint error:', err);
    }

    return false;
  }

  /**
   * Stop all video tracks to release camera hardware completely
   */
  public stop() {
    if (this.videoTrack) {
      try {
        this.videoTrack.applyConstraints({
          advanced: [{ torch: false } as MediaTrackConstraintSet],
        }).catch(() => {});
      } catch {}
      this.videoTrack.stop();
      this.videoTrack = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((t) => t.stop());
      this.mediaStream = null;
    }
    this.isCurrentlyOn = false;
  }

  public isSupported(): boolean {
    return this.torchSupported;
  }

  public isOn(): boolean {
    return this.isCurrentlyOn;
  }

  public getErrorMessage(): string | null {
    return this.lastErrorMessage;
  }
}

export const cameraTorch = new CameraTorchController();
