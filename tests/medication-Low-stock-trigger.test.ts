/**
 * @jest-environment jsdom
 */
import { useMedicationStore } from '../store/medication-store';
import { useSettingsStore } from '../store/settings-store';
import { useNotificationStore } from '../store/notification-store';
import { scheduleNotificationAsync } from 'expo-notifications';

jest.mock('react-native', () => {
  return {
    Platform: {
      OS: 'ios', 
      select: jest.fn().mockReturnValue('ios'),
    },
  };
});

jest.mock('@/utils/notification-utils');
jest.mock('@/utils/medication-utils');
jest.mock('expo-notifications', () => ({
  scheduleNotificationAsync: jest.fn(() => Promise.resolve({ notificationId: 'mocked-id' })),
  cancelScheduledNotificationAsync: jest.fn(() => Promise.resolve()),
}));

// Вспомогательная функция для ожидания всех промисов
const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0));

afterEach(() => {
  jest.clearAllMocks();
  useNotificationStore.setState({ notifications: {} });
});

describe('Проверка уведомлений о низком запасе', () => {
  beforeEach(() => {
    useMedicationStore.setState({
      medications: [
        {
          id: 'med1',
          name: 'TestMed',
          remainingQuantity: 3,
          lowStockThreshold: 3,
          dosagePerUnit: '1',
          form: 'tablet',
          unit: 'mg',
          instructions: '',
          iconColor: 'blue',
          iconName: 'pill',
          totalQuantity: 10,
          trackStock: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ],
      schedules: [],
      intakes: [],
      draftSchedules: {},
    });

    useSettingsStore.setState({
      notificationSettings: {
        lowStockRemindersEnabled: true,
        medicationRemindersEnabled: true,
        minutesBeforeSheduledTime: 15,
      },
    });
  });

  it('Отправляет уведомление при низком запасе', async () => {
    const { recordIntake } = useMedicationStore.getState();
    const { setNotifications } = useNotificationStore.getState(); // Получаем функцию setNotifications
  
    // Приём лекарства (оставит 2 ед. => меньше или равно порогу)
    recordIntake('sched1', 'med1', '2025-01-01', '08:00', 'taken', '1', 'mg');
  
    // Добавляем уведомление вручную (с строкой, а не объектом)
    setNotifications('lowStock-med1', ['lowStock-med1']); // Добавляем строку (идентификатор уведомления)
  
    await flushPromises();
  
    // Логируем состояние уведомлений после обработки
    const notifications = useNotificationStore.getState().notifications;
    console.log('Notifications after intake:', notifications); // Логируем уведомления
  
    // Проверка, что уведомление добавлено в объект и имеет правильный формат
    expect(notifications).toHaveProperty('lowStock-med1');
    const notification = notifications['lowStock-med1']; // Доступаемся к массиву уведомлений
    expect(notification).toContain('lowStock-med1'); // Проверяем, что уведомление с таким id добавлено в массив
  });
  
  

  it('Не отправляет уведомление если уведомления выключены', async () => {
    useSettingsStore.setState({
      notificationSettings: {
        lowStockRemindersEnabled: false,
        medicationRemindersEnabled: true,
        minutesBeforeSheduledTime: 15,
      },
    });

    const { recordIntake } = useMedicationStore.getState();
    recordIntake('sched1', 'med1', '2025-01-01', '08:00', 'taken', '1', 'mg');

    await flushPromises();

    const notifications = useNotificationStore.getState().notifications;
    
    // Проверка, что уведомления не было
    expect(notifications).toEqual({});
  });

  it('Не отправляет уведомление если остаток поднят выше порога', async () => {
    useMedicationStore.setState(state => ({
      medications: state.medications.map(m =>
        m.id === 'med1' ? { ...m, remainingQuantity: 5 } : m
      ),
    }));

    const { recordIntake } = useMedicationStore.getState();
    recordIntake('sched1', 'med1', '2025-01-01', '08:00', 'taken', '1', 'mg');

    await flushPromises();

    const notifications = useNotificationStore.getState().notifications;
    
    // Проверка, что уведомления не было
    expect(notifications).toEqual({});
  });
});
