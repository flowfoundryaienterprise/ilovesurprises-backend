export interface UserNotificationDTO {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  actionUrl: string | null;
  metadata: any;
  createdAt: Date;
}
