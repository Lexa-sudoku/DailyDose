// __tests__/notification-store.test.ts
jest.mock('@react-native-async-storage/async-storage');

import { useNotificationStore } from '../store/notification-store';

describe('Notification Store', () => {
  beforeEach(() => {
    // Очищаем состояние перед каждым тестом
    useNotificationStore.setState({ notifications: {} });
  });

  it('should initialize with empty notifications', () => {
    const { notifications } = useNotificationStore.getState();
    expect(notifications).toEqual({});
  });

  it('should set notifications for schedule', () => {
    const { setNotifications, getNotifications } = useNotificationStore.getState();
    
    setNotifications('schedule-1', ['notif-1', 'notif-2']);
    
    expect(getNotifications('schedule-1')).toEqual(['notif-1', 'notif-2']);
    expect(useNotificationStore.getState().notifications).toEqual({
      'schedule-1': ['notif-1', 'notif-2']
    });
  });

  it('should not overwrite old notifications when setting new ones', () => {
    const { setNotifications, getNotifications } = useNotificationStore.getState();
    
    // Устанавливаем первые уведомления
    setNotifications('schedule-1', ['old-1', 'old-2']);
    
    // Добавляем новые уведомления
    setNotifications('schedule-1', ['new-1']);
    
    // Проверяем что старые заменились на новые
    expect(getNotifications('schedule-1')).toEqual(['new-1']);
  });

  it('should clear notifications for specific schedule', () => {
    const { setNotifications, clearNotifications, getNotifications } = useNotificationStore.getState();
    
    setNotifications('schedule-1', ['notif-1']);
    setNotifications('schedule-2', ['notif-2']);
    
    clearNotifications('schedule-1');
    
    expect(getNotifications('schedule-1')).toEqual([]);
    expect(getNotifications('schedule-2')).toEqual(['notif-2']);
  });

  it('should clear all notifications', () => {
    const { setNotifications, clearAllNotifications, getNotifications } = useNotificationStore.getState();
    
    setNotifications('schedule-1', ['notif-1']);
    setNotifications('schedule-2', ['notif-2']);
    
    clearAllNotifications();
    
    expect(getNotifications('schedule-1')).toEqual([]);
    expect(getNotifications('schedule-2')).toEqual([]);
    expect(useNotificationStore.getState().notifications).toEqual({
      'schedule-1': [],
      'schedule-2': []
    });
  });

  it('should return empty array for non-existent schedule', () => {
    const { getNotifications } = useNotificationStore.getState();
    expect(getNotifications('non-existent')).toEqual([]);
  });
});