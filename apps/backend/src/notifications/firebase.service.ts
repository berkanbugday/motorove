import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { MulticastMessage, Message } from 'firebase-admin/messaging';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private initialized = false;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    this.initializeFirebaseApp();
  }

  private initializeFirebaseApp(): void {
    try {
      if (!this.initialized && admin.apps.length === 0) {
        // For production use, the service account should be stored securely
        const serviceAccount = this.configService.get<string>(
          'FIREBASE_SERVICE_ACCOUNT',
        );

        if (!serviceAccount) {
          this.logger.warn(
            'Firebase service account not found. Notifications will not work.',
          );
          return;
        }

        let parsedServiceAccount: object;
        try {
          parsedServiceAccount = JSON.parse(serviceAccount);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Error parsing JSON';
          this.logger.error(
            'Failed to parse Firebase service account JSON',
            errorMessage,
          );
          return;
        }

        admin.initializeApp({
          credential: admin.credential.cert(
            parsedServiceAccount as admin.ServiceAccount,
          ),
          // Optional database URL if you're using Firebase Database
          databaseURL: this.configService.get<string>('FIREBASE_DATABASE_URL'),
        });

        this.initialized = true;
        this.logger.log('Firebase Admin SDK initialized successfully');
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        'Failed to initialize Firebase Admin SDK',
        errorMessage,
      );
    }
  }

  /**
   * Send a push notification to a single device
   */
  async sendPushNotification(
    token: string,
    title: string,
    body: string,
    data: Record<string, string> = {},
  ): Promise<string | null> {
    if (!this.initialized) {
      this.logger.warn('Firebase not initialized, cannot send notification');
      return null;
    }

    const message: Message = {
      notification: {
        title,
        body,
      },
      data,
      token,
    };

    try {
      const response = await admin.messaging().send(message);
      this.logger.debug(`Successfully sent message: ${response}`);
      return response;
    } catch (error) {
      this.logger.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Send push notifications to multiple devices
   */
  async sendMulticastPushNotification(
    tokens: string[],
    title: string,
    body: string,
    data: Record<string, string> = {},
  ): Promise<admin.messaging.BatchResponse | null> {
    if (!this.initialized) {
      this.logger.warn(
        'Firebase not initialized, cannot send multicast notification',
      );
      return null;
    }

    if (!tokens.length) {
      this.logger.warn('No tokens provided for multicast notification');
      return null;
    }

    const message: MulticastMessage = {
      notification: {
        title,
        body,
      },
      data,
      tokens,
    };

    try {
      const response = await admin.messaging().sendEachForMulticast(message);
      this.logger.debug(
        `Successfully sent multicast message: ${response.successCount} success, ${response.failureCount} failure`,
      );
      return response;
    } catch (error) {
      this.logger.error('Error sending multicast message:', error);
      throw error;
    }
  }
}
