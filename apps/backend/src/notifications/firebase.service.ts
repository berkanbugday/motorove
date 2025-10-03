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
        // Read individual Firebase configuration variables
        const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
        const privateKey = this.configService.get<string>(
          'FIREBASE_PRIVATE_KEY',
        );
        const clientEmail = this.configService.get<string>(
          'FIREBASE_CLIENT_EMAIL',
        );

        // Validate required fields
        if (!projectId || !privateKey || !clientEmail) {
          this.logger.warn(
            'Firebase configuration incomplete. Missing required fields (project_id, private_key, or client_email). Notifications will not work.',
          );
          return;
        }

        // Construct service account object
        const serviceAccount: admin.ServiceAccount = {
          projectId,
          privateKey: privateKey.replace(/\\n/g, '\n'), // Handle escaped newlines
          clientEmail,
        };

        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          // Optional database URL if you're using Firebase Database
          // databaseURL: this.configService.get<string>('FIREBASE_DATABASE_URL'),
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
      data: { ...data },
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
