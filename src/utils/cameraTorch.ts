/**
 * Real Device Hardware Torch Controller
 * Optimized for Android Chrome and mobile browsers with WebRTC Track Torch API.
 * Features asynchronous command queuing to support ultra-fast strobe / SOS pulsing.
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
  private applyingConstraints: boolean = false;
  private pendingState: boolean | null = null;

  /**
   * Request back camera access and inspect torch capability
   */
  public async initTorch(): Promise<boolean> {
    if (this.videoTrack && this.torchSupported) {
      return true;
    }
    if (this.isConnecting) {
      // Wait for existing connection
      while (this.isConnecting) {
        await new Promise((r) => setTimeout(r, 50));
      }
      return this.torchSupported;
    }

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      this.torchSupported = false;
      this.lastErrorMessage = 'Camera API not supported on this browser';
      return false;
    }

    try {
      this.isConnecting = true;
      this.lastErrorMessage = null;

      let stream: MediaStream | null = null;

      // Primary attempt: rear camera environment
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            advanced: [{ torch: true } as MediaTrackConstraintSet],
          },
        });
      } catch {
        // Fallback standard constraints
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' },
          });
        } catch {
          // Final fallback: any video camera
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
        }
      }

      if (!stream) {
        this.torchSupported = false;
        this.lastErrorMessage = 'Could not initialize video stream';
        return false;
      }

      this.mediaStream = stream;
      const track = stream.getVideoTracks()[0];
      if (!track) {
        this.torchSupported = false;
        this.lastErrorMessage = 'No camera track available';
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
        this.lastErrorMessage = 'Hardware LED flash not detected on this camera device';
      }

      return this.torchSupported;
    } catch (err: unknown) {
      this.torchSupported = false;
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          this.lastErrorMessage =
            'Camera permission is required to turn on the physical LED flashlight.';
        } else {
          this.lastErrorMessage = err.message || 'Could not access device camera';
        }
      }
      return false;
    } finally {
      this.isConnecting = false;
    }
  }

  /**
   * Set torch power state on the physical LED with queued async execution
   */
  public async setTorchState(on: boolean): Promise<boolean> {
    this.pendingState = on;

    if (this.applyingConstraints) {
      return this.isCurrentlyOn;
    }

    this.applyingConstraints = true;

    try {
      while (this.pendingState !== null) {
        const targetState = this.pendingState;
        this.pendingState = null;

        if (!this.videoTrack && targetState) {
          await this.initTorch();
        }

        if (this.videoTrack && this.torchSupported) {
          try {
            await this.videoTrack.applyConstraints({
              advanced: [{ torch: targetState } as MediaTrackConstraintSet],
            });
            this.isCurrentlyOn = targetState;
          } catch (err) {
            console.warn('Torch applyConstraints error:', err);
          }
        }
      }
    } finally {
      this.applyingConstraints = false;
    }

    return this.isCurrentlyOn;
  }

  /**
   * Stop all video tracks to release camera hardware completely
   */
  public stop() {
    this.pendingState = false;
    if (this.videoTrack) {
      try {
        this.videoTrack
          .applyConstraints({
            advanced: [{ torch: false } as MediaTrackConstraintSet],
          })
          .catch(() => {});
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
